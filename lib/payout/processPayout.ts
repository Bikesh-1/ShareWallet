/**
 * External Cashfree payouts are disabled for emergency-fund requests.
 * The approval transaction credits the requester's ShareWallet wallet atomically.
 * This guard prevents legacy API routes or cron jobs from paying the same request twice.
 */
export async function processPayout(_transactionId: string) {
  throw new Error(
    "External Cashfree payouts are disabled. Emergency-fund requests settle to the ShareWallet internal wallet during approval."
  );
}
