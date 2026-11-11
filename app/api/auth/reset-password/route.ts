import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ error: "This password reset link is invalid or expired." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findFirst({
        where: { tokenHash, expiresAt: { gt: new Date() } },
        select: { id: true, userId: true },
      });
      if (!resetToken) return false;

      const consumed = await tx.passwordResetToken.deleteMany({
        where: { id: resetToken.id, tokenHash, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) return false;

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: passwordHash },
      });
      await tx.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });
      return true;
    });

    if (!result) {
      return NextResponse.json({ error: "This password reset link is invalid or expired." }, { status: 400 });
    }
    return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
  }
}
