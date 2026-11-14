import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const groupId = searchParams.get("groupId");

    const transactions =
      await prisma.transaction.findMany({
        where: {
          OR: [
            {
              senderId: user.id,
            },
            {
              receiverId: user.id,
            },
          ],

          ...(type
            ? {
                type: type as
                  | "CONTRIBUTION"
                  | "PAYOUT"
                  | "REFUND"
                  | "LOAN_REPAYMENT",
              }
            : {}),

          ...(status
            ? {
                status: status as
                  | "PENDING"
                  | "SUCCESS"
                  | "FAILED"
                  | "REFUNDED",
              }
            : {}),

          ...(groupId
            ? {
                groupId,
              }
            : {}),
        },

        include: {
          group: {
            select: {
              id: true,
              groupName: true,
              groupCode: true,
            },
          },

          sender: {
            select: {
              id: true,
              userdetails: { select: { name: true, profilephoto: true } },
              },
          },

          receiver: {
            select: {
              id: true,
              userdetails: { select: { name: true, profilephoto: true } },
              },
          },

          request: {
            select: {
              id: true,
              reason: true,
              amount: true,
              month: true,
              status: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        transactions,
        count: transactions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "TRANSACTION HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch transaction history.",
      },
      { status: 500 }
    );
  }
}