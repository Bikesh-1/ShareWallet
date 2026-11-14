import prisma from "@/lib/prisma";
import { verifyCashfreeWebhook } from "@/lib/cashfree/webhook";
import { settleInternalWalletRequest } from "@/lib/payout/settleInternalWalletRequest";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }
    if (!verifyCashfreeWebhook(rawBody, timestamp, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const order = payload?.data?.order;
    const payment = payload?.data?.payment;
    const orderId = order?.order_id;
    const paymentStatus = payment?.payment_status;

    if (typeof orderId !== "string") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (orderId.startsWith("SW_REPAYMENT_")) {
      const transaction = await prisma.transaction.findFirst({
        where: { providerReference: orderId, type: "LOAN_REPAYMENT", provider: "CASHFREE" },
      });
      if (!transaction || !transaction.requestId || !transaction.groupId || !transaction.senderId) {
        return NextResponse.json({ error: "Matching repayment not found" }, { status: 404 });
      }
      const request = await prisma.sentrequest.findFirst({
        where: { id: transaction.requestId, userId: transaction.senderId, groupId: transaction.groupId },
      });
      const amountMatches = Number(order?.order_amount) === transaction.amount;
      const currencyMatches = order?.order_currency === "INR";
      if (!request || !amountMatches || !currencyMatches) {
        console.error("CASHFREE REPAYMENT MISMATCH", { orderId, transactionId: transaction.id });
        return NextResponse.json({ error: "Repayment details did not match" }, { status: 409 });
      }
      if (paymentStatus === "SUCCESS") {
        await prisma.$transaction(async (tx) => {
          const claimed = await tx.transaction.updateMany({
            where: { id: transaction.id, status: "PENDING", requestId: request.id, groupId: request.groupId, senderId: request.userId, amount: transaction.amount },
            data: { status: "SUCCESS" },
          });
          if (claimed.count !== 1) return;
          const payout = await tx.transaction.findFirst({
            where: { requestId: request.id, groupId: request.groupId, receiverId: request.userId, type: "PAYOUT", status: "SUCCESS" },
          });
          if (!payout) throw new Error("Original payout not found for repayment.");
          const totals = await tx.transaction.aggregate({
            where: { requestId: request.id, type: "LOAN_REPAYMENT", status: "SUCCESS" },
            _sum: { amount: true },
          });
          if ((totals._sum.amount || 0) > payout.amount) throw new Error("Repayment total exceeds original payout.");
          await tx.group.update({ where: { id: request.groupId }, data: { totalAmount: { increment: transaction.amount } } });
          await tx.notification.create({
            data: { userId: request.userId, groupId: request.groupId, requestId: request.id, type: "PAYMENT_SUCCESS", title: "Loan repayment received", message: `Your Cashfree repayment of ₹${transaction.amount} has been received by the group.` },
          });
        }, { isolationLevel: "Serializable" });
      } else if (paymentStatus === "FAILED" || paymentStatus === "USER_DROPPED") {
        await prisma.transaction.updateMany({ where: { id: transaction.id, status: "PENDING" }, data: { status: "FAILED" } });
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!orderId.startsWith("SW_CONTRIBUTION_")) {
      return NextResponse.json({ received: true }, { status: 200 });
    }


    const contributionId = orderId.slice("SW_CONTRIBUTION_".length).replace(/_\d+$/, "");
    const [contribution, transaction] = await Promise.all([
      prisma.contribution.findUnique({ where: { id: contributionId } }),
      prisma.transaction.findFirst({
        where: { providerReference: orderId, type: "CONTRIBUTION", provider: "CASHFREE" },
      }),
    ]);

    if (!contribution || !transaction) {
      return NextResponse.json({ error: "Matching contribution payment not found" }, { status: 404 });
    }

    const amountMatches = Number(order?.order_amount) === transaction.amount &&
      transaction.amount === contribution.amount;
    const currencyMatches = order?.order_currency === "INR";
    const ownershipMatches = transaction.senderId === contribution.userId &&
      transaction.groupId === contribution.groupId;

    if (!amountMatches || !currencyMatches || !ownershipMatches) {
      console.error("CASHFREE WEBHOOK PAYMENT MISMATCH", {
        orderId,
        transactionId: transaction.id,
        orderAmount: order?.order_amount,
        transactionAmount: transaction.amount,
        currency: order?.order_currency,
      });
      return NextResponse.json({ error: "Payment details did not match" }, { status: 409 });
    }

    if (paymentStatus === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.transaction.updateMany({
          where: { id: transaction.id, status: "PENDING" },
          data: { status: "SUCCESS" },
        });
        if (claimed.count !== 1) return;

        const contributionResult = await tx.contribution.updateMany({
          where: {
            id: contribution.id,
            userId: transaction.senderId!,
            groupId: transaction.groupId!,
            amount: transaction.amount,
            status: { not: "PAID" },
          },
          data: { status: "PAID", paidAt: new Date() },
        });
        if (contributionResult.count !== 1) {
          throw new Error("Contribution was already processed or did not match the payment");
        }

        await tx.group.update({
          where: { id: contribution.groupId },
          data: { totalAmount: { increment: contribution.amount } },
        });
        await tx.notification.create({
          data: {
            userId: contribution.userId,
            groupId: contribution.groupId,
            type: "PAYMENT_SUCCESS",
            title: "Contribution successful",
            message: `Your contribution of ₹${contribution.amount} has been received.`,
          },
        });
      });

      if (contribution.requestId) {
        await settleInternalWalletRequest(contribution.requestId);
      }
    } else if (paymentStatus === "FAILED" || paymentStatus === "USER_DROPPED") {
      await prisma.transaction.updateMany({
        where: { id: transaction.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("CASHFREE WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
