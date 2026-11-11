"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#101014] p-7">
        <p className="text-sm font-semibold text-violet-400">ShareWallet</p>
        <h1 className="mt-4 text-2xl font-bold">Forgot password?</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your account email. If it belongs to an eligible account, we’ll send a reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm text-zinc-300">Email address
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" placeholder="you@example.com" />
          </label>
          {message && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-[#6D4DFE] px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">Back to sign in</Link>
      </section>
    </main>
  );
}
