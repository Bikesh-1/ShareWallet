"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FriendInvitePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const router = useRouter();
  const { status } = useSession();
  const [message, setMessage] = useState("Checking your invitation...");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (status !== "authenticated" || !customerId) return;
    let active = true;
    fetch("/api/addfriends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coustumerId: customerId }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to connect with this friend.");
      if (active) setMessage(data.message || "Friend added successfully.");
    }).catch((err) => {
      if (active) { setError(true); setMessage(err instanceof Error ? err.message : "Invitation could not be accepted."); }
    });
    return () => { active = false; };
  }, [status, customerId, router]);

  return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] p-5 text-black"><section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F47EA]/10 text-xl font-bold text-[#4F47EA]">S</div><h1 className="text-2xl font-bold">ShareWallet</h1><p className={`mt-3 text-sm ${error ? "text-red-600" : "text-zinc-600"}`}>{message}</p><button onClick={() => router.replace("/dashboard")} className="mt-6 w-full rounded-xl bg-[#4F47EA] px-4 py-3 text-sm font-semibold text-white">Go to dashboard</button></section></main>;
}
