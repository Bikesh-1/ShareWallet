"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
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
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-7 shadow-xl shadow-black/5">
        <p className="text-sm font-semibold text-[#6D4DFE]">ShareWallet</p>
        <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-gray-500">Choose a strong password with at least 8 characters.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">New password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Confirm password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
          </label>
          {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading || !token} className="w-full rounded-lg bg-[#6D4DFE] px-4 py-3 font-semibold text-white transition hover:bg-[#5940df] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating..." : "Reset password"}</button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-sm text-gray-500 hover:text-[#6D4DFE]">Back to sign in</Link>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Loading reset form...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
