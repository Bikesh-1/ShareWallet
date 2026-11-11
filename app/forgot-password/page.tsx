"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unable to process your request.");
            setMessage(data.message);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full relative bg-black text-white">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
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
            <div className="flex items-center justify-center w-full min-h-screen relative z-10 px-4 py-24">
                <Navbar />
                <div className="bg-black w-full max-w-md min-h-[420px] text-white p-6 sm:p-8 rounded-2xl flex items-center justify-center flex-col border border-white/10">
                    <h1 className="text-xl font-bold">Forgot password?</h1>
                    <p className="text-sm text-stone-400 mt-2 mb-6 text-center max-w-xs">
                        Enter your account email and we’ll send you a link to reset your password.
                    </p>

                    <form onSubmit={submit} className="w-full max-w-xs">
                        <label className="text-sm text-stone-300 block mb-2">
                            Email
                        </label>
                        <input
                            required
                            type="email"
                            autoComplete="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-white px-3 rounded-md py-2 bg-black text-white outline-none"
                        />
                        {message && <p role="status" className="mt-4 text-sm text-emerald-400">{message}</p>}
                        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
                        <button
                            disabled={loading}
                            className="w-full mt-6 text-black border border-[#dadada] bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer disabled:opacity-60"
                        >
                            {loading ? "Please wait..." : "Send reset link"}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => router.push("/signin")}
                        className="text-xs text-stone-400 mt-6 underline cursor-pointer hover:text-white"
                    >
                        Back to sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
