"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";

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
    <main className="flex min-h-screen items-center justify-center  px-4 py-10 text-black">
      <Navbar/>
            <div
                className="absolute inset-0 -z-1"
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
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-black p-7 shadow-xl shadow-black/5">
        <h1 className="mt-4 text-2xl font-bold text-white">Set a new password</h1>
        <p className="mt-2 text-sm text-white">Choose a strong password with at least 8 characters.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-white">New password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-black px-3 py-3 text-white outline-none " />
          </label>
          <label className="block text-sm font-medium text-white">Confirm password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-black px-3 py-3 text-white outline-none " />
          </label>
          {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading || !token} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-[#5940df] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating..." : "Reset password"}</button>
        </form>
        <Link href="/signin" className="mt-5 inline-block text-sm text-white">Back to sign in</Link>
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
