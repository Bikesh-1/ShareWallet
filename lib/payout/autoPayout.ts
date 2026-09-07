import prisma from "@/lib/prisma";
import { checkPayoutEligibility } from "@/lib/payout/checkPayoutEligibility";
import { processPayout } from "@/lib/payout/processPayout";

export async function runAutomaticPayouts() {
  const requests = await prisma.sentrequest.findMany({
    where: {
      status: "PENDING",
    },
    select: {
      id: true,
    },
  });

  const results = [];

  for (const request of requests) {
    try {
      const eligibility =
        await checkPayoutEligibility(request.id);

      if (!eligibility.eligible) {
        results.push({
          requestId: request.id,
          status: "NOT_ELIGIBLE",
          reason: eligibility.reason,
        });

        continue;
      }

      const payoutTransaction =
        await prisma.transaction.findFirst({
          where: {
            requestId: request.id,
            type: "PAYOUT",
            status: "PENDING",
          },
        });

      if (!payoutTransaction) {
        results.push({
          requestId: request.id,
          status: "NO_TRANSACTION",
        });

        continue;
      }

      const payout = await processPayout(
        payoutTransaction.id
      );

      results.push({
        requestId: request.id,
        status: "PAYOUT_SUBMITTED",
        payout,
      });
    } catch (error) {
      results.push({
        requestId: request.id,
        status: "FAILED",
        reason:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  }

  return results;
}