import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const body = await req.json();
        const month = body?.month;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized. Please sign in to continue." }, { status: 401 });
        }

        if (typeof month !== "string" || !/^\\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
            return NextResponse.json({ error: "Month must use YYYY-MM format." }, { status: 400 });
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
            select: { id: true, monthlyContribution: true },
        });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you are not a member of this group." }, { status: 404 });
        }

        // Amount is intentionally taken from the group's configured contribution, never from the client.
        const existingContribution = await prisma.contribution.findFirst({
            where: { userId: user.id, groupId: group.id, month, requestId: null },
        });

        if (existingContribution?.status === "PAID") {
            return NextResponse.json({ error: "Your contribution for this month is already paid." }, { status: 409 });
        }

        if (existingContribution) {
            return NextResponse.json({
                message: "A contribution for this month already exists.",
                contribution: existingContribution,
            }, { status: 200 });
        }

        try {
            const contribution = await prisma.contribution.create({
                data: {
                    userId: user.id,
                    groupId: group.id,
                    amount: group.monthlyContribution,
                    month,
                    status: "PENDING",
                },
            });

            return NextResponse.json({
                message: "Contribution created. Continue to Cashfree checkout.",
                contribution,
            }, { status: 201 });
        } catch (error) {
            // The database partial unique index is the final guard against concurrent duplicate requests.
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
                const contribution = await prisma.contribution.findFirst({
                    where: { userId: user.id, groupId: group.id, month, requestId: null },
                });

                if (contribution) {
                    return NextResponse.json({
                        message: "A contribution for this month already exists.",
                        contribution,
                    }, { status: contribution.status === "PAID" ? 409 : 200 });
                }
            }
            throw error;
        }
    } catch (error) {
        console.error("CREATE CONTRIBUTION ERROR:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized. Please sign in to continue." }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
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

        const contributionDetails = await prisma.contribution.findMany({
            where: { groupId: group.id },
            include: {
                user: { include: { userdetails: true } },
            },
            orderBy: { month: "desc" },
        });

        return NextResponse.json({
            contributionDetails,
            message: "Contribution details retrieved successfully.",
        }, { status: 200 });
    } catch (error) {
        console.error("GET CONTRIBUTIONS ERROR:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
