import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        include: {
          group: { select: { id: true, groupName: true, groupCode: true } },
          request: { select: { id: true, reason: true, amount: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);

    return NextResponse.json(
      { notifications, unreadCount },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("NOTIFICATIONS GET ERROR:", error);
    return NextResponse.json({ error: "Unable to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || (body.id !== undefined && (typeof body.id !== "string" || !body.id.trim()))) {
      return NextResponse.json({ error: "Invalid notification request" }, { status: 400 });
    }

    if (body.markAllRead === true) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (typeof body.id === "string") {
      const result = await prisma.notification.updateMany({
        where: { id: body.id, userId: user.id, read: false },
        data: { read: true },
      });
      if (result.count === 0) {
        const existing = await prisma.notification.findFirst({
          where: { id: body.id, userId: user.id },
          select: { id: true },
        });
        if (!existing) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Provide a notification id or markAllRead" }, { status: 400 });
  } catch (error) {
    console.error("NOTIFICATIONS PATCH ERROR:", error);
    return NextResponse.json({ error: "Unable to update notification" }, { status: 500 });
  }
}
