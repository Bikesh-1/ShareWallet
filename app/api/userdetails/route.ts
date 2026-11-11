import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, mobileNumber, dateOfbirth } = await req.json()
        if (
            typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80 ||
            typeof mobileNumber !== "string" || !/^\+?[0-9\s-]{10,16}$/.test(mobileNumber) ||
            typeof dateOfbirth !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfbirth) ||
            Number.isNaN(Date.parse(dateOfbirth))
        ) {
            return NextResponse.json({ error: "Please provide a valid name, mobile number and date of birth." }, { status: 400 })
        }
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
        // if (!userExist.isVerfied) {
        //     return NextResponse.json(
        //         { error: "Please verify your account first" },
        //         { status: 403 }
        //     )
        // }
        const existingDetails = await prisma.userdetails.findUnique({
            where: {
                user_id: userExist.id
            }
        });
        if (existingDetails) {
            return NextResponse.json(
                { error: "User profile already exists." },
                { status: 409 }
            )
        }
        const userdetails = await prisma.userdetails.create({
            data: {
                name: name,
                mobileNumber: mobileNumber,
                dateOfbirth: dateOfbirth,
                isprofileCompleted: true,
                user: {
                    connect: {
                        id: userExist.id
                    }
                }
            }
        })

        return NextResponse.json(
            { userdetails, message: "Profile details added successfully." },
            { status: 201 }
        )

    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
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

        // const userDetails = await prisma.userdetails.findUnique({
        //     where: {
        //         user_id: userExist.id,
        //     },
        //     include:{
        //         user:{
        //             select:{
        //                 coustumerId:true
        //             }
        //         }
        //     }
        // })

        const userDetails = await prisma.userdetails.findUnique({
            where: {
                user_id: userExist.id,
            },
            select: {
                id: true,
                user_id: true,
                name: true,
                mobileNumber: true,
                isprofileCompleted: true,
                profilephoto: true,
                dateOfbirth: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        coustumerId: true,
                        isVerfied: true,
                        isCompleteProfile: true,
                    },
                },
            },
        });

        return NextResponse.json({ userDetails, message: "Profile details retrieved successfully." }, { status: 200 })

    }
    catch {
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
    }
}