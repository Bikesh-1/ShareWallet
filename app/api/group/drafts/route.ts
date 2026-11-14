import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const memberIds = Array.isArray(body.memberIds) ? [...new Set(body.memberIds.filter((id: unknown) => typeof id === "string" && id !== user.id))] as string[] : [];
    if (!memberIds.length || memberIds.length > 50) return NextResponse.json({ error: "Select between 1 and 50 friends." }, { status: 400 });

    const friends = await prisma.friend.findMany({
      where: { senderId: user.id, receiverId: { in: memberIds } },
      select: { receiverId: true },
    });
    if (friends.length !== memberIds.length) return NextResponse.json({ error: "Only people in your friend list can be added." }, { status: 403 });

    const draft = await prisma.groupDraft.create({
      data: {
        draftCode: "SWD" + crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase(),
        creatorId: user.id,
        members: { create: memberIds.map((userId) => ({ userId })) },
      },
      select: { id: true, draftCode: true },
    });
    return NextResponse.json({ draft, message: "Discussion created." }, { status: 201 });
  } catch (error) {
    console.error("CREATE GROUP DRAFT:", error);
    return NextResponse.json({ error: "Unable to start group discussion." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const drafts = await prisma.groupDraft.findMany({
      where: { OR: [{ creatorId: user.id }, { members: { some: { userId: user.id } } }] },
      include: { creator: { select: { userdetails: { select: { name: true } } } }, members: { include: { user: { select: { id: true, userdetails: { select: { name: true, profilephoto: true } } } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ drafts });
  } catch {
    return NextResponse.json({ error: "Unable to fetch discussions." }, { status: 500 });
  }
}
