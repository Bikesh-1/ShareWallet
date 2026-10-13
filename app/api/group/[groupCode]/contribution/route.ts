import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { error } from "next/dist/build/output/log";
import { NextResponse } from "next/server";
import { use } from "react";

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
        const existingContribution = await prisma.contribution.findFirst({
            where: {
                userId: user.id,
                groupId: group.id,
                month,
            },
        });
        if (existingContribution) {
            return NextResponse.json(
                { error: "You have already submitted your contribution for this month." },
                { status: 409 }
            );
        }

        await prisma.contribution.create({
            data: {
                userId: user.id,
                groupId: group.id,
                amount: group.monthlyContribution,
                month,
                status:"PENDING",
            }
        })
        await prisma.group.update({
            where: {
                id: group.id,
            },
            data: {
                totalAmount: {
                    increment: Number(amount),
                },
            },
        });
        return NextResponse.json(
            { message: "Contribution submitted successfully." },
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