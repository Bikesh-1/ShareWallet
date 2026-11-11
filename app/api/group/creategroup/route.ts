import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { groupName, description, monthlyContribution, dueDate, totalAmount } = await req.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const email = session.user.email;
        const userExist = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!userExist) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            )
        }
        const groupCode = "SWG" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
        const createGroup = await prisma.group.create({
            data: {
                groupName,
                groupCode,
                description,
                monthlyContribution,
                dueDate,
                totalAmount,
                createdBy: {
                    connect: {
                        id: userExist.id,
                        email: userExist.email
                    }

                }
            }
        })
        return NextResponse.json(
            { createGroup, message: "Group created successfully.", },
            { status: 201 }
        )

    } catch {
        return NextResponse.json(
            { error: "An unexpected error occurred while creating the group." },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const email = session.user.email as string;
        const userExist = await prisma.user.findUnique({
            where: {
                email,
            }
        })
        if (!userExist) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            )
        }

        const groupDetails = await prisma.group.findMany({
            where: {
                OR: [
                    {
                        createdId: userExist.id,
                    },
                    {
                        groupmember: {
                            some: {
                                userId: userExist.id,
                            },
                        },
                    },
                ],
            },
            include: {
                groupmember: {
                    include: {
                        user: {
                            select: {
                                coustumerId: true,
                            },
                        },
                    },
                },
                contribution: true,
                message: true,
                createdBy: true,
            },
        });
        if (groupDetails.length === 0) {
            return NextResponse.json(
                {
                    message: "No groups found.",
                    groupDetails: [],
                },
                {
                    status: 200,
                }
            );
        }
        return NextResponse.json({ groupDetails, message: "Groups fetched successfully.", }, { status: 200 })
    } catch{
        return NextResponse.json({ error: "An unexpected error occurred while fetching groups." }, { status: 500 })
    }
}