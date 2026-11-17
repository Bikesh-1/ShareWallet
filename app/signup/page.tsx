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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
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
        <div className="min-h-screen w-full relative bg-[#F5F5F5]">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 0",
                    maskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)`,
                    WebkitMaskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)`,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            />
            <div className="flex items-center justify-center w-full min-h-screen relative z-10 py-10">
                <Navbar />
                <div className="bg-black w-[calc(100%-2rem)] max-w-[26rem] h-auto text-white p-8 rounded-2xl flex items-center justify-center flex-col">
                    <h1 className="text-xl font-bold">Create your account</h1>
                    <p className="text-sm text-stone-400 mt-2 mb-6 text-center max-w-80">
                        Save smarter, together. Manage contributions with ease.
                    </p>

                    <form onSubmit={handleRegistration} className="w-full max-w-80">
                        <label htmlFor="signup-email" className="text-sm text-stone-300 block mb-2">
                            Email
                        </label>
                        <input
                            id="signup-email"
                            className="w-full border border-white/70 bg-transparent text-white placeholder:text-stone-500 px-3 rounded-md py-2 outline-none focus:border-white"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />

                        <div className="mt-5">
                            <label htmlFor="signup-password" className="text-sm text-stone-300 block mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="signup-password"
                                    className="w-full border border-white/70 bg-transparent text-white placeholder:text-stone-500 px-3 pr-11 rounded-md py-2 outline-none focus:border-white"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-stone-400 hover:text-white"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-2">
                                Use at least 8 characters with a mix of letters and numbers.
                            </p>
                        </div>

                        <div className="mt-5">
                            <label htmlFor="confirm-password" className="text-sm text-stone-300 block mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    className="w-full border border-white/70 bg-transparent text-white placeholder:text-stone-500 px-3 pr-11 rounded-md py-2 outline-none focus:border-white"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((value) => !value)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-stone-400 hover:text-white"
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    aria-pressed={showConfirmPassword}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && (
                                <p className={`text-[11px] mt-2 ${password === confirmPassword ? "text-green-400" : "text-red-400"}`}>
                                    {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                                </p>
                            )}
                        </div>

                        <button
                            disabled={loading}
                            className="w-full mt-6 text-black border border-[#dadada] bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            type="submit"
                        >
                            {loading ? "Please wait..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-[11px] text-stone-500 mt-6 text-center max-w-80 leading-5">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </p>
                    <p className="text-xs text-stone-400 mt-4">
                        Already have an account?{" "}
                        <span
                            className="text-white underline cursor-pointer"
                            onClick={() => router.push("/login")}
                        >
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
