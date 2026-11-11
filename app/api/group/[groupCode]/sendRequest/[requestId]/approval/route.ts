import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { settleInternalWalletRequest } from "@/lib/payout/settleInternalWalletRequest";
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const status = body?.status;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Invalid approval status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const request = await tx.sentrequest.findFirst({
          where: { id: requestId, groupId: group.id },
        });

        if (!request) {
          return { error: "Request not found", statusCode: 404 as const };
        }

        if (request.status !== "PENDING") {
          return {
            error: "This request has already been processed.",
            statusCode: 400 as const,
          };
        }

        const approval = await tx.requestApproval.findUnique({
          where: {
            requestId_userId: { requestId, userId: user.id },
          },
        });

        if (!approval) {
          return {
            error: "You are not required to approve this request",
            statusCode: 403 as const,
          };
        }

        if (approval.status !== "PENDING") {
          return {
            error: "You have already responded to this request",
            statusCode: 400 as const,
          };
        }

        const claimedApproval = await tx.requestApproval.updateMany({
          where: { id: approval.id, status: "PENDING" },
          data: { status, actionAt: new Date() },
        });

        if (claimedApproval.count !== 1) {
          return {
            error: "You have already responded to this request",
            statusCode: 409 as const,
          };
        }

        const approvals = await tx.requestApproval.findMany({
          where: { requestId },
          select: { status: true },
        });

        const hasRejected = approvals.some((item) => item.status === "REJECTED");
        const allApproved =
          approvals.length > 0 &&
          approvals.every((item) => item.status === "APPROVED");

        if (hasRejected) {
          await tx.sentrequest.updateMany({
            where: { id: requestId, status: "PENDING" },
            data: { status: "REJECTED", actionAt: new Date() },
          });
          await tx.notification.create({
            data: {
              userId: request.userId,
              groupId: request.groupId,
              requestId: request.id,
              type: "REQUEST_REJECTED",
              title: "Money request rejected",
              message: `Your request for ₹${request.amount} was rejected by a group member.`,
            },
          });
          return {
            success: true,
            requestStatus: "REJECTED" as const,
            walletCredited: false,
            message: "Request rejected successfully",
          };
        }

        return {
          success: true,
          requestStatus: "PENDING" as const,
          walletCredited: false,
          allApproved,
          message: allApproved
            ? "All members approved. Waiting for the requested contributions to be collected."
            : "Approval recorded. Waiting for other group members.",
        };
      },
      { isolationLevel: "Serializable" }
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    if ("allApproved" in result && result.allApproved) {
      const settlement = await settleInternalWalletRequest(requestId);
      if (settlement.settled) {
        return NextResponse.json({
          success: true,
          requestStatus: "ACCEPTED",
          walletCredited: true,
          amountCredited: settlement.amountCredited,
          message: "All members approved and the amount has been credited to the requester's ShareWallet.",
        }, { status: 200 });
      }
      return NextResponse.json({
        ...result,
        message: "All members approved. The request will be credited automatically once enough contributions are collected.",
      }, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("APPROVAL PATCH ERROR:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update approval",
      },
      { status: 500 }
    );
  }
}
