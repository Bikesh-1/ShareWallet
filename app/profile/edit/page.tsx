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
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#101014] p-7">
        <p className="text-sm font-semibold text-violet-400">ShareWallet</p>
        <h1 className="mt-4 text-2xl font-bold">Edit your profile</h1>
        <p className="mt-2 text-sm text-zinc-400">Keep your personal details up to date.</p>
        {loading ? <p className="mt-6 text-sm text-zinc-400">Loading profile...</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm text-zinc-300">Full name
              <input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block text-sm text-zinc-300">Mobile number
              <input required value={profile.mobileNumber} onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block text-sm text-zinc-300">Date of birth
              <input required type="date" max={new Date().toISOString().slice(0, 10)} value={profile.dateOfbirth} onChange={(e) => setProfile({ ...profile, dateOfbirth: e.target.value })} className="mt-2 w-full rounded-xl border border-zinc-700 bg-black px-3 py-3 text-white outline-none focus:border-violet-500" />
            </label>
            {message && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={saving} className="w-full rounded-xl bg-[#6D4DFE] px-4 py-3 font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
          </form>
        )}
        <Link href="/dashboard" className="mt-5 inline-block text-sm text-zinc-400 hover:text-white">Back to dashboard</Link>
      </section>
    </main>
  );
}
