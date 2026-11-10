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

          return {
            success: true,
            requestStatus: "REJECTED" as const,
            walletCredited: false,
            message: "Request rejected successfully",
          };
        }

        if (!allApproved) {
          return {
            success: true,
            requestStatus: "PENDING" as const,
            walletCredited: false,
            message: "Approval recorded. Waiting for other group members.",
          };
        }

        // Claim finalization once. This prevents duplicate wallet credits on retries.
        const claimedRequest = await tx.sentrequest.updateMany({
          where: { id: requestId, status: "PENDING" },
          data: { status: "ACCEPTED", actionAt: new Date() },
        });

        if (claimedRequest.count !== 1) {
          return {
            error: "This request has already been finalized.",
            statusCode: 409 as const,
          };
        }

        const amount = Number(request.amount);
        if (!Number.isSafeInteger(amount) || amount <= 0) {
          throw new Error("Invalid request amount");
        }

        // Deduct from the group's pooled savings before crediting the requester.
        const deducted = await tx.group.updateMany({
          where: { id: group.id, totalAmount: { gte: amount } },
          data: { totalAmount: { decrement: amount } },
        });

        if (deducted.count !== 1) {
          throw new Error("Insufficient group balance to approve this request");
        }

        await tx.user.update({
          where: { id: request.userId },
          data: { walletBalance: { increment: amount } },
        });

        await tx.transaction.create({
          data: {
            groupId: group.id,
            receiverId: request.userId,
            amount,
            type: "PAYOUT",
            status: "SUCCESS",
            requestId: request.id,
            provider: "SHAREWALLET",
            providerReference: `INTERNAL_WALLET_${request.id}`,
            payoutKey: `GROUP_REQUEST_${request.id}`,
          },
        });

        await tx.notification.create({
          data: {
            userId: request.userId,
            groupId: group.id,
            requestId: request.id,
            type: "PAYOUT_SUCCESS",
            title: "Money request approved",
            message: `Your group approved ₹${amount}. The amount has been credited to your ShareWallet balance.`,
          },
        });

        return {
          success: true,
          requestStatus: "ACCEPTED" as const,
          walletCredited: true,
          amountCredited: amount,
          message: "All members approved. Amount credited to the requester's ShareWallet.",
        };
      },
      { isolationLevel: "Serializable" }
    );

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
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
