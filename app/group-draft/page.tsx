"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import LoginNavbar from "@/components/loginNavbar";
import { MessageCircle, Users } from "lucide-react";

type Draft = {
  id: string;
  draftCode: string;
  isFinalized: boolean;
  createdAt: string;
  creator?: { userdetails?: { name?: string | null } | null };
  members: Array<{ user: { id: string; userdetails?: { name?: string | null } | null } }>;
};

export default function GroupDraftsPage() {
  const router = useRouter();
  const { data: drafts = [], isPending: loading, isError, error } = useQuery({
    queryKey: ["group-drafts"],
    queryFn: async (): Promise<Draft[]> => {
      const res = await fetch("/api/group/drafts", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load discussions.");
      return data.drafts || [];
    },
    staleTime: 2_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });

  if (isError) console.error("GROUP DRAFTS QUERY ERROR:", error);

  return (
    <div className="min-h-screen bg-white">
      <LoginNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[#4F47EA]">ShareWallet</p><h1 className="mt-2 text-3xl font-bold text-black">Group discussions</h1><p className="mt-2 text-sm text-gray-500">Open discussions you created or were invited to before a savings group was finalized.</p></div>
          <button onClick={() => router.push("/creategroup")} className="rounded-lg bg-[#4F47EA] px-5 py-3 text-sm font-semibold text-white">Start a discussion</button>
        </div>
        {loading ? <p className="py-16 text-center text-sm text-gray-500">Loading discussions...</p> :
          drafts.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center"><MessageCircle size={30} className="mx-auto text-gray-400" /><h2 className="mt-4 font-semibold text-gray-900">No group discussions yet</h2><p className="mt-2 text-sm text-gray-500">When a friend starts a discussion with you, it will appear here.</p></div> :
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {drafts.map((draft) => <article key={draft.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#4F47EA]"><Users size={20} /></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${draft.isFinalized ? "bg-gray-100 text-gray-600" : "bg-[#F0EEFF] text-[#4F47EA]"}`}>{draft.isFinalized ? "Finalized" : "Open"}</span></div>
              <h2 className="mt-4 font-bold text-gray-900">Discussion {draft.draftCode}</h2>
              <p className="mt-1 text-sm text-gray-500">Started by {draft.creator?.userdetails?.name || "ShareWallet member"}</p>
              <p className="mt-3 text-xs text-gray-500">{draft.members.length} invited friend{draft.members.length === 1 ? "" : "s"} · {new Date(draft.createdAt).toLocaleDateString()}</p>
              <div className="mt-5 border-t border-gray-100 pt-4"><button onClick={() => router.push(`/group-draft/${draft.draftCode}`)} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">{draft.isFinalized ? "View discussion" : "Open discussion"}</button></div>
            </article>)}
          </div>}
      </main>
    </div>
  );
}
