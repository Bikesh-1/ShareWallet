import { cashfreeConfig } from "./config";

export async function createCashfreeOrder({
  orderId,
  amount,
  customerId,
  customerPhone,
}: {
  orderId: string;
  amount: number;
  customerId: string;
  customerPhone: string;
}) {
  if (!cashfreeConfig.clientId || !cashfreeConfig.clientSecret) {
    throw new Error("Cashfree credentials are missing. Configure CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET.");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing.");
  }

  const response = await fetch(
    `${cashfreeConfig.baseUrl}/pg/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cashfreeConfig.clientId,
        "x-client-secret": cashfreeConfig.clientSecret,
        "x-api-version": "2025-01-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",

        customer_details: {
          customer_id: customerId,
          customer_phone: customerPhone,
        },

        order_meta: {
          return_url:`${process.env.NEXT_PUBLIC_APP_URL}/payment/sucess?order_id={order_id}`,
          notify_url:`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cashfree`,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to create Cashfree order"
    );
  }

  return data;
}