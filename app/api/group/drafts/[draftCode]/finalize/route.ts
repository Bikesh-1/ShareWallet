import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ draftCode: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { draftCode } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const body = await req.json();
    const groupName = typeof body.groupName === "string" ? body.groupName.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const monthlyContribution = Number(body.monthlyContribution);
    const dueDate = typeof body.dueDate === "string" ? body.dueDate : "";
    const repaymentDueDate = typeof body.repaymentDueDate === "string" ? body.repaymentDueDate : null;
    const repaymentTerms = typeof body.repaymentTerms === "string" ? body.repaymentTerms.trim() : "";
    const interestFree = body.interestFree !== false;

    if (groupName.length < 2 || groupName.length > 60) return NextResponse.json({ error: "Group name must be between 2 and 60 characters." }, { status: 400 });
    if (!description || description.length > 500) return NextResponse.json({ error: "Add a group description (maximum 500 characters)." }, { status: 400 });
    if (!Number.isSafeInteger(monthlyContribution) || monthlyContribution < 0) return NextResponse.json({ error: "Monthly contribution must be a non-negative whole number." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return NextResponse.json({ error: "Choose a valid monthly due date." }, { status: 400 });
    if (repaymentDueDate && !/^\d{4}-\d{2}-\d{2}$/.test(repaymentDueDate)) return NextResponse.json({ error: "Choose a valid repayment due date." }, { status: 400 });

    const draft = await prisma.groupDraft.findUnique({ where: { draftCode }, include: { members: { select: { userId: true } } } });
    if (!draft) return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
    if (draft.creatorId !== user.id) return NextResponse.json({ error: "Only the discussion creator can finalize group details." }, { status: 403 });
    if (draft.isFinalized) return NextResponse.json({ error: "This discussion has already been finalized." }, { status: 409 });

    const groupCode = "SWG" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.groupDraft.updateMany({ where: { id: draft.id, creatorId: user.id, isFinalized: false }, data: { isFinalized: true } });
      if (claimed.count !== 1) throw new Error("This discussion has already been finalized.");
      const group = await tx.group.create({
        data: {
          groupName, groupCode, description, monthlyContribution, dueDate,
          repaymentDueDate, repaymentTerms: repaymentTerms || null, interestFree, totalAmount: 0,
          createdBy: { connect: { id: user.id } },
          groupmember: { create: [{ userId: user.id }, ...draft.members.filter((member) => member.userId !== user.id).map((member) => ({ userId: member.userId }))] },
        },
      });
      return group;
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ group: result, message: "Group created successfully." }, { status: 201 });
  } catch (error) {
    console.error("FINALIZE GROUP DRAFT:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create group." }, { status: 500 });
  }
}
