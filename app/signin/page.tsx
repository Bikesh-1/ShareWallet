"use client"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import { toast } from "sonner";

export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
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
            toast.error("An unexpected error occurred. Please try again later.")
        }finally {
    setLoading(false);
  }
    }

    return (
        <div className="min-h-screen w-full relative">
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
            <div className="flex items-center justify-center w-full h-screen relative z-10">
                <Navbar />
                <div className="bg-black w-98 h-2/3 text-white p-4 rounded-2xl flex items-center justify-center flex-col">
                    <h1 className="text-xl font-bold">Welcome back</h1>
                    <p className="text-sm text-stone-400 mt-2 mb-6 text-center w-80">
                        Sign in to continue managing your shared savings.
                    </p>

                    <form onSubmit={handleLogin}>
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
                            className="w-80 border border-white px-3 py-2 rounded-md"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="w-80 flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-sm text-stone-400 hover:text-white cursor-pointer">
                                Forgot password?
                            </button>
                        </div>
                        <br />
                        <button
                            disabled={loading}
                            className="w-80 text-black border border-[#dadada] bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer">
                            {loading ? "Please wait..." : "Sign in"}
                            
                        </button>
                    </form>
                    <p className="text-xs text-stone-400 mt-6">
                        Dont have an account?{" "}
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

    )
}