import prisma from "@/lib/prisma";

type CreateNotificationParams = {
    userId: string;
    title: string;
    message: string;
    type:
        | "MONEY_REQUEST"
        | "REQUEST_APPROVED"
        | "REQUEST_REJECTED"
        | "PAYMENT_SUCCESS"
        | "PAYMENT_FAILED"
        | "PAYOUT_INITIATED"
        | "PAYOUT_SUCCESS"
        | "PAYOUT_FAILED"
        | "REFUND_SUCCESS";
    requestId?: string;
    groupId?: string;
};

export async function createNotification({
    userId,
    title,
    message,
    type,
    requestId,
    groupId,
}: CreateNotificationParams) {
    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            requestId,
            groupId,
        },
    });
}