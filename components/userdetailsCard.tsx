"use client";
import { useUserDetails } from "@/hooks/useUserDetails";
import { CalendarDays, CreditCard, UserRound, Wallet } from "lucide-react";

export default function Userdetails() {
  const { data: userdetails, isPending, isError, error } = useUserDetails();

  if (isPending) return <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />;
  if (isError) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>;

  return (
    <section className="w-full rounded-2xl border border-zinc-800 bg-[#090909] p-5 text-white shadow-[0_16px_40px_rgba(20,16,45,0.10)] sm:p-6">
      <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Account overview</p><h2 className="mt-1 text-lg font-semibold text-white">Your profile</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300"><UserRound size={17} /></span></div>
      {userdetails ? (
        <>
          <div className="mt-5 rounded-xl border border-[#4F47EA]/35 bg-[linear-gradient(135deg,rgba(79,71,234,0.20),rgba(79,71,234,0.06))] p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-200"><Wallet size={14} /> SHAREWALLET BALANCE</div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white">₹{Number(userdetails.user.walletBalance || 0).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-[11px] leading-5 text-zinc-400">Money received from approved group requests</p>
          </div>
          <div className="mt-5 space-y-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3"><span className="flex items-center gap-2 text-xs text-zinc-400"><UserRound size={14} /> Name</span><span className="truncate text-right text-xs font-semibold text-white">{userdetails.name}</span></div>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3"><span className="flex items-center gap-2 text-xs text-zinc-400"><CreditCard size={14} /> Mobile</span><span className="text-right text-xs font-semibold text-white">{userdetails.mobileNumber}</span></div>
            <div className="flex items-center justify-between gap-3 py-3"><span className="flex items-center gap-2 text-xs text-zinc-400"><CalendarDays size={14} /> Date of birth</span><span className="text-right text-xs font-semibold text-white">{userdetails.dateOfbirth ? new Date(userdetails.dateOfbirth).toLocaleDateString("en-IN") : "—"}</span></div>
          </div>
        </>
      ) : <p className="mt-6 text-sm text-zinc-400">Profile details are not available yet.</p>}
    </section>
  );
}