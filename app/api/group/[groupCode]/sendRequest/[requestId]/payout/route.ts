import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
        { error: "Group not found." },
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
        { error: "Request not found." },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        requestId,
        type: "PAYOUT",
        status: "PENDING",
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          error:
            "No eligible payout transaction found.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Emergency-fund payouts are credited to the ShareWallet internal wallet during approval. External Cashfree payouts are disabled." }, { status: 410 });
  } catch (error) {
    console.error("PAYOUT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payout failed",
      },
      { status: 500 }
    );
  }
}