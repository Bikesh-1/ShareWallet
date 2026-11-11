import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ groupCode: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { groupCode } = await params;
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return NextResponse.json({ error: "Message must contain 1–4000 characters." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to continue." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
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
      return NextResponse.json({ error: "Group not found or you are not a member of this group." }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: { userId: user.id, groupId: group.id, message: message.trim() },
    });
    return NextResponse.json({ data: newMessage, message: "Message sent successfully." }, { status: 201 });
  } catch (error) {
    console.error("GROUP MESSAGE POST ERROR:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { groupCode } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to continue." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
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
      return NextResponse.json({ error: "Group not found or access denied." }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { groupId: group.id },
      include: { user: { include: { userdetails: true } } },
      orderBy: { createdAt: "asc" },
      take: 500,
    });
    return NextResponse.json({ data: messages }, { status: 200 });
  } catch (error) {
    console.error("GROUP MESSAGE GET ERROR:", error);
    return NextResponse.json({ error: "Unable to retrieve group messages." }, { status: 500 });
  }
}
