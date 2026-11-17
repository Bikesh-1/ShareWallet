"use client"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success("Login Successful");
                router.push("/dashboard");
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
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 0",
                    maskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),
                    repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),
                    radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)`,
                    WebkitMaskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)`,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            />
            <div className="flex items-center justify-center w-full min-h-screen relative z-10 py-10">
                <Navbar />
                <div className="bg-black w-[calc(100%-2rem)] max-w-[26rem] min-h-[30rem] text-white p-6 sm:p-8 rounded-2xl flex items-center justify-center flex-col">
                    <h1 className="text-xl font-bold">Welcome back</h1>
                    <p className="text-sm text-stone-400 mt-2 mb-6 text-center max-w-80">
                        Sign in to continue managing your shared savings.
                    </p>

                    <form onSubmit={handleLogin} className="w-full max-w-80">
                        <label htmlFor="signin-email" className="text-sm text-stone-300 block mb-2">
                            Email
                        </label>
                        <input
                            id="signin-email"
                            className="w-full border border-white/70 bg-transparent text-white placeholder:text-stone-500 px-3 rounded-md py-2 outline-none focus:border-white"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />

                        <div className="mt-5">
                            <label htmlFor="signin-password" className="text-sm text-stone-300 block mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="signin-password"
                                    className="w-full border border-white/70 bg-transparent text-white placeholder:text-stone-500 px-3 pr-11 py-2 rounded-md outline-none focus:border-white"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
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
                        </div>

                        <div className="w-full flex justify-end mt-3">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-sm text-stone-400 hover:text-white cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 text-black border border-[#dadada] bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Please wait..." : "Sign in"}
                        </button>
                    </form>

                    <p className="text-xs text-stone-400 mt-6">
                        Don&apos;t have an account?{" "}
                        <span
                            className="text-white underline cursor-pointer"
                            onClick={() => router.push("/signup")}
                        >
                            Create one
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
