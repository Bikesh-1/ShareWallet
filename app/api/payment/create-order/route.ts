import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createCashfreeOrder } from "@/lib/cashfree/payment";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session =
            await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { contributionId } =
            await req.json();

        if (!contributionId) {
            return NextResponse.json(
                {
                    error:
                        "Contribution ID is required",
                },
                { status: 400 }
            );
        }

        const user =
            await prisma.user.findUnique({
                where: {
                    email: session.user.email,
                },
                include: {
                    userdetails: true,
                },
            });

        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                { status: 404 }
            );
        }

        const contribution =
            await prisma.contribution.findUnique({
                where: {
                    id: contributionId,
                },
            });

        if (!contribution) {
            return NextResponse.json(
                {
                    error:
                        "Contribution not found",
                },
                { status: 404 }
            );
        }

        if (
            contribution.userId !==
            user.id
        ) {
            return NextResponse.json(
                {
                    error:
                        "You cannot pay this contribution",
                },
                { status: 403 }
            );
        }

        if (
            contribution.status ===
            "PAID"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Contribution already paid",
                },
                { status: 400 }
            );
        }

        const customerPhone = user.userdetails?.mobileNumber?.replace(/\D/g, "") || "";
        if (!/^\d{10}$/.test(customerPhone)) {
            return NextResponse.json(
                { error: "Please add a valid 10-digit mobile number to your profile before paying." },
                { status: 400 }
            );
        }

        const orderPrefix = `SW_CONTRIBUTION_${contribution.id}_`;
        let transaction = await prisma.transaction.findFirst({
            where: {
                senderId: user.id,
                type: "CONTRIBUTION",
                status: "PENDING",
                providerReference: { startsWith: orderPrefix },
            },
            orderBy: { createdAt: "desc" },
        });

        const orderId = transaction?.providerReference || `${orderPrefix}${Date.now()}`;

        if (!transaction) {
            transaction = await prisma.transaction.create({
                data: {
                    groupId: contribution.groupId,
                    senderId: contribution.userId,
                    amount: contribution.amount,
                    type: "CONTRIBUTION",
                    status: "PENDING",
                    requestId: contribution.requestId,
                    provider: "CASHFREE",
                    providerReference: orderId,
                },
            });
        }

        const order =
            await createCashfreeOrder({
                orderId,

                amount:
                    contribution.amount,

                customerId:
                    user.id,

                customerPhone,
            });

        return NextResponse.json(
            {
                success: true,
                orderId,

                paymentSessionId:
                    order.payment_session_id,

                transactionId:
                    transaction.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create payment order",
            },
            { status: 500 }
        );
    }
}