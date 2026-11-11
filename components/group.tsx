"use client";
import { useFriendList } from "@/hooks/useFriendList";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { addingFriend } from "@/services/group.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Check, Plus, Users, Wallet } from "lucide-react";

export default function Group() {
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const router = useRouter();
  const { data: groups = [], isPending: isGroupPending, isError: isGroupError, error: groupError } = useGroupDetails();
  const { data: FriendList = [], isPending: isFriendPending, isError: isFriendError, error: friendError } = useFriendList();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addingFriend,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["group"] });
      queryClient.invalidateQueries({ queryKey: ["friend"] });
      setOpenPopup(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleAddMember = (friendCode: string) => {
    setAddingFriendId(friendCode);
    mutation.mutate(
      { groupCode: selectedGroup.groupCode, coustumerId: friendCode },
      { onSettled: () => setAddingFriendId(null) }
    );
  };

  if (isGroupPending || isFriendPending) return <div className="grid gap-4 sm:grid-cols-2"><div className="h-64 animate-pulse rounded-2xl bg-zinc-100" /><div className="h-64 animate-pulse rounded-2xl bg-zinc-100" /></div>;
  if (isGroupError || isFriendError) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{groupError?.message || friendError?.message}</p>;

  if (!groups.length) return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F47EA]/10 text-[#4F47EA]"><Users size={24} /></div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900">Your first group starts here</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Create a group for a trip, shared goal or monthly savings plan. Invite friends and build it together.</p>
      <button onClick={() => router.push("/creategroup")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4F47EA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4038d5]"><Plus size={16} /> Create your first group</button>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-2">
        {groups.map((group: any) => (
          <article key={group.id} className="group flex w-full min-w-0 flex-col rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm shadow-zinc-200/50 transition duration-200 hover:-translate-y-1 hover:border-[#c9c5ff] hover:shadow-[0_16px_36px_rgba(79,71,234,0.10)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4F47EA]/10 text-[#4F47EA]"><Users size={19} /></span>
                <div className="min-w-0"><h3 className="truncate text-base font-bold text-zinc-900">{group.groupName}</h3><p className="mt-1 truncate text-[11px] text-zinc-500">ID · {group.groupCode}</p></div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active</span>
            </div>
            <p className="mt-4 min-h-10 text-sm leading-5 text-zinc-500">{group.description || "A shared space to save, plan and achieve your goals."}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f7fa] p-4"><p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Monthly target</p><p className="mt-1 text-lg font-bold text-zinc-900">₹{Number(group.monthlyContribution || 0).toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-[#f7f7fa] p-4"><p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Group target</p><p className="mt-1 text-lg font-bold text-zinc-900">₹{Number(group.totalAmount || 0).toLocaleString("en-IN")}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500"><span className="inline-flex items-center gap-1.5"><Users size={14} /> {group.groupmember?.length || 0} members</span><span className="h-1 w-1 rounded-full bg-zinc-300" /><span className="inline-flex items-center gap-1.5"><Wallet size={14} /> Shared savings</span></div>
            <div className="mt-5 flex gap-3 border-t border-zinc-100 pt-4">
              <button onClick={() => router.push(`/group/${group.groupCode}`)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#101014] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#292638]">Open group <ArrowUpRight size={15} /></button>
              <button onClick={() => { setSelectedGroup(group); setOpenPopup(true); }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dedbff] bg-[#f7f6ff] px-3 py-2.5 text-sm font-semibold text-[#4F47EA] transition hover:bg-[#eeecff]"><Plus size={15} /> Add member</button>
            </div>
          </article>
        ))}
      </div>

      {openPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
              <div><h2 className="text-lg font-bold text-zinc-900">Add group members</h2><p className="mt-1 text-xs text-zinc-500">Invite a friend to {selectedGroup?.groupName}</p></div>
              <button type="button" onClick={() => setOpenPopup(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100">Close</button>
            </div>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto p-4 sm:p-5">
              {FriendList.length === 0 ? <div className="py-10 text-center text-sm text-zinc-500">No friends found. Add friends to your account first.</div> : FriendList.map((friend: any) => {
                const friendCode = friend.receiver.coustumerId;
                const isAdded = selectedGroup?.groupmember?.some((member: any) => member.user.coustumerId === friendCode);
                const friendName = friend.receiver.userdetails?.name ?? "Profile not completed";
                return (
                  <div key={friendCode} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-[#c9c5ff]">
                    <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4F47EA]/10 font-semibold text-[#4F47EA]">{friendName.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-zinc-900">{friendName}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{friendCode}</p></div></div>
                    <button disabled={isAdded || addingFriendId === friendCode} onClick={() => handleAddMember(friendCode)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${isAdded ? "bg-emerald-50 text-emerald-700" : "bg-[#4F47EA] text-white hover:bg-[#4038d5] disabled:opacity-60"}`}>{isAdded ? <span className="inline-flex items-center gap-1"><Check size={13} /> Added</span> : addingFriendId === friendCode ? "Adding..." : "Add"}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}