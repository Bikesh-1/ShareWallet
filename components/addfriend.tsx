"use client";
import { createFriend } from "@/services/friend.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, UserPlus, Users } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Addfriend() {
  const [coustumerId, setCoustumerId] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createFriend,
    onSuccess: (data) => {
      toast.success(data.message);
      setCoustumerId("");
      queryClient.invalidateQueries({ queryKey: ["friend"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleAddingFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coustumerId.trim()) return;
    mutation.mutate({ coustumerId: coustumerId.trim() });
  };

  return (
    <section className="flex h-full min-h-[190px] flex-col justify-between rounded-3xl border border-zinc-800 bg-[#090909] p-5 text-white shadow-[0_18px_45px_rgba(20,16,45,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F47EA]/15 text-[#a9a4ff]"><UserPlus size={19} /></span><h2 className="mt-3 text-lg font-semibold">Grow your circle</h2><p className="mt-1 text-xs leading-5 text-zinc-400">Connect with friends using their unique customer ID.</p></div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-zinc-400">Invite</span>
      </div>
      <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={handleAddingFriend}>
        <input aria-label="Friend customer ID" placeholder="Enter friend customer ID" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-[#111] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#7770ff] focus:ring-2 focus:ring-[#4F47EA]/20" value={coustumerId} onChange={(e) => setCoustumerId(e.target.value)} />
        <button disabled={mutation.isPending || !coustumerId.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F47EA] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4038d5] disabled:cursor-not-allowed disabled:opacity-50" type="submit">{mutation.isPending ? "Adding..." : "Add friend"} <ArrowUpRight size={15} /></button>
      </form>
    </section>
  );
}