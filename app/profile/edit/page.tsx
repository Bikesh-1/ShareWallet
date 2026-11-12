"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Profile = { name: string; mobileNumber: string; dateOfbirth: string };

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: "", mobileNumber: "", dateOfbirth: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/userdetails")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load profile.");
        if (active && data.userDetails) {
          setProfile({
            name: data.userDetails.name || "",
            mobileNumber: data.userDetails.mobileNumber || "",
            dateOfbirth: data.userDetails.dateOfbirth || "",
          });
        }
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load profile."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch("/api/userdetails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update profile.");
      setMessage(data.message);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-black">
      <section className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-7 shadow-xl shadow-black/5">
        <p className="text-sm font-semibold text-[#6D4DFE]">ShareWallet</p>
        <h1 className="mt-4 text-2xl font-bold">Edit your profile</h1>
        <p className="mt-2 text-sm text-gray-500">Keep your personal details up to date.</p>
        {loading ? <p className="mt-6 text-sm text-gray-500">Loading profile...</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Full name
              <input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
            </label>
            <label className="block text-sm font-medium text-gray-700">Mobile number
              <input required value={profile.mobileNumber} onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
            </label>
            <label className="block text-sm font-medium text-gray-700">Date of birth
              <input required type="date" max={new Date().toISOString().slice(0, 10)} value={profile.dateOfbirth} onChange={(e) => setProfile({ ...profile, dateOfbirth: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-black outline-none focus:border-[#6D4DFE] focus:ring-2 focus:ring-[#6D4DFE]/15" />
            </label>
            {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <button disabled={saving} className="w-full rounded-lg bg-[#6D4DFE] px-4 py-3 font-semibold text-white transition hover:bg-[#5940df] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
          </form>
        )}
        <Link href="/dashboard" className="mt-5 inline-block text-sm text-gray-500 hover:text-[#6D4DFE]">Back to dashboard</Link>
      </section>
    </main>
  );
}
