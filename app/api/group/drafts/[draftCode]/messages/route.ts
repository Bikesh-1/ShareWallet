import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getAccess(draftCode: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return null;
  const draft = await prisma.groupDraft.findFirst({
    where: { draftCode, OR: [{ creatorId: user.id }, { members: { some: { userId: user.id } } }] },
    select: { id: true, creatorId: true, isFinalized: true },
  });
  return draft ? { user, draft } : null;
}

export async function GET(_: Request, { params }: { params: Promise<{ draftCode: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { draftCode } = await params;
    const access = await getAccess(draftCode, session.user.email);
    if (!access) return NextResponse.json({ error: "Discussion not found or access denied." }, { status: 404 });
    const messages = await prisma.groupDraftMessage.findMany({
      where: { draftId: access.draft.id },
      include: { user: { select: { id: true, userdetails: { select: { name: true, profilephoto: true } } } } },
      orderBy: { createdAt: "asc" },
      take: 300,
    });
    return NextResponse.json({ messages, currentUserId: access.user.id, creatorId: access.draft.creatorId, isFinalized: access.draft.isFinalized });
  } catch {
    return NextResponse.json({ error: "Unable to load discussion messages." }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ draftCode: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { draftCode } = await params;
    const access = await getAccess(draftCode, session.user.email);
    if (!access) return NextResponse.json({ error: "Discussion not found or access denied." }, { status: 404 });
    if (access.draft.isFinalized) return NextResponse.json({ error: "This discussion is closed." }, { status: 409 });
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) return NextResponse.json({ error: "Message must be between 1 and 2000 characters." }, { status: 400 });
    const created = await prisma.groupDraftMessage.create({ data: { draftId: access.draft.id, userId: access.user.id, message }, include: { user: { select: { id: true, userdetails: { select: { name: true, profilephoto: true } } } } } });
    return NextResponse.json({ message: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }
}
