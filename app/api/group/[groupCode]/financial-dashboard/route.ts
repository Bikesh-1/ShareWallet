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
    }>;
  }
) {
  try {
    const { groupCode } = await params;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          error:
            "Group not found or you are not a member.",
        },
        { status: 404 }
      );
    }

    const [
      contributions,
      pendingContributions,
      payouts,
      refunds,
      requests,
    ] = await Promise.all([
      prisma.contribution.findMany({
        where: {
          groupId: group.id,
          requestId: null,
          status: "PAID",
        },
        select: {
          amount: true,
        },
      }),

      prisma.contribution.findMany({
        where: {
          groupId: group.id,
          requestId: null,
          status: "PENDING",
        },
        select: {
          amount: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          groupId: group.id,
          type: "PAYOUT",
          status: "SUCCESS",
        },
        select: {
          amount: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          groupId: group.id,
          type: "REFUND",
          status: "SUCCESS",
        },
        select: {
          amount: true,
        },
      }),

      prisma.sentrequest.findMany({
        where: {
          groupId: group.id,
        },
        include: {
          contributions: {
            where: {
              status: "PAID",
            },
            select: {
              amount: true,
            },
          },
          approvals: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {
          requestAt: "desc",
        },
      }),
    ]);

    const totalContributions = contributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0
    );

    const pendingContributionAmount = pendingContributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0
    );

    const totalPayouts = payouts.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

    const totalRefunds = refunds.reduce(
      (sum, transaction) =>
        sum + transaction.amount,
      0
    );

    const netFlow =
      totalContributions -
      totalPayouts -
      totalRefunds;

    const requestStats = requests.map((request) => {
      const requestedAmount = Number(request.amount);

      const collectedAmount =
        request.contributions.reduce(
          (sum, contribution) =>
            sum + Number(contribution.amount),
          0
        );

      const approvedCount =
        request.approvals.filter(
          (approval) =>
            approval.status === "APPROVED"
        ).length;

      const totalApprovals =
        request.approvals.length;

      return {
        id: request.id,
        reason: request.reason,
        amount: requestedAmount,
        month: request.month,
        status: request.status,
        collectedAmount,
        remainingAmount: Math.max(
          requestedAmount - collectedAmount,
          0
        ),
        collectionPercentage:
          requestedAmount > 0
            ? Math.min(
                Math.round(
                  (collectedAmount /
                    requestedAmount) *
                    100
                ),
                100
              )
            : 0,
        approvedCount,
        totalApprovals,
        allApproved:
          totalApprovals > 0 &&
          approvedCount === totalApprovals,
      };
    });

    return NextResponse.json(
      {
        group: {
          id: group.id,
          groupName: group.groupName,
          groupCode: group.groupCode,
        },

        summary: {
          totalContributions,
          contributionCount: contributions.length,
          pendingContributionAmount,
          pendingContributionCount: pendingContributions.length,
          totalPayouts,
          totalRefunds,
          netFlow,
          totalRequests: requests.length,
        },

        requests: requestStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "FINANCIAL DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load financial dashboard.",
      },
      { status: 500 }
    );
  }
}