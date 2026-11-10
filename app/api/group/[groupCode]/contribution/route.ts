import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const { amount, month } = await req.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        })
        if (!user) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            )
        }
        const group = await prisma.group.findFirst({
            where: {
                groupCode,
                OR: [
                    {
                        createdId: user.id
                    },
                    {
                        groupmember: {
                            some: {
                                userId: user.id
                            }
                        }
                    }
                ]
            }
        });
        if (!group) {
            return NextResponse.json(
                { error: "Group not found or you are not a member of this group." },
                { status: 404 }
            )
        }
        if (!month || typeof month !== "string") {
            return NextResponse.json({ error: "Contribution month is required." }, { status: 400 });
        }

        const existingContribution = await prisma.contribution.findFirst({
            where: {
                userId: user.id,
                groupId: group.id,
                month,
                requestId: null,
            },
        });
        if (existingContribution?.status === "PAID") {
            return NextResponse.json(
                { error: "Your contribution for this month is already paid." },
                { status: 409 }
            );
        }

        const createdContribution = existingContribution || await prisma.contribution.create({
            data: {
                userId: user.id,
                groupId: group.id,
                amount: group.monthlyContribution,
                month,
                status: "PENDING",
            }
        });

        return NextResponse.json(
            { message: "Contribution created. Continue to Cashfree checkout.", contribution: createdContribution },
            { status: 201 }
        )
    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ groupCode: string }> }) {
    try {
        const { groupCode } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where:{email:session.user.email}
        })

        if(!user){
            return NextResponse.json(
                {error:"User not found"},
                {status:404}
            )
        }

        const group = await prisma.group.findFirst({
            where:{
                groupCode,
                OR:[
                    {createdId: user.id},
                    {
                        groupmember:{
                            some:{userId: user.id}
                        }
                    }
                ]
            },
            select:{id: true},
        })

        if(!group){
            return NextResponse.json(
                {error:"Group not found or access denied"},
                {status:404}
            );
        }

        const contributionDetails = await prisma.contribution.findMany({
            where: {
                group: {
                    groupCode
                }
            },
            include: {
                user: {
                    include: {
                        userdetails: true
                    }
                }
            }
        });
        return NextResponse.json(
            { contributionDetails, message: "Contribution details retrieved successfully." },
            { status: 200 }
        )
    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        )
    }

}