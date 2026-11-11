import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required." },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid verification link." },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification link has expired." },
        { status: 400 }
      );
    }

    const consumed = await prisma.$transaction(async (tx) => {
      const claimed = await tx.verificationToken.deleteMany({
        where: { id: verificationToken.id, token, expiresAt: { gt: new Date() } },
      });
      if (claimed.count !== 1) return false;

      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { isVerfied: true },
      });
      return true;
    });

    if (!consumed) {
      return NextResponse.json({ message: "Verification link is invalid or has already been used." }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}