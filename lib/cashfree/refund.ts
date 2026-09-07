import { cashfreeConfig } from "./config";

export async function createCashfreeRefund({
  orderId,
  refundId,
  amount,
  reason,
}: {
  orderId: string;
  refundId: string;
  amount: number;
  reason: string;
}) {
  const response = await fetch(
    `${cashfreeConfig.baseUrl}/pg/orders/${orderId}/refunds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cashfreeConfig.clientId,
        "x-client-secret":
          cashfreeConfig.clientSecret,
        "x-api-version": "2025-01-01",
      },
      body: JSON.stringify({
        refund_amount: amount,
        refund_id: refundId,
        refund_note: reason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Cashfree refund failed"
    );
  }

  return data;
}