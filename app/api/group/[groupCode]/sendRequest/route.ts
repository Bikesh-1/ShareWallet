import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";


export async function POST(req: Request, { params, }: { params: Promise<{ groupCode: string; }>; }
) {
    try {
        const { groupCode } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
        }

        const requestSchema = z.object({
            reason: z.string().trim().min(5).max(500),
            amount: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER),
            month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
        });
        const parsedBody = requestSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({
                error: "Provide a reason (5–500 characters), a positive whole-number amount, and a valid YYYY-MM month.",
            }, { status: 400 });
        }

        const reason = parsedBody.data.reason;
        const amount = parsedBody.data.amount;
        const month = parsedBody.data.month || new Date().toISOString().slice(0, 7);

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found", }, { status: 404 });
        }

        const group = await prisma.group.findFirst({
            where: {
                groupCode,
                OR: [
                    {
                        createdId: user.id,
                    },
                    {
                        groupmember: {
                            some: {
                                userId: user.id,
                            },
                        },
                    },
                ],
            },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you are not a member", }, { status: 404 });
        }

        if (amount > group.totalAmount) {
            return NextResponse.json({
                error: `Requested amount exceeds the available group wallet balance of ₹${group.totalAmount.toLocaleString("en-IN")}.`,
                availableBalance: group.totalAmount,
                requestedAmount: amount,
            }, { status: 400 });
        }

        const members = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        id: group.createdId,
                    },
                    {
                        groupmembers: {
                            some: {
                                groupId: group.id,
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        if (members.length < 2) {
            return NextResponse.json(
                { error: "At least one other group member is required to approve a money request." },
                { status: 400 }
            );
        }

        // The requester must never be able to approve their own money request.
        const approvers = members.filter((member) => member.id !== user.id);

        const result = await prisma.$transaction(
            async (tx) => {
                const request = await tx.sentrequest.create({
                    data: {
                        userId: user.id,
                        groupId: group.id,
                        reason,
                        amount: String(amount),
                        month,
                        status: "PENDING",
                    },
                });

                const approvalData = approvers.map(
                    (member) => ({
                        requestId: request.id,
                        userId: member.id,
                        status: "PENDING" as const,
                    })
                );

                await tx.requestApproval.createMany({
                    data: approvalData,
                    skipDuplicates: true,
                });

                await tx.notification.createMany({
                    data: approvers.map((member) => ({
                        userId: member.id,
                        groupId: group.id,
                        requestId: request.id,
                        type: "MONEY_REQUEST" as const,
                        title: "New money request",
                        message: `A group member requested ₹${amount} for: ${reason}`,
                    })),
                });
                return request;
            }
        );

        return NextResponse.json({
            success: true,
            message: "Money request created successfully",
            request: result,
        },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE REQUEST ERROR:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create money request", },
            { status: 500 }
        );
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            );
        }
        const group = await prisma.group.findFirst({
            where: {
                groupCode,
                OR: [
                    {
                        createdId: user.id
                    },
                    {
                        groupmember: {
                            some: {
                                userId: user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!group) {
            return NextResponse.json(
                { error: "Group not found or you are not a member of this group." },
                { status: 404 }
            );
        }
        const sentrequestDetails = await prisma.sentrequest.findMany({
            where: {
                groupId: group.id,
            },

            include: {
                user: {
                    include: {
                        userdetails: true,
                    },
                },
                approvals: {
                    where: { userId: user.id },
                    select: { status: true },
                },
                transactions: {
                    where: { type: "LOAN_REPAYMENT" },
                    select: { amount: true, status: true },
                },
            },

            orderBy: {
                requestAt: "desc",
            },
        });
        const requestsWithRepayment = sentrequestDetails.map((request) => {
            const repaidAmount = request.transactions
                .filter((transaction) => transaction.status === "SUCCESS")
                .reduce((sum, transaction) => sum + transaction.amount, 0);
            const pendingRepaymentAmount = request.transactions
                .filter((transaction) => transaction.status === "PENDING")
                .reduce((sum, transaction) => sum + transaction.amount, 0);
            const requestedAmount = Number(request.amount);
            return {
                ...request,
                repaidAmount,
                pendingRepaymentAmount,
                outstandingAmount: Math.max(0, requestedAmount - repaidAmount - pendingRepaymentAmount),
            };
        });
        return NextResponse.json(
            { sentrequestDetails: requestsWithRepayment, currentUserId: user.id, message: "Sending Request details. " },
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
    }
}