import prisma from "@/lib/prisma";

/**
 * Settles an approved emergency-fund request into the requester's ShareWallet
 * balance only after the request's contributions have been collected.
 * The request claim, group debit, wallet credit and ledger entry are atomic.
 */
export async function settleInternalWalletRequest(requestId: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.sentrequest.findUnique({
      where: { id: requestId },
      include: { approvals: true, contributions: true },
    });

    if (!request || request.status !== "PENDING") return { settled: false };
    if (
      request.approvals.length === 0 ||
      request.approvals.some((approval) => approval.status !== "APPROVED")
    ) {
      return { settled: false };
    }

    const amount = Number(request.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Invalid emergency-fund request amount");
    }

    const groupBalance = await tx.group.findUnique({
      where: { id: request.groupId },
      select: { totalAmount: true },
    });

    if (!groupBalance || groupBalance.totalAmount < amount) {
      return {
        settled: false,
        waitingForGroupBalance: true,
        availableAmount: groupBalance?.totalAmount ?? 0,
        requestedAmount: amount,
      };
    }

    const existing = await tx.transaction.findUnique({
      where: { payoutKey: `GROUP_REQUEST_${request.id}` },
    });
    if (existing) return { settled: false, alreadySettled: existing.status === "SUCCESS" };

    const claimed = await tx.sentrequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: "ACCEPTED", actionAt: new Date() },
    });
    if (claimed.count !== 1) return { settled: false };

    const debited = await tx.group.updateMany({
      where: { id: request.groupId, totalAmount: { gte: amount } },
      data: { totalAmount: { decrement: amount } },
    });
    if (debited.count !== 1) {
      throw new Error("Insufficient group balance to settle this request");
    }

    await tx.user.update({
      where: { id: request.userId },
      data: { walletBalance: { increment: amount } },
    });

    await tx.transaction.create({
      data: {
        groupId: request.groupId,
        receiverId: request.userId,
        amount,
        type: "PAYOUT",
        status: "SUCCESS",
        requestId: request.id,
        provider: "SHAREWALLET",
        providerReference: `INTERNAL_WALLET_${request.id}`,
        payoutKey: `GROUP_REQUEST_${request.id}`,
      },
    });

    await tx.notification.create({
      data: {
        userId: request.userId,
        groupId: request.groupId,
        requestId: request.id,
        type: "PAYOUT_SUCCESS",
        title: "Money request approved",
        message: `Your group approved ₹${amount}. The amount has been credited to your ShareWallet balance.`,
      },
    });

    return { settled: true, amountCredited: amount };
  }, { isolationLevel: "Serializable" });
}
