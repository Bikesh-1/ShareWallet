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

    const request =
      await prisma.sentrequest.findFirst({
        where: {
          id: requestId,
          groupId: group.id,
        },
        include: {
          user: {
            include: {
              userdetails: true,
            },
          },
          approvals: true,
          contributions: true,
        },
      });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        sentRequestDetails: request,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REQUEST GET ERROR:", error);

    return NextResponse.json(
      { error: "Unexpected error." },
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

    const body = await req.json();
    const status = body?.status;

    if (
      status !== "ACCEPTED" &&
      status !== "REJECTED"
    ) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

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

    const request =
      await prisma.sentrequest.findFirst({
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

    // Only requester can cancel/change final request status
    if (request.userId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to change this request.",
        },
        { status: 403 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            "This request has already been processed.",
        },
        { status: 400 }
      );
    }

    const updated =
      await prisma.sentrequest.update({
        where: {
          id: request.id,
        },
        data: {
          status,
          actionAt: new Date(),
        },
      });

    return NextResponse.json(
      {
        statusDecided: updated,
        message: "Status changed successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("REQUEST PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}