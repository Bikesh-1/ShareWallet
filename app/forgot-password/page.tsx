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
        <main className="relative min-h-screen w-full overflow-hidden bg-white text-black">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.12) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    maskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 35%, transparent 90%)",
                    WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 0% 0%, #000 35%, transparent 90%)",
                }}
            />
            <Navbar />
            <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-24">
                <section className="flex min-h-[420px] w-full max-w-md flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-6 text-black shadow-xl shadow-black/5 sm:p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6D4DFE]/10 text-xl font-bold text-[#6D4DFE]">
                        SW
                    </div>
                    <h1 className="text-xl font-bold">Forgot password?</h1>
                    <p className="mb-6 mt-2 max-w-xs text-center text-sm leading-relaxed text-gray-500">
                        Enter your account email and we’ll send you a link to reset your password.
                    </p>

                    <form onSubmit={submit} className="w-full max-w-xs">
                        <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="forgot-email"
                            required
                            type="email"
                            autoComplete="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15"
                        />
                        {message && <p role="status" className="mt-4 text-sm text-emerald-700">{message}</p>}
                        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
                        <button
                            disabled={loading}
                            className="mt-6 w-full rounded-lg bg-black px-3 py-2.5 text-[15px] font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Please wait..." : "Send reset link"}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => router.push("/signin")}
                        className="mt-6 cursor-pointer text-xs text-gray-500 underline transition hover:text-[#6D4DFE]"
                    >
                        Back to sign in
                    </button>
                </section>
            </div>
        </main>
    );
}
