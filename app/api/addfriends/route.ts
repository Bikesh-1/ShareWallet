import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { coustumerId } = await req.json();

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const email = session.user.email as string;
        const userExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!userExist) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            )
        }
        const friendUser = await prisma.user.findFirst({
            where: {
                coustumerId
            }
        })
        if (!friendUser) {
            return NextResponse.json(
                { error: "No user found with the provided customer ID." },
                { status: 404 }
            )
        }

        if (userExist.id == friendUser.id) {
            return NextResponse.json(
                { error: "You cannot add yourself as a friend." },
                { status: 400 }
            )
        }

        const alreadyFriend = await prisma.friend.findFirst({
            where: {
                senderId: userExist.id,
                receiverId: friendUser.id,
            },
        })

        if (alreadyFriend) {
            return NextResponse.json(
                { error: "This user is already in your friend list." },
                { status: 409 }
            )
        }

        await prisma.friend.createMany({
            data: [
                {
                    senderId: userExist.id,
                    receiverId: friendUser.id
                },
                {
                    senderId: friendUser.id,
                    receiverId: userExist.id
                },
            ]
        })

        return NextResponse.json(

            { addfriend: friendUser.email, message: "Friend added successfully." },
            { status: 200 }
        )
    } catch{
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again later." },
            { status: 500 }
        )
    }

}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            )
        }
        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email!
            }
        })
        if (!currentUser) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            );
        }
        const friendlist = await prisma.friend.findMany({
            where: {
                senderId: currentUser?.id
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        coustumerId: true,
                        userdetails: { select: { name: true, profilephoto: true } },
                    },
                }
            },
        })

        return NextResponse.json(
            {
                message: "Friend list fetched successfully.",
                friendlist,
            },
            { status: 200 }
        );

    } catch{
        return NextResponse.json(
            { error: "Failed to fetch friend list." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue." },
                { status: 401 }
            );
        }

        const { coustumerId } = await req.json();

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        })

        if (!currentUser) {
            return NextResponse.json(
                { error: "User account not found." },
                { status: 404 }
            );
        }

        const friendUser = await prisma.user.findUnique({
            where: {
                coustumerId
            }
        })

        if (!friendUser) {
            return NextResponse.json(
                { error: "Friend not found." },
                { status: 404 }
            );
        }

        const deleted = await prisma.friend.deleteMany({
            where: {
                OR: [
                    {
                        senderId: currentUser.id,
                        receiverId: friendUser.id
                    },
                    {
                        senderId: friendUser.id,
                        receiverId: currentUser.id
                    }
                ]
            }
        });
        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "This user is not in your friend list." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "Friend removed successfully.",
            },
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { error: "Failed to remove friend." },
            { status: 500 }
        );
    }
}