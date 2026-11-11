"use client";
import { useUserDetails } from "@/hooks/useUserDetails";
import { Check, Clipboard, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Welcomemsg() {
  const { data: userdetails, isPending, isError, error } = useUserDetails();
  const [copied, setCopied] = useState(false);

  if (isPending) return <div className="h-[190px] animate-pulse rounded-3xl bg-zinc-100" />;
  if (isError) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</p>;
  if (!userdetails) return <div className="rounded-3xl bg-[#101014] p-7 text-white">Complete your profile to get started.</div>;

  const customerId = userdetails.user.coustumerId;
  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(customerId);
      setCopied(true);
      toast.success("Customer ID copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy customer ID");
    }
  };

  return (
    <section className="relative flex min-h-[190px] w-full items-center justify-between overflow-hidden rounded-3xl border border-[#28213d] bg-[#0c0c15] px-6 py-7 text-white shadow-[0_18px_45px_rgba(20,16,45,0.12)] sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_45%,rgba(79,71,234,0.28),transparent_42%),linear-gradient(115deg,transparent_45%,rgba(91,38,137,0.25))]" />
      <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute right-8 top-8 h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_18px_5px_rgba(167,139,250,0.35)]" />
      <div className="relative z-10 min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-200"><Sparkles size={12} /> Your ShareWallet</div>
        <p className="text-sm text-zinc-400">Welcome back,</p>
        <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">{userdetails.name}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-400 sm:text-sm">
          <span>Customer ID</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 font-mono text-white">{customerId}</span>
          <button type="button" onClick={copyId} aria-label="Copy customer ID" className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-violet-400/50 hover:bg-white/10 hover:text-white">{copied ? <Check size={16} /> : <Clipboard size={16} />}</button>
        </div>
      </div>
      <div className="relative z-10 ml-3 hidden shrink-0 sm:block">
        <div className="absolute inset-0 scale-75 rounded-full bg-violet-500/20 blur-2xl" />
        <Image src="/wallet.png" alt="Digital wallet illustration" width={104} height={104} className="relative drop-shadow-[0_12px_20px_rgba(139,92,246,0.2)]" />
      </div>
    </section>
  );
}