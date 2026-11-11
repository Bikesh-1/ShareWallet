
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { sendVerificationEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
    try {
        const { email: rawEmail, password } = await req.json();
        const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            typeof password !== "string" || password.length < 8 || password.length > 128
        ) {
            return NextResponse.json({ error: "Enter a valid email and a password between 8 and 128 characters." }, { status: 400 });
        }
        const userExist = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (userExist) {
            return NextResponse.json(
                { message: "An account with this email already exists. Please sign in." },
                { status: 409 }
            );
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const coustumeridGen ="SW" + crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedpassword,
                coustumerId: coustumeridGen,
                isVerfied: false,
            },
        });
        const token = uuid();
        const expiresAt = new Date(
            Date.now() + 1000 * 60 * 60
        );
        await prisma.verificationToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });
        const verifyUrl =`${process.env.NEXT_PUBLIC_APP_URL}/verify-account?token=${token}`;
        await sendVerificationEmail(
            user.email,
            verifyUrl
        );
        return NextResponse.json(
            { email: user.email, message: "Account created successfully. Please verify your email before logging in."},
            { status: 201 }
        );
    } catch(error) {
        console.log(error);
        return NextResponse.json({ error: "An unexpected error occurred." },
            { status: 500 })
    }
}