"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, Users, Wallet } from "lucide-react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match. Please check and try again.");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F5F5F5] text-[#171717]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.055) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 25%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 25%, transparent 100%)",
                }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-48 h-72 w-72 rounded-full bg-[#6D4DFE]/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#FF5A36]/[0.08] blur-3xl" />

            <Navbar />

            <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-10 pt-32 sm:px-6 sm:pb-14 sm:pt-36">
                <section className="w-full max-w-[480px] overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_24px_80px_rgba(20,20,30,0.12)]">
                    <div className="bg-[#111116] px-7 pb-7 pt-8 text-center text-white sm:px-10 sm:pt-9">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#B7AEFF]">
                            <Wallet size={23} strokeWidth={1.8} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#B7AEFF]">Start saving together</p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-[28px]">Create your account</h1>
                        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-white/60">
                            Save smarter, together. Manage contributions with ease.
                        </p>
                    </div>

                    <div className="px-6 py-7 sm:px-10 sm:py-9">
                        <form onSubmit={handleRegistration} className="space-y-5">
                            <div>
                                <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-[#292832]">Email address</label>
                                <input
                                    id="signup-email"
                                    className="w-full rounded-xl border border-[#E1E0E7] bg-[#FAFAFB] px-4 py-3 text-sm text-[#171717] outline-none transition placeholder:text-[#A1A0AA] focus:border-[#6D4DFE] focus:bg-white focus:ring-4 focus:ring-[#6D4DFE]/10"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-[#292832]">Password</label>
                                <div className="relative">
                                    <input
                                        id="signup-password"
                                        className="w-full rounded-xl border border-[#E1E0E7] bg-[#FAFAFB] px-4 py-3 pr-12 text-sm text-[#171717] outline-none transition placeholder:text-[#A1A0AA] focus:border-[#6D4DFE] focus:bg-white focus:ring-4 focus:ring-[#6D4DFE]/10"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-[#8B8995] transition hover:text-[#6D4DFE]" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-[#85838E]">Use at least 8 characters.</p>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#292832]">Confirm password</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        className="w-full rounded-xl border border-[#E1E0E7] bg-[#FAFAFB] px-4 py-3 pr-12 text-sm text-[#171717] outline-none transition placeholder:text-[#A1A0AA] focus:border-[#6D4DFE] focus:bg-white focus:ring-4 focus:ring-[#6D4DFE]/10"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Enter your password again"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-[#8B8995] transition hover:text-[#6D4DFE]" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <p className={`mt-2 text-xs font-medium ${password === confirmPassword ? "text-emerald-600" : "text-rose-600"}`}>
                                        {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                                    </p>
                                )}
                            </div>

                            <button
                                disabled={loading}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#111116] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,17,22,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4F47EA] hover:shadow-[0_12px_24px_rgba(79,71,234,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                                type="submit"
                            >
                                {loading ? "Creating your account..." : "Create account"}
                            </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#ECEBF0]" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A09EAA]">Your money, together</span>
                            <div className="h-px flex-1 bg-[#ECEBF0]" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-xl bg-[#F7F6FF] px-2 py-3">
                                <Users className="mx-auto mb-1.5 text-[#6D4DFE]" size={17} />
                                <p className="text-[10px] font-semibold text-[#555363]">Save as a group</p>
                            </div>
                            <div className="rounded-xl bg-[#F7F6FF] px-2 py-3">
                                <Wallet className="mx-auto mb-1.5 text-[#6D4DFE]" size={17} />
                                <p className="text-[10px] font-semibold text-[#555363]">Track funds</p>
                            </div>
                            <div className="rounded-xl bg-[#F7F6FF] px-2 py-3">
                                <ShieldCheck className="mx-auto mb-1.5 text-[#6D4DFE]" size={17} />
                                <p className="text-[10px] font-semibold text-[#555363]">Stay secure</p>
                            </div>
                        </div>

                        <p className="mt-6 text-center text-xs leading-5 text-[#92909B]">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                        <p className="mt-5 text-center text-sm text-[#777581]">
                            Already have an account?{" "}
                            <button type="button" className="font-semibold text-[#4F47EA] underline-offset-4 hover:underline" onClick={() => router.push("/signin")}>
                                Sign in
                            </button>
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
