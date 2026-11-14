"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Profile = { name: string; mobileNumber: string; dateOfbirth: string };

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ name: "", mobileNumber: "", dateOfbirth: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();
  const { data: profileData, isPending: loading, error: profileQueryError } = useQuery<Profile>({
    queryKey: ["profile-edit"],
    queryFn: async () => {
      const response = await fetch("/api/userdetails", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load profile.");
      return {
        name: data.userDetails?.name || "",
        mobileNumber: data.userDetails?.mobileNumber || "",
        dateOfbirth: data.userDetails?.dateOfbirth || "",
      };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (profileData) setProfile(profileData);
  }, [profileData]);

  useEffect(() => {
    if (profileQueryError) setError(profileQueryError.message);
  }, [profileQueryError]);

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
      queryClient.setQueryData(["profile-edit"], profile);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center  px-4 py-10 text-black">
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
      <section className="w-full max-w-98 rounded-2xl border border-black/10 bg-black text-white p-7 shadow-xl shadow-black/5">
        <h1 className="mt-4 text-2xl font-bold">Edit your profile</h1>
        <p className="mt-2 text-sm text-gray-500">Keep your personal details up to date.</p>
        {loading ? <p className="mt-6 text-sm text-gray-500">Loading profile...</p> : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-white">Full name
              <input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-black px-3 py-3 text-white outline-none" />
            </label>
            <label className="block text-sm font-medium text-white">Mobile number
              <input required value={profile.mobileNumber} onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-black px-3 py-3 text-white outline-none " />
            </label>
            <label className="block text-sm font-medium text-white">Date of birth
              <input required type="date" max={new Date().toISOString().slice(0, 10)} value={profile.dateOfbirth} onChange={(e) => setProfile({ ...profile, dateOfbirth: e.target.value })} className="mt-2 w-full rounded-lg border border-gray-300 bg-black px-3 py-3 text-white outline-none " />
            </label>
            {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            <button disabled={saving} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition  disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
          </form>
        )}
        <Link href="/dashboard" className="mt-5 inline-block text-sm text-white">Back to dashboard</Link>
      </section>
    </main>
  );
}
