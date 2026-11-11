import prisma from "@/lib/prisma";
import { verifyCashfreePayoutWebhook } from "@/lib/cashfree/payoutWebhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
    }
    if (!verifyCashfreePayoutWebhook(rawBody, timestamp, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const transferId = payload?.data?.transfer?.transfer_id || payload?.data?.transfer_id;
    const transferStatus = payload?.data?.transfer?.status || payload?.data?.status;
    if (!transferId || typeof transferId !== "string") {
      return NextResponse.json({ error: "Transfer ID missing" }, { status: 400 });
    }
    if (!transferId.startsWith("SW_PAYOUT_")) {
      return NextResponse.json({ message: "Ignored payout" }, { status: 200 });
    }

    const transactionId = transferId.slice("SW_PAYOUT_".length);
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (transaction.type !== "PAYOUT" || transaction.provider !== "CASHFREE") {
      return NextResponse.json({ error: "Invalid payout transaction" }, { status: 400 });
    }

    let nextStatus: "SUCCESS" | "FAILED" | null = null;
    if (transferStatus === "SUCCESS" || transferStatus === "COMPLETED") nextStatus = "SUCCESS";
    if (transferStatus === "FAILED" || transferStatus === "REJECTED") nextStatus = "FAILED";

    if (!nextStatus) {
      return NextResponse.json({ message: "Payout status received", status: transferStatus }, { status: 200 });
    }

    // Terminal states are immutable. Conditional update also makes duplicate/out-of-order
    // webhook delivery safe under concurrent requests.
    const updated = await prisma.transaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: {
        status: nextStatus,
        provider: "CASHFREE",
        providerReference: transferId,
      },
    });

    const latest = updated.count
      ? nextStatus
      : (await prisma.transaction.findUnique({ where: { id: transaction.id }, select: { status: true } }))?.status;

    return NextResponse.json({
      message: updated.count ? "Payout status updated" : "Payout already reached a terminal state; callback ignored",
      status: latest,
    }, { status: 200 });
  } catch (error) {
    console.error("CASHFREE PAYOUT WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Payout webhook processing failed" }, { status: 500 });
  }
}
