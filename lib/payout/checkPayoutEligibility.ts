import prisma from "@/lib/prisma";

/**
 * Emergency-fund requests settle into the ShareWallet internal wallet.
 * Cashfree bank payouts are deliberately not created from this flow.
 */
export async function checkPayoutEligibility(requestId: string) {
  const request = await prisma.sentrequest.findUnique({
    where: { id: requestId },
    include: { approvals: true, contributions: true },
  });

  if (!request) return { eligible: false, reason: "Request not found" };
  if (request.status === "REJECTED") return { eligible: false, reason: "Request was rejected" };

  const approved = request.approvals.length > 0 &&
    request.approvals.every((approval) => approval.status === "APPROVED");
  if (!approved) return { eligible: false, reason: "All members have not approved the request" };

  const amount = Number(request.amount);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { eligible: false, reason: "Invalid request amount" };
  }

  const internalCredit = await prisma.transaction.findUnique({
    where: { payoutKey: `GROUP_REQUEST_${request.id}` },
    select: { id: true, status: true, amount: true },
  });

  if (internalCredit?.status === "SUCCESS") {
    return {
      eligible: false,
      reason: "Request has already been settled to the ShareWallet internal wallet",
      transactionId: internalCredit.id,
      settlementMode: "INTERNAL_WALLET" as const,
    };
  }

  return {
    eligible: false,
    reason: "Cashfree bank payouts are disabled. Approved requests are settled directly to the ShareWallet internal wallet.",
    settlementMode: "INTERNAL_WALLET" as const,
  };
}
