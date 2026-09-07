import crypto from "crypto";

export function verifyCashfreePayoutWebhook(
  rawBody: string,
  timestamp: string,
  signature: string
) {
  const secret = process.env.CASHFREE_CLIENT_SECRET;

  if (!secret || !timestamp || !signature) {
    return false;
  }

  const signedPayload = timestamp + rawBody;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}