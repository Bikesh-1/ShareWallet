"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowUpRight, ShieldCheck, Users, Wallet } from "lucide-react";

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
        <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F5F5F5] text-black">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 0",
                    maskImage: "repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
                    WebkitMaskImage: "repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            />
            <Navbar />

            <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] items-center justify-center gap-16 px-5 pb-12 pt-32 sm:px-8 sm:pt-36 lg:gap-24">
                <div className="hidden max-w-[430px] flex-1 lg:block">
                    <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                        <span className="h-2 w-2 rounded-full bg-black" />
                        Welcome to ShareWallet
                    </p>
                    <h1 className="text-[54px] font-bold leading-[1.06] tracking-[-0.055em] text-black xl:text-[62px]">
                        Make money<br />work better<br /><span className="text-zinc-400">together.</span>
                    </h1>
                    <p className="mt-6 max-w-[370px] text-base leading-7 text-zinc-600">
                        Bring your people together, build a saving habit and stay in control of every contribution.
                    </p>
                    <div className="mt-10 space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white"><Users size={19} /></span>
                            <div><p className="text-sm font-semibold">Save with your circle</p><p className="mt-0.5 text-xs text-zinc-500">Build goals together, one contribution at a time.</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white"><Wallet size={19} /></span>
                            <div><p className="text-sm font-semibold">Keep everything in view</p><p className="mt-0.5 text-xs text-zinc-500">Track group funds and activity in one place.</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white"><ShieldCheck size={19} /></span>
                            <div><p className="text-sm font-semibold">Stay in control</p><p className="mt-0.5 text-xs text-zinc-500">Clear requests, approvals and shared visibility.</p></div>
                        </div>
                    </div>
                    <div className="mt-12 flex items-center gap-3 text-xs font-medium text-zinc-500">
                        <span className="h-px w-10 bg-zinc-400" /> A simpler way to save together
                    </div>
                </div>

                <section className="w-full max-w-[470px] shrink-0 overflow-hidden rounded-[26px] border border-black/10 bg-black text-white shadow-[0_28px_90px_rgba(0,0,0,0.18)]">
                    <div className="border-b border-white/10 px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
                        <div className="flex items-center justify-between">
                            <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Get started</span>
                            <span className="text-xs text-white/40">01 <span className="mx-1">/</span> 02</span>
                        </div>
                        <h2 className="mt-6 text-[27px] font-bold tracking-tight sm:text-[30px]">Create your account</h2>
                        <p className="mt-2 text-sm leading-6 text-white/55">A few details and you’re ready to start saving together.</p>
                    </div>

                    <div className="px-7 py-7 sm:px-9 sm:py-8">
                        <form onSubmit={handleRegistration} className="space-y-5">
                            <div>
                                <label htmlFor="signup-email" className="mb-2 block text-xs font-semibold tracking-wide text-white/80">EMAIL ADDRESS</label>
                                <input
                                    id="signup-email"
                                    className="w-full rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/35 focus:border-white/70 focus:bg-white/[0.09]"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="signup-password" className="mb-2 block text-xs font-semibold tracking-wide text-white/80">PASSWORD</label>
                                <div className="relative">
                                    <input
                                        id="signup-password"
                                        className="w-full rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/35 focus:border-white/70 focus:bg-white/[0.09]"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-white/45 transition hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-2 text-[11px] text-white/40">At least 8 characters.</p>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="mb-2 block text-xs font-semibold tracking-wide text-white/80">CONFIRM PASSWORD</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        className="w-full rounded-xl border border-white/20 bg-white/[0.055] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/35 focus:border-white/70 focus:bg-white/[0.09]"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Enter your password again"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-4 text-white/45 transition hover:text-white" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && <p className={`mt-2 text-[11px] ${password === confirmPassword ? "text-emerald-400" : "text-red-300"}`}>{password === confirmPassword ? "Passwords match" : "Passwords do not match"}</p>}
                            </div>

                            <button disabled={loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
                                {loading ? "Creating your account..." : "Create account"}
                                {!loading && <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-[11px] leading-5 text-white/40">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                        <div className="mt-6 border-t border-white/10 pt-5 text-center">
                            <p className="text-sm text-white/55">Already have an account?{" "}
                                <button type="button" className="font-semibold text-white underline underline-offset-4 transition hover:text-white/70" onClick={() => router.push("/signin")}>Sign in</button>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
