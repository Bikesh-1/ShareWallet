import VerifyEmail from "@/email/VerifyEmail";
import { resend } from "./resend";

const fromAddress =
    process.env.RESEND_FROM_EMAIL || "ShareWallet <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, verifyUrl: string) {
    const { error } = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "Verify your email",
        react: VerifyEmail({ verifyUrl }),
    });

    if (error) {
        throw new Error(`Unable to send verification email: ${error.message}`);
    }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    const { error } = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: "Reset your ShareWallet password",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;color:#18181b"><h2>Reset your password</h2><p>We received a request to reset your ShareWallet password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#6D4DFE;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p><p style="color:#71717a;font-size:12px">ShareWallet Team</p></div>`,
    });

    if (error) {
        throw new Error(`Unable to send password reset email: ${error.message}`);
    }
}
