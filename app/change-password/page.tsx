"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to change password.");
      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
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
        <h1 className="mt-4 text-2xl font-bold">Change password</h1>
        <p className="mt-2 text-sm text-gray-500">Confirm your current password before choosing a new one.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Current password
            <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
          </label>
          <label className="block text-sm font-medium text-gray-700">New password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Confirm new password
            <input required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
          </label>
          {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-[#6D4DFE] px-4 py-3 font-semibold text-white transition hover:bg-[#5940df] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating..." : "Update password"}</button>
        </form>
        <div className="mt-5 flex justify-between text-sm text-gray-500"><Link href="/dashboard" className="hover:text-[#6D4DFE]">Dashboard</Link><button type="button" onClick={() => router.back()} className="hover:text-[#6D4DFE]">Go back</button></div>
      </section>
    </main>
  );
}
