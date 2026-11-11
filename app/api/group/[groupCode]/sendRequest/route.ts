import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


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

        const body = await req.json();
        const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
        const amount = Number(body?.amount);
        const month = body?.month || new Date().toISOString().slice(0, 7);

        if (typeof reason !== "string" || reason.length < 5 || reason.length > 500) {
            return NextResponse.json({ error: "Reason must be between 5 and 500 characters." }, { status: 400 });
        }

        if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return NextResponse.json({ error: "Month must use YYYY-MM format." }, { status: 400 });
        }

        if (!Number.isSafeInteger(amount) || amount <= 0) {
            return NextResponse.json({ error: "Amount must be a positive whole number", }, { status: 400 });
        }

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

                const baseAmount = Math.floor(amount / members.length);
                const remainder = amount % members.length;
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

                const contributionData = members.map((member, index) => ({
                    requestId: request.id,
                    userId: member.id,
                    groupId: group.id,
                    amount: baseAmount + (index < remainder ? 1 : 0),
                    month,
                    status: "PENDING" as const,
                })
                );

                await tx.contribution.createMany({
                    data: contributionData,
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
            },

            orderBy: {
                requestAt: "desc",
            },
        });
        return NextResponse.json(
            { sentrequestDetails, message: "Sending Request details. " },
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
    }
}