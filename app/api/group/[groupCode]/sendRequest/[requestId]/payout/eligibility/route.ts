import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkPayoutEligibility } from "@/lib/payout/checkPayoutEligibility";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
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

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please sign in to continue.",
        },
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
        {
          error: "User account not found.",
        },
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
            "Group not found or you are not a member of this group.",
        },
        { status: 404 }
      );
    }

    const request = await prisma.sentrequest.findFirst({
      where: {
        id: requestId,
        groupId: group.id,
      },
    });

    if (!request) {
      return NextResponse.json(
        {
          error: "Request not found.",
        },
        { status: 404 }
      );
    }

    const result = await checkPayoutEligibility(requestId);

    return NextResponse.json(result, {
      status: result.eligible ? 200 : 400,
    });
  } catch (error) {
    console.error("PAYOUT ELIGIBILITY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to check payout eligibility.",
      },
      { status: 500 }
    );
  }
}