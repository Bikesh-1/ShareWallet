import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cashfreeConfig } from "@/lib/cashfree/config";
import { getServerSession } from "next-auth";
import { settleInternalWalletRequest } from "@/lib/payout/settleInternalWalletRequest";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orderId = new URL(req.url).searchParams.get("order_id");
    if (!orderId) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    if (orderId.startsWith("SW_REPAYMENT_")) {
      const repayment = await prisma.transaction.findFirst({
        where: { providerReference: orderId, type: "LOAN_REPAYMENT", senderId: user.id, provider: "CASHFREE" },
      });
      if (!repayment || !repayment.requestId || !repayment.groupId) return NextResponse.json({ error: "Repayment not found" }, { status: 404 });
      if (repayment.status === "PENDING") {
        if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) return NextResponse.json({ error: "Cashfree credentials are not configured" }, { status: 500 });
        const providerResponse = await fetch(`${cashfreeConfig.baseUrl}/pg/orders/${encodeURIComponent(orderId)}`, {
          method: "GET",
          headers: { "x-client-id": cashfreeConfig.clientId, "x-client-secret": cashfreeConfig.clientSecret, "x-api-version": "2025-01-01" },
          cache: "no-store",
        });
        const order = await providerResponse.json();
        if (!providerResponse.ok) return NextResponse.json({ error: "Cashfree could not verify this repayment right now" }, { status: 502 });
        const amountMatches = Number(order.order_amount) === repayment.amount;
        const currencyMatches = order.order_currency === "INR";
        if (order.order_status === "PAID" && amountMatches && currencyMatches) {
          await prisma.$transaction(async (tx) => {
            const claimed = await tx.transaction.updateMany({
              where: { id: repayment.id, status: "PENDING", senderId: user.id, requestId: repayment.requestId, groupId: repayment.groupId, amount: repayment.amount },
              data: { status: "SUCCESS" },
            });
            if (claimed.count !== 1) return;
            const loan = await tx.sentrequest.findFirst({ where: { id: repayment.requestId!, userId: user.id, groupId: repayment.groupId! } });
            const payout = await tx.transaction.findFirst({
              where: { requestId: repayment.requestId!, groupId: repayment.groupId!, receiverId: user.id, type: "PAYOUT", status: "SUCCESS" },
            });
            if (!loan || !payout) throw new Error("Original loan payout was not found.");
            const totals = await tx.transaction.aggregate({
              where: { requestId: loan.id, type: "LOAN_REPAYMENT", status: "SUCCESS" },
              _sum: { amount: true },
            });
            if ((totals._sum.amount || 0) > payout.amount) throw new Error("Repayment total exceeds original payout.");
            await tx.group.update({ where: { id: loan.groupId }, data: { totalAmount: { increment: repayment.amount } } });
            await tx.notification.create({
              data: { userId: user.id, groupId: loan.groupId, requestId: loan.id, type: "PAYMENT_SUCCESS", title: "Loan repayment received", message: `Your Cashfree repayment of ₹${repayment.amount} has been received by the group.` },
            });
          }, { isolationLevel: "Serializable" });
        } else if (order.order_status === "EXPIRED" || order.order_status === "TERMINATED") {
          await prisma.transaction.updateMany({ where: { id: repayment.id, status: "PENDING" }, data: { status: "FAILED" } });
        } else if (order.order_status === "PAID" && (!amountMatches || !currencyMatches)) {
          return NextResponse.json({ error: "Repayment details did not match. Contact support." }, { status: 409 });
        }
      }
      const latestRepayment = await prisma.transaction.findUnique({ where: { id: repayment.id }, select: { status: true } });
      return NextResponse.json({ status: latestRepayment?.status || repayment.status }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
    }

    if (!orderId.startsWith("SW_CONTRIBUTION_")) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const transaction = await prisma.transaction.findFirst({
      where: {
        providerReference: orderId,
        type: "CONTRIBUTION",
        senderId: user.id,
        provider: "CASHFREE",
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // A webhook can be delayed or missed. Confirm the order directly with Cashfree
    // before changing any local payment state.
    if (transaction.status === "PENDING") {
      if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
        return NextResponse.json({ error: "Cashfree credentials are not configured" }, { status: 500 });
      }

      const providerResponse = await fetch(
        `${cashfreeConfig.baseUrl}/pg/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          headers: {
            "x-client-id": cashfreeConfig.clientId,
            "x-client-secret": cashfreeConfig.clientSecret,
            "x-api-version": "2025-01-01",
          },
          cache: "no-store",
        }
      );

      const order = await providerResponse.json();
      if (!providerResponse.ok) {
        console.error("CASHFREE ORDER STATUS ERROR:", order);
        return NextResponse.json({ error: "Cashfree could not verify this payment right now" }, { status: 502 });
      }

      const paid = order.order_status === "PAID";
      const amountMatches = Number(order.order_amount) === Number(transaction.amount);
      const currencyMatches = order.order_currency === "INR";

      if (paid && amountMatches && currencyMatches) {
        await prisma.$transaction(async (tx) => {
          const claimed = await tx.transaction.updateMany({
            where: { id: transaction.id, status: "PENDING" },
            data: { status: "SUCCESS" },
          });
          if (claimed.count !== 1) return;

          const contributionId = orderId
            .slice("SW_CONTRIBUTION_".length)
            .replace(/_\d+$/, "");
          const contribution = await tx.contribution.findUnique({
            where: { id: contributionId },
          });

          if (
            !contribution ||
            contribution.userId !== user.id ||
            contribution.amount !== transaction.amount ||
            contribution.groupId !== transaction.groupId
          ) {
            throw new Error("Matching contribution not found for verified Cashfree order");
          }

          const updatedContribution = await tx.contribution.updateMany({
            where: { id: contribution.id, status: { not: "PAID" } },
            data: { status: "PAID", paidAt: new Date() },
          });

          if (updatedContribution.count !== 1) {
            throw new Error("Contribution has already been processed by another payment");
          }

          await tx.group.update({
            where: { id: contribution.groupId },
            data: { totalAmount: { increment: contribution.amount } },
          });
          await tx.notification.create({
            data: {
              userId: user.id,
              groupId: contribution.groupId,
              type: "PAYMENT_SUCCESS",
              title: "Contribution successful",
              message: `Your contribution of ₹${contribution.amount} has been received.`,
            },
          });
        });
        const contributionForSettlement = await prisma.contribution.findUnique({
          where: { id: orderId.slice("SW_CONTRIBUTION_".length).replace(/_\d+$/, "") },
          select: { requestId: true },
        });
        if (contributionForSettlement?.requestId) {
          await settleInternalWalletRequest(contributionForSettlement.requestId);
        }
      } else if (order.order_status === "EXPIRED" || order.order_status === "TERMINATED") {
        await prisma.transaction.updateMany({
          where: { id: transaction.id, status: "PENDING" },
          data: { status: "FAILED" },
        });
      } else if (paid && (!amountMatches || !currencyMatches)) {
        console.error("CASHFREE PAYMENT AMOUNT/CURRENCY MISMATCH", {
          orderId,
          expectedAmount: transaction.amount,
          receivedAmount: order.order_amount,
          currency: order.order_currency,
        });
        return NextResponse.json({ error: "Payment details did not match. Contact support." }, { status: 409 });
      }
    }

    const latest = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      select: { status: true },
    });

    return NextResponse.json(
      { status: latest?.status || transaction.status },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("PAYMENT STATUS ERROR:", error);
    return NextResponse.json({ error: "Unable to check payment status" }, { status: 500 });
  }
}
