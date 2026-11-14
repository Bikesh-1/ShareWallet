import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createCashfreeOrder } from "@/lib/cashfree/payment";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ groupCode: string; requestId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { groupCode, requestId } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const request = await prisma.sentrequest.findFirst({ where: { id: requestId, userId: user.id, group: { groupCode } } });
    if (!request) return NextResponse.json({ error: "Loan not found for this group." }, { status: 404 });
    const [payout, repayments] = await Promise.all([
      prisma.transaction.findFirst({ where: { requestId, type: "PAYOUT", status: "SUCCESS", receiverId: user.id, group: { groupCode } } }),
      prisma.transaction.findMany({ where: { requestId, type: "LOAN_REPAYMENT" }, orderBy: { createdAt: "desc" } }),
    ]);
    const repaid = repayments.filter((item) => item.status === "SUCCESS").reduce((sum, item) => sum + item.amount, 0);
    const originalAmount = payout?.amount ?? 0;
    return NextResponse.json({ request, originalAmount, repaidAmount: repaid, outstandingAmount: Math.max(0, originalAmount - repaid), repayments });
  } catch (error) {
    console.error("GET LOAN REPAYMENTS:", error);
    return NextResponse.json({ error: "Unable to fetch repayment details." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ groupCode: string; requestId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { groupCode, requestId } = await params;
    const body = await req.json();
    const method = body.method === "cashfree" ? "cashfree" : body.method === "wallet" ? "wallet" : null;
    const amount = Number(body.amount);
    if (!method) return NextResponse.json({ error: "Choose wallet or Cashfree repayment." }, { status: 400 });
    if (!Number.isSafeInteger(amount) || amount <= 0) return NextResponse.json({ error: "Repayment amount must be a positive whole number." }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userdetails: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const request = await prisma.sentrequest.findFirst({
      where: { id: requestId, userId: user.id, group: { groupCode } },
      include: { group: { select: { id: true, groupCode: true } } },
    });
    if (!request || request.status !== "ACCEPTED") return NextResponse.json({ error: "Only an approved emergency-fund payout can be repaid." }, { status: 404 });

    if (method === "wallet") {
      const result = await prisma.$transaction(async (tx) => {
        const payout = await tx.transaction.findFirst({ where: { requestId, groupId: request.groupId, receiverId: user.id, type: "PAYOUT", status: "SUCCESS" } });
        if (!payout) throw new Error("The original loan payout was not found.");
        const repayments = await tx.transaction.aggregate({ where: { requestId, type: "LOAN_REPAYMENT", status: "SUCCESS" }, _sum: { amount: true } });
        const outstanding = payout.amount - (repayments._sum.amount || 0);
        if (amount > outstanding) throw new Error(`Repayment exceeds the outstanding balance of ₹${Math.max(0, outstanding)}.`);
        const debited = await tx.user.updateMany({ where: { id: user.id, walletBalance: { gte: amount } }, data: { walletBalance: { decrement: amount } } });
        if (debited.count !== 1) throw new Error("Insufficient ShareWallet balance.");
        await tx.group.update({ where: { id: request.groupId }, data: { totalAmount: { increment: amount } } });
        const transaction = await tx.transaction.create({
          data: { groupId: request.groupId, senderId: user.id, amount, type: "LOAN_REPAYMENT", status: "SUCCESS", requestId, provider: "SHAREWALLET", providerReference: `WALLET_REPAYMENT_${crypto.randomUUID()}`, payoutKey: `WALLET_REPAYMENT_${crypto.randomUUID()}` },
        });
        return transaction;
      }, { isolationLevel: "Serializable" });
      return NextResponse.json({ success: true, message: "Wallet repayment received.", transaction: result }, { status: 201 });
    }

    const existingPending = await prisma.transaction.findFirst({ where: { requestId, type: "LOAN_REPAYMENT", status: "PENDING", provider: "CASHFREE" } });
    if (existingPending) return NextResponse.json({ error: "A Cashfree repayment is already pending. Complete or wait for that payment before creating another." }, { status: 409 });
    const payout = await prisma.transaction.findFirst({ where: { requestId, groupId: request.groupId, receiverId: user.id, type: "PAYOUT", status: "SUCCESS" } });
    if (!payout) return NextResponse.json({ error: "Original loan payout not found." }, { status: 409 });
    const [repaid, pending] = await Promise.all([
      prisma.transaction.aggregate({ where: { requestId, type: "LOAN_REPAYMENT", status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { requestId, type: "LOAN_REPAYMENT", status: "PENDING" }, _sum: { amount: true } }),
    ]);
    const outstanding = payout.amount - (repaid._sum.amount || 0) - (pending._sum.amount || 0);
    if (amount > outstanding) return NextResponse.json({ error: `Repayment exceeds the available outstanding balance of ₹${Math.max(0, outstanding)}.` }, { status: 400 });
    const phone = user.userdetails?.mobileNumber?.replace(/\D/g, "") || "";
    if (!/^\d{10}$/.test(phone)) return NextResponse.json({ error: "Add a valid 10-digit mobile number to your profile before paying." }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        groupId: request.groupId, senderId: user.id, amount, type: "LOAN_REPAYMENT", status: "PENDING",
        requestId, provider: "CASHFREE", payoutKey: `CASHFREE_REPAYMENT_${crypto.randomUUID()}`,
      },
    });
    const orderId = `SW_REPAYMENT_${transaction.id}`;
    try {
      const order = await createCashfreeOrder({ orderId, amount, customerId: user.id, customerPhone: phone });
      await prisma.transaction.update({ where: { id: transaction.id }, data: { providerReference: orderId } });
      return NextResponse.json({ success: true, orderId, paymentSessionId: order.payment_session_id, transactionId: transaction.id });
    } catch (error) {
      await prisma.transaction.updateMany({ where: { id: transaction.id, status: "PENDING" }, data: { status: "FAILED" } });
      throw error;
    }
  } catch (error) {
    console.error("CREATE LOAN REPAYMENT:", error);
    const message = error instanceof Error ? error.message : "Unable to process repayment.";
    const status = /Insufficient|exceeds|not found|approved|outstanding/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
