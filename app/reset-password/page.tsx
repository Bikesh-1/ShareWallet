"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) return setError("This password reset link is invalid.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password.");
      setMessage(data.message);
      setPassword("");
      setConfirmPassword("");
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
        <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-zinc-400">Choose a strong password with at least 8 characters.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm text-zinc-300">New password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" />
          </label>
          <label className="block text-sm text-zinc-300">Confirm password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" />
          </label>
          {message && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading || !token} className="w-full rounded-xl bg-[#6D4DFE] px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Updating..." : "Reset password"}</button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">Back to sign in</Link>
      </section>
    </main>
  );
}
