import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse, userAgent } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ groupCode: string }> }
) {
    try {
        const { groupCode } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to continue."},
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

        const groupDetails = await prisma.group.findFirst({
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
            include:{
                groupmember:{
                    include:{
                        user: {
                            select: {
                                id: true,
                                email: true,
                                coustumerId: true,
                                userdetails: { select: { name: true, profilephoto: true } },
                            },
                        }
                    }
                }
            }
        })
        if (!groupDetails) {
            return NextResponse.json(
                { error: "Group not found or access denied" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { groupDetails, message: "Group details retrieved successfully.", },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: "An unexpected error occurred while fetching group details." },
            { status: 500 }
        )
    }
}