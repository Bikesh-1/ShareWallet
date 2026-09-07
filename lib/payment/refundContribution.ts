import prisma from "@/lib/prisma";

export async function refundContribution(
  contributionId: string
) {
  const contribution =
    await prisma.contribution.findUnique({
      where: {
        id: contributionId,
      },
      include: {
        request: true,
      },
    });

  if (!contribution) {
    throw new Error("Contribution not found");
  }

  if (contribution.status !== "PAID") {
    throw new Error(
      "Only paid contributions can be refunded"
    );
  }

  const existingRefund =
    await prisma.transaction.findFirst({
      where: {
        requestId: contribution.requestId ?? undefined,
        senderId: contribution.userId,
        amount: contribution.amount,
        type: "REFUND",
        status: {
          in: ["PENDING", "SUCCESS"],
        },
      },
    });

  if (existingRefund) {
    return {
      success: false,
      message: "Refund already initiated",
      transactionId: existingRefund.id,
    };
  }

  const refundTransaction =
    await prisma.transaction.create({
      data: {
        groupId: contribution.groupId,
        senderId: undefined,
        receiverId: contribution.userId,
        amount: contribution.amount,
        type: "REFUND",
        status: "PENDING",
        requestId: contribution.requestId,
        provider: "CASHFREE",
      },
    });

  return {
    success: true,
    transactionId: refundTransaction.id,
    amount: contribution.amount,
  };
}