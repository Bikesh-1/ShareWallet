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

    if (typeof orderId !== "string" || !orderId.startsWith("SW_CONTRIBUTION_")) {
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
