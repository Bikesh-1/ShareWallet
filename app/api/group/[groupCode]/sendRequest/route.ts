import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notification/createNotification";

export async function POST(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const { reason, amount, month } = await req.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign into continue" },
                { status: 401 }
            )
        }
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        })
        if (!user) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            )
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
        })

        if (!group) {
            return NextResponse.json(
                { error: "Group not found or you are not a member of this group." },
                { status: 404 }
            )
        }
        const existingRequest = await prisma.sentrequest.findFirst({
            where: {
                userId: user.id,
                groupId: group.id,
                month,
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: "You have already sent request , wait for your friend response. " },
                { status: 409 }
            )
        }

        await prisma.sentrequest.create({
            data: {
                userId: user.id,
                groupId: group.id,
                reason,
                amount,
                month
            }
        })



        const pendingCount = await prisma.sentrequest.count({
            where: {
                userId: user.id,
                status: "PENDING"
            }
        })
        const acceptedCount = await prisma.sentrequest.count({
            where: {
                userId: user.id,
                status: "ACCEPTED"
            }
        });
        const rejectedCount = await prisma.sentrequest.count({
            where: {
                userId: user.id,
                status: "REJECTED"
            }
        });
        return NextResponse.json(
            {
                message: "Your request is sucessfull.",
                counts: {
                    pending: pendingCount,
                    accepted: acceptedCount,
                    rejected: rejectedCount
                }
            },
            { status: 201 }
        )

    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
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