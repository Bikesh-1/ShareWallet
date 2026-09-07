import prisma from "@/lib/prisma";
import { createCashfreePayout } from "@/lib/cashfree/payout";

export async function processPayout(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
    include: {
      receiver: {
        include: {
          payoutAccount: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Payout transaction not found");
  }

  if (transaction.type !== "PAYOUT") {
    throw new Error("Invalid transaction type");
  }

  if (transaction.status === "SUCCESS") {
    return {
      success: true,
      message: "Payout already completed",
      transactionId,
    };
  }

  if (!transaction.receiver) {
    throw new Error("Payout receiver not found");
  }

  const payoutAccount = transaction.receiver.payoutAccount;

  if (!payoutAccount) {
    throw new Error("Payout account not found");
  }

  if (
    !payoutAccount.isVerified ||
    !payoutAccount.isActive
  ) {
    throw new Error(
      "Payout account is not verified or active"
    );
  }

  if (
    payoutAccount.type !== "BANK" ||
    !payoutAccount.accountNumber ||
    !payoutAccount.ifsc
  ) {
    throw new Error(
      "Valid bank payout details are required"
    );
  }

  const payoutKey = `PAYOUT_${transaction.requestId}`;

  const existingPayout =
    await prisma.transaction.findUnique({
      where: {
        payoutKey,
      },
    });

  if (
    existingPayout &&
    existingPayout.id !== transaction.id
  ) {
    return {
      success: false,
      message: "Duplicate payout prevented",
      transactionId: existingPayout.id,
    };
  }

  if (!transaction.payoutKey) {
    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        payoutKey,
      },
    });
  }

  if (transaction.providerReference) {
    return {
      success: true,
      message: "Payout already submitted",
      providerReference:
        transaction.providerReference,
    };
  }

  const transferId = `SW_PAYOUT_${transaction.id}`;

  try {
    const result = await createCashfreePayout({
      transferId,
      amount: transaction.amount,
      beneficiaryId: transaction.receiverId!,
      beneficiaryName:
        payoutAccount.accountHolderName ||
        "ShareWallet User",
      bankAccount: payoutAccount.accountNumber,
      ifsc: payoutAccount.ifsc,
    });

    const providerReference =
      result?.cf_transfer_id ||
      result?.transfer_id ||
      transferId;

    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: "PENDING",
        provider: "CASHFREE",
        providerReference,
      },
    });

    return {
      success: true,
      message: "Payout submitted",
      transactionId: transaction.id,
      providerReference,
    };
  } catch (error) {
    await prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: "FAILED",
        provider: "CASHFREE",
      },
    });

    throw error;
  }
}