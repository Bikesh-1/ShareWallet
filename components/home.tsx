import Addfriend from "./addfriend";
import FriendList from "./friendlist";
import Group from "./group";
import Userdetails from "./userdetailsCard";
import Welcomemsg from "./welcomemsg";
import { ArrowUpRight, ShieldCheck, Users, Wallet } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-1 py-2 sm:px-2 lg:space-y-9">
      <section className="grid grid-cols-1 items-stretch gap-5 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Welcomemsg />
        <Addfriend />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/50">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F47EA]/10 text-[#4F47EA]"><Users size={20} /></span>
          <div><p className="text-xs font-medium text-zinc-500">Your community</p><p className="mt-0.5 text-sm font-semibold text-zinc-900">Groups & friends</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/50">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4F47EA]/10 text-[#4F47EA]"><Wallet size={20} /></span>
          <div><p className="text-xs font-medium text-zinc-500">Your money, together</p><p className="mt-0.5 text-sm font-semibold text-zinc-900">Simple group savings</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/50">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck size={20} /></span>
          <div><p className="text-xs font-medium text-zinc-500">Built around trust</p><p className="mt-0.5 text-sm font-semibold text-zinc-900">Transparent contributions</p></div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_350px] 2xl:gap-9">
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6D63EF]">Your workspace</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#101014] sm:text-[28px]">Your Groups</h2><p className="mt-1 text-sm text-zinc-500">Keep your plans moving, together.</p></div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live overview</span>
          </div>
          <Group />
        </section>

        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
          <Userdetails />
          <FriendList />
          <div className="rounded-2xl border border-[#e5e3ff] bg-gradient-to-br from-[#f7f6ff] to-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F47EA] text-white"><ArrowUpRight size={18} /></div>
            <h3 className="mt-4 font-semibold text-zinc-900">Better together</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500">Invite people you trust and make your next savings goal a shared one.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}