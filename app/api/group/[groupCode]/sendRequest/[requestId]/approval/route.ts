import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

        const session =
            await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const status = body?.status;

        if (
            status !== "APPROVED" &&
            status !== "REJECTED"
        ) {
            return NextResponse.json(
                { error: "Invalid approval status" },
                { status: 400 }
            );
        }

        const user =
            await prisma.user.findUnique({
                where: {
                    email: session.user.email,
                },
            });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const group =
            await prisma.group.findFirst({
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
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        const request =
            await prisma.sentrequest.findFirst({
                where: {
                    id: requestId,
                    groupId: group.id,
                },
            });

        if (!request) {
            return NextResponse.json(
                { error: "Request not found" },
                { status: 404 }
            );
        }

        const approval =
            await prisma.requestApproval.findUnique({
                where: {
                    requestId_userId: {
                        requestId,
                        userId: user.id,
                    },
                },
            });

        if (!approval) {
            return NextResponse.json(
                {
                    error:
                        "You are not required to approve this request",
                },
                { status: 403 }
            );
        }

        if (approval.status !== "PENDING") {
            return NextResponse.json(
                {
                    error:
                        "You have already responded to this request",
                },
                { status: 400 }
            );
        }

        const updatedApproval =
            await prisma.requestApproval.update({
                where: {
                    id: approval.id,
                },
                data: {
                    status,
                    actionAt: new Date(),
                },
            });

        const allApprovals =
            await prisma.requestApproval.findMany({
                where: {
                    requestId,
                },
                select: {
                    status: true,
                },
            });

        const hasRejected =
            allApprovals.some(
                (item) =>
                    item.status === "REJECTED"
            );

        const allApproved =
            allApprovals.length > 0 &&
            allApprovals.every(
                (item) =>
                    item.status === "APPROVED"
            );

        let requestStatus:
            | "PENDING"
            | "ACCEPTED"
            | "REJECTED" =
            "PENDING";

        if (hasRejected) {
            requestStatus = "REJECTED";
        } else if (allApproved) {
            requestStatus = "ACCEPTED";
        }

        if (
            request.status === "PENDING" &&
            requestStatus !== "PENDING"
        ) {
            await prisma.sentrequest.update({
                where: {
                    id: request.id,
                },
                data: {
                    status: requestStatus,
                    actionAt: new Date(),
                },
            });
        }

        return NextResponse.json(
            {
                success: true,
                approval: updatedApproval,
                requestStatus,
                message:
                    status === "APPROVED"
                        ? "Request approved successfully"
                        : "Request rejected successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "APPROVAL PATCH ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update approval",
            },
            { status: 500 }
        );
    }
}