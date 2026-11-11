"use client";
import { useFriendList } from "@/hooks/useFriendList";
import { Users, UserRound } from "lucide-react";

export default function FriendList() {
  const { data: FriendList = [], isPending, isError, error } = useFriendList();

  if (isPending) return <div className="h-44 animate-pulse rounded-2xl bg-zinc-100" />;
  if (isError) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>;

  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/50">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6D63EF]">Your network</p><h2 className="mt-1 text-lg font-bold text-zinc-900">Friends</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600"><Users size={13} /> {FriendList.length}</span></div>
      {FriendList.length ? <div className="space-y-2">{FriendList.slice(0, 5).map((friend: any) => {
        const name = friend.receiver.userdetails?.name ?? "Profile not completed";
        return <div key={friend.receiver.coustumerId} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-zinc-50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4F47EA]/15 bg-[#4F47EA]/10 text-xs font-bold text-[#4F47EA]">{name.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-zinc-800">{name}</p><p className="truncate text-[10px] text-zinc-400">{friend.receiver.coustumerId}</p></div><UserRound size={15} className="shrink-0 text-zinc-300" /></div>;
      })}</div> : <div className="py-6 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400"><Users size={18} /></span><p className="mt-3 text-sm font-medium text-zinc-700">Your circle starts here</p><p className="mt-1 text-xs text-zinc-400">Add friends using their customer ID.</p></div>}
      {FriendList.length > 5 && <p className="mt-3 border-t border-zinc-100 pt-3 text-center text-xs text-zinc-400">Showing 5 of {FriendList.length} friends</p>}
    </section>
  );
}