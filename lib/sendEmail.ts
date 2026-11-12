import nodemailer from "nodemailer";

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASS must be configured.");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
    });
}

function getFromAddress() {
    return process.env.SMTP_FROM || process.env.SMTP_USER;
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
    const transporter = getTransporter();

    await transporter.sendMail({
        from: getFromAddress(),
        to: email,
        subject: "Verify your ShareWallet email",
        text: `Welcome to ShareWallet! Verify your email using this link: ${verifyUrl}\n\nThis link expires in 1 hour.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;color:#18181b"><h2>Verify your email</h2><p>Welcome to ShareWallet. Confirm your email address to activate your account.</p><p><a href="${verifyUrl}" style="display:inline-block;background:#6D4DFE;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Verify email</a></p><p>This link expires in 1 hour. If you did not create a ShareWallet account, you can ignore this email.</p><p style="color:#71717a;font-size:12px">ShareWallet Team</p></div>`,
    });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    const transporter = getTransporter();

    await transporter.sendMail({
        from: getFromAddress(),
        to: email,
        subject: "Reset your ShareWallet password",
        text: `We received a request to reset your ShareWallet password. Use this link: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;padding:32px;border:1px solid #e4e4e7;border-radius:12px;color:#18181b"><h2>Reset your password</h2><p>We received a request to reset your ShareWallet password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#6D4DFE;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none">Reset password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p><p style="color:#71717a;font-size:12px">ShareWallet Team</p></div>`,
    });
}
