import prisma from "@/lib/prisma";

export async function checkPayoutEligibility(requestId: string) {

  const request = await prisma.sentrequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      approvals: true,
      contributions: true,
      user: {
        include: {
          payoutAccount: true,
        },
      },
    },
  });

  if (!request) {
    return {
      eligible: false,
      reason: "Request not found",
    };
  }

  if (request.status === "REJECTED") {
    return {
      eligible: false,
      reason: "Request was rejected",
    };
  }

  const requestedAmount = Number(request.amount);

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return {
      eligible: false,
      reason: "Invalid request amount",
    };
  }

  // Check all approvals
  if (request.approvals.length === 0) {
    return {
      eligible: false,
      reason: "No approvals found",
    };
  }

  const allApproved = request.approvals.every(
    (approval) => approval.status === "APPROVED"
  );

  if (!allApproved) {
    return {
      eligible: false,
      reason: "All members have not approved the request",
    };
  }

  // Calculate collected amount
  const collectedAmount = request.contributions
    .filter((contribution) => contribution.status === "PAID")
    .reduce(
      (total, contribution) => total + Number(contribution.amount),
      0
    );

  if (collectedAmount < requestedAmount) {
    return {
      eligible: false,
      reason: "Required amount has not been collected",
      requestedAmount,
      collectedAmount,
    };
  }

  // Check payout account
  const payoutAccount = request.user.payoutAccount;

  if (!payoutAccount) {
    return {
      eligible: false,
      reason: "Payout account not added",
    };
  }

  if (!payoutAccount.isVerified) {
    return {
      eligible: false,
      reason: "Payout account is not verified",
    };
  }

  if (!payoutAccount.isActive) {
    return {
      eligible: false,
      reason: "Payout account is inactive",
    };
  }
  const payoutKey = `PAYOUT_${request.id}`;
  // Check existing payout transaction
  const existingPayout =
    await prisma.transaction.findUnique({
      where: {
        payoutKey,
      },
    });

  if (existingPayout) {
    return {
      eligible: false,
      reason:
        existingPayout.status === "SUCCESS"
          ? "Payout already completed"
          : "Payout already initiated",
      transactionId: existingPayout.id,
    };
  }




  // Create payout transaction
  const payoutTransaction =
    await prisma.transaction.create({
      data: {
        groupId: request.groupId,
        receiverId: request.userId,
        amount: requestedAmount,
        type: "PAYOUT",
        status: "PENDING",
        requestId: request.id,
        provider: "CASHFREE",
        payoutKey,
      },
    });

  await prisma.sentrequest.update({
    where: {
      id: request.id,
    },
    data: {
      status: "ACCEPTED",
      actionAt: new Date(),
    },
  });

  return {
    eligible: true,
    transactionId: payoutTransaction.id,
    requestedAmount,
    collectedAmount,
    payoutAccountId: payoutAccount.id,
  };
}