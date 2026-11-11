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

    const session =
      await getServerSession(authOptions);

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

    const transactions =
      await prisma.transaction.findMany({
        where: {
          groupId: group.id,
        },

        include: {
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
      "GROUP TRANSACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch group transactions.",
      },
      { status: 500 }
    );
  }
}