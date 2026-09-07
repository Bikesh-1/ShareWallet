import prisma from "@/lib/prisma";
import { createCashfreeRefund } from "@/lib/cashfree/refund";

export async function processRefund(
  transactionId: string,
  orderId: string
) {
  const transaction =
    await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

  if (!transaction) {
    throw new Error("Refund transaction not found");
  }

  if (transaction.type !== "REFUND") {
    throw new Error("Invalid transaction type");
  }

  if (transaction.status === "SUCCESS") {
    return {
      success: true,
      message: "Refund already completed",
    };
  }

  const refundId = `SW_REFUND_${transaction.id}`;

  const result = await createCashfreeRefund({
    orderId,
    refundId,
    amount: transaction.amount,
    reason: "ShareWallet contribution refund",
  });

  await prisma.transaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      provider: "CASHFREE",
      providerReference:
        result?.cf_refund_id ||
        result?.refund_id ||
        refundId,
    },
  });

  return {
    success: true,
    transactionId: transaction.id,
    providerReference:
      result?.cf_refund_id ||
      result?.refund_id ||
      refundId,
  };
}