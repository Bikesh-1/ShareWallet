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
      notificationId: string;
    }>;
  }
) {
  try {
    const { notificationId } = await params;

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

    const notification =
      await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found." },
        { status: 404 }
      );
    }

    const updated =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: true,
        },
      });

    return NextResponse.json({
      notification: updated,
    });
  } catch (error) {
    console.error(
      "NOTIFICATION READ ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update notification." },
      { status: 500 }
    );
  }
}