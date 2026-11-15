import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const secret = () => process.env.NEXTAUTH_SECRET;
function sign(payload: string) {
  if (!secret()) throw new Error("NEXTAUTH_SECRET is not configured.");
  return createHmac("sha256", secret()!).update(payload).digest("base64url");
}
function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
  return data as { groupCode: string; inviterId: string; exp: number };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Please sign in to invite members." }, { status: 401 });
    const { groupCode } = await req.json();
    if (typeof groupCode !== "string" || !groupCode) return NextResponse.json({ error: "Group code is required." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const group = await prisma.group.findUnique({ where: { groupCode }, select: { id: true, groupName: true } });
    if (!group) return NextResponse.json({ error: "Group not found." }, { status: 404 });
    const membership = await prisma.groupmember.findFirst({ where: { groupId: group.id, userId: user.id } });
    if (!membership) return NextResponse.json({ error: "Only group members can invite friends." }, { status: 403 });
    const payload = Buffer.from(JSON.stringify({ groupCode, inviterId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
    const token = payload + "." + sign(payload);
    return NextResponse.json({ token, groupName: group.groupName, expiresIn: "7 days" });
  } catch (error) {
    console.error("Group invite creation failed:", error);
    return NextResponse.json({ error: "Unable to create group invite link." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Please sign in to join this group." }, { status: 401 });
    const { token } = await req.json();
    if (typeof token !== "string") return NextResponse.json({ error: "Invalid invite link." }, { status: 400 });
    const invite = verifyToken(token);
    if (!invite) return NextResponse.json({ error: "This invite link is invalid or has expired." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (user.id === invite.inviterId) return NextResponse.json({ error: "You cannot join your own invite." }, { status: 400 });
    const friendship = await prisma.friend.findFirst({ where: { senderId: invite.inviterId, receiverId: user.id } });
    if (!friendship) return NextResponse.json({ error: "This group invite is only for friends of the person who shared it." }, { status: 403 });
    const group = await prisma.group.findUnique({ where: { groupCode: invite.groupCode }, select: { id: true, groupName: true } });
    if (!group) return NextResponse.json({ error: "This group no longer exists." }, { status: 404 });
    const existing = await prisma.groupmember.findFirst({ where: { groupId: group.id, userId: user.id } });
    if (existing) return NextResponse.json({ message: "You are already a member of this group.", groupCode: invite.groupCode, alreadyMember: true });
    await prisma.groupmember.create({ data: { groupId: group.id, userId: user.id } });
    return NextResponse.json({ message: `You joined ${group.groupName} successfully.`, groupCode: invite.groupCode });
  } catch (error) {
    console.error("Group invite acceptance failed:", error);
    return NextResponse.json({ error: "Unable to join this group. Please try again." }, { status: 500 });
  }
}
