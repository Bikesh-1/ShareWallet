import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            groupCode: string;
            requestId: string;
        }>;
    }
) {
    try {
        const {
            groupCode,
            requestId,
        } = await params;

        const session =
            await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized.",
                },
                { status: 401 }
            );
        }

        const user =
            await prisma.user.findUnique({
                where: {
                    email:
                        session.user.email,
                },
            });

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "User not found.",
                },
                { status: 404 }
            );
        }

        const group =
            await prisma.group.findFirst({
                where: {
                    groupCode,
                    OR: [
                        {
                            createdId:
                                user.id,
                        },
                        {
                            groupmember: {
                                some: {
                                    userId:
                                        user.id,
                                },
                            },
                        },
                    ],
                },
            });

        if (!group) {
            return NextResponse.json(
                {
                    error:
                        "Group not found.",
                },
                { status: 404 }
            );
        }

        const request =
            await prisma.sentrequest.findFirst({
                where: {
                    id: requestId,
                    groupId: group.id,
                },
                include: {
                    user: {
                        include: {
                            userdetails:
                                true,
                        },
                    },

                    approvals: {
                        include: {
                            user: {
                                include: {
                                    userdetails:
                                        true,
                                },
                            },
                        },
                    },

                    contributions: {
                        include: {
                            user: {
                                include: {
                                    userdetails:
                                        true,
                                },
                            },
                        },
                    },
                },
            });

        if (!request) {
            return NextResponse.json(
                {
                    error:
                        "Request not found.",
                },
                { status: 404 }
            );
        }

        const currentUserContribution =
            request.contributions.find(
                (contribution) =>
                    contribution.userId ===
                    user.id
            ) || null;

        return NextResponse.json(
            {
                request: {
                    ...request,
                    currentUserContribution,
                },
                currentUserContribution,
                currentUserId: user.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "REQUEST GET ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Unexpected error.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    {
        params,
    }: {
        params: Promise<{
            groupCode: string;
            requestId: string;
        }>;
    }
) {
    try {
        const { groupCode, requestId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        // This endpoint is only for the request creator to cancel their own pending request.
        // Approvals must go through the per-member approval endpoint.
        const body = await req.json();
        if (body?.status !== "REJECTED") {
            return NextResponse.json(
                { error: "Only cancellation is allowed here. Member approvals use the approval endpoint." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        const group = await prisma.group.findFirst({
            where: {
                groupCode,
                OR: [
                    { createdId: user.id },
                    { groupmember: { some: { userId: user.id } } },
                ],
            },
            select: { id: true },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found." }, { status: 404 });
        }

        const cancelled = await prisma.sentrequest.updateMany({
            where: {
                id: requestId,
                groupId: group.id,
                userId: user.id,
                status: "PENDING",
            },
            data: {
                status: "REJECTED",
                actionAt: new Date(),
            },
        });

        if (cancelled.count !== 1) {
            const request = await prisma.sentrequest.findFirst({
                where: { id: requestId, groupId: group.id },
                select: { userId: true, status: true },
            });

            if (!request) {
                return NextResponse.json({ error: "Request not found." }, { status: 404 });
            }
            if (request.userId !== user.id) {
                return NextResponse.json({ error: "You are not authorized to cancel this request." }, { status: 403 });
            }
            return NextResponse.json({ error: "This request is no longer pending." }, { status: 409 });
        }

        return NextResponse.json({
            success: true,
            status: "REJECTED",
            message: "Request cancelled successfully.",
        }, { status: 200 });
    } catch (error) {
        console.error("REQUEST CANCELLATION ERROR:", error);
        return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
    }
}
