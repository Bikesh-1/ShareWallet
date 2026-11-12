import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const genericResponse = {
    message: "If an eligible account exists for that email, a password reset link will be sent.",
  };

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(genericResponse);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isVerfied: true },
    });
    if (!user || !user.isVerfied) return NextResponse.json(genericResponse);

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    // In production, require a trusted configured origin instead of trusting the request Host header.
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!configuredAppUrl && process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_APP_URL must be configured in production.");
    }
    const origin = configuredAppUrl
      ? new URL(configuredAppUrl).origin
      : new URL(req.url).origin;
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      // Remove the unusable token, but keep the response generic to prevent account enumeration.
      await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      console.error("PASSWORD RESET EMAIL ERROR:", emailError);
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(genericResponse);
  }
}
