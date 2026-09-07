import { cashfreeConfig } from "./config";

type CreatePayoutParams = {
  transferId: string;
  amount: number;
  beneficiaryId: string;
  beneficiaryName: string;
  bankAccount: string;
  ifsc: string;
};

export async function createCashfreePayout({
  transferId,
  amount,
  beneficiaryId,
  beneficiaryName,
  bankAccount,
  ifsc,
}: CreatePayoutParams) {
  const response = await fetch(
    `${cashfreeConfig.baseUrl}/payout/transfers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": cashfreeConfig.clientId,
        "x-client-secret": cashfreeConfig.clientSecret,
        "x-api-version":
          process.env.CASHFREE_PAYOUT_API_VERSION || "2024-01-01",
      },
      body: JSON.stringify({
        transfer_id: transferId,
        transfer_amount: amount,
        transfer_mode: "banktransfer",
        beneficiary_details: {
          beneficiary_id: beneficiaryId,
          beneficiary_name: beneficiaryName,
          beneficiary_instrument_details: {
            bank_account_number: bankAccount,
            bank_ifsc: ifsc,
          },
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Cashfree payout failed"
    );
  }

  return data;
}