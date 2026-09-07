import prisma from "@/lib/prisma";
import { checkPayoutEligibility } from "./checkPayoutEligibility";
import { processPayout } from "./processPayout";

export async function runAutoPayout() {
    const pendingRequests =
        await prisma.sentrequest.findMany({
            where: {
                status: "PENDING",
            },
            select: {
                id: true,
                groupId: true,
            },
            take: 50,
        });

    const results = [];

    for (const request of pendingRequests) {
        try {
            const eligibility =
                await checkPayoutEligibility(
                    request.id
                );

            if (!eligibility.eligible) {
                results.push({
                    requestId: request.id,
                    status: "SKIPPED",
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
                    orderBy: {
                        createdAt: "desc",
                    },
                });

            if (!payoutTransaction) {
                results.push({
                    requestId: request.id,
                    status: "SKIPPED",
                    reason:
                        "Payout transaction not found",
                });

                continue;
            }

            await processPayout(
                payoutTransaction.id
            );

            results.push({
                requestId: request.id,
                transactionId:
                    payoutTransaction.id,
                status: "PROCESSING",
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