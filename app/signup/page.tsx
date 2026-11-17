"use client"

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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

            <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32">
                <section className="w-full max-w-[680px] rounded-[22px] bg-black px-6 py-7 text-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] sm:px-10 sm:py-8">
                    <div className="mb-7 text-center">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-[27px]">Create your account</h1>
                        <p className="mx-auto mt-2 max-w-[390px] text-sm leading-6 text-stone-400">
                            Save smarter, together. Manage contributions with ease.
                        </p>
                    </div>

                    <form onSubmit={handleRegistration} className="mx-auto w-full max-w-[560px]">
                        <div>
                            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-white">Email</label>
                            <input
                                id="signup-email"
                                className="w-full rounded-lg border border-white/60 bg-transparent px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-white focus:ring-2 focus:ring-white/10"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
                            <div className="min-w-0">
                                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-white">Password</label>
                                <div className="relative">
                                    <input
                                        id="signup-password"
                                        className="w-full rounded-lg border border-white/60 bg-transparent px-3.5 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-white focus:ring-2 focus:ring-white/10"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 transition hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-2 text-[11px] text-stone-500">At least 8 characters.</p>
                            </div>

                            <div className="min-w-0">
                                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-white">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        className="w-full rounded-lg border border-white/60 bg-transparent px-3.5 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-white focus:ring-2 focus:ring-white/10"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 transition hover:text-white" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && (
                                    <p className={`mt-2 text-[11px] ${password === confirmPassword ? "text-emerald-400" : "text-red-300"}`}>
                                        {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="mt-7 w-full rounded-lg border border-white bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
                            type="submit"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="mx-auto mt-6 max-w-[440px] text-center text-[11px] leading-5 text-stone-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <p className="mt-5 text-center text-sm text-stone-400">
                        Already have an account?{" "}
                        <button type="button" className="font-medium text-white underline underline-offset-2 hover:text-stone-300" onClick={() => router.push("/signin")}>
                            Sign in
                        </button>
                    </p>
                </section>
            </main>
        </div>
    );
}
