"use client"
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const handleRegistration = async (e: React.FormEvent) => {
        setLoading(true)
        e.preventDefault();
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
                toast.error(data.message)
            }
        } catch {
            toast.error("An unexpected error occurred. Please try again later.")
        } finally {
            setLoading(false);
        }
    }
    return (
        <div
            className="min-h-screen w-full relative bg-[#F5F5F5]">
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
            <div
                className="flex items-center justify-center w-full h-screen relative z-10">
                <Navbar />
                <div
                    className="bg-black w-98 h-auto text-white p-8 rounded-2xl flex items-center justify-center flex-col">
                    <h1
                        className="text-xl font-bold">
                        Create your account
                    </h1>
                    <p
                        className="text-sm text-stone-400 mt-2 mb-6 text-center w-80">
                        Save smarter, together. Manage contributions with ease.
                    </p>

                    <form onSubmit={handleRegistration}>
                        <label className="text-sm text-stone-300 block mb-2">
                            Email
                        </label>

                        <input
                            className="w-80 border border-white px-3 rounded-md py-2"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <br />
                        <br />

                        <label className="text-sm text-stone-300 block mb-2">
                            Password
                        </label>

                        <input
                            className="w-80 border border-white px-3 rounded-md py-2"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <p className="text-[11px] text-stone-500 mt-2 w-80">
                            Use at least 8 characters with a mix of letters and numbers.
                        </p>

                        <br />

                        <button
                        disabled={loading}
                            className="w-80 text-black border border-[#dadada] bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                            type="submit"
                        >
                            {loading ? "Please wait..." : "Create Account"}
                        </button>
                    </form>
                    <p className="text-[11px] text-stone-500 mt-6 text-center w-80 leading-5">
                        By creating an account, you agree to our Terms of Service and Privacy
                        Policy.
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
    )
}