/**
 * No automatic Cashfree payout processing is performed.
 * Emergency-fund approval credits the internal ShareWallet wallet atomically.
 */
export async function runAutoPayout() {
  return [] as Array<{
    requestId?: string;
    status: "DISABLED";
    reason: string;
  }>;
}
