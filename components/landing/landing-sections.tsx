"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CinematicFooter } from "@/components/ui/motion-footer";
import {
  ArrowUpRight, Check, HeartHandshake, Target, Users, Sparkles,
  TrendingUp, Wallet, ShieldCheck, MessageCircle, CircleDollarSign,
} from "lucide-react";

const experienceCards = [
  { number: "01", title: "Group savings", kicker: "Save as one", description: "Create a savings circle with the people you trust. Set a shared goal and move towards it together.", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85" },
  { number: "02", title: "Monthly contributions", kicker: "Stay consistent", description: "Bring monthly contributions into one organised space and make your group's progress easier to follow.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1100&q=85" },
  { number: "03", title: "Emergency support", kicker: "Show up together", description: "When an unexpected expense comes up, members can request support from their circle and coordinate help.", image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1100&q=85" },
  { number: "04", title: "Shared experiences", kicker: "Make it happen", description: "Plan a trip, a big purchase or a milestone together. Turn a shared idea into a goal you can work towards.", image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1100&q=85" },
];

const steps = [
  { number: "01", title: "Create a circle", description: "Start a group around something you want to achieve.", icon: Users },
  { number: "02", title: "Invite your people", description: "Bring friends and family you trust into your circle.", icon: HeartHandshake },
  { number: "03", title: "Grow together", description: "Coordinate contributions and keep your shared goal moving.", icon: TrendingUp },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6258E8]">{children}</p>;
}

function SavingsExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = experienceCards[activeIndex];

  return (
    <section className="relative overflow-hidden bg-[#F5F5F7] px-5 py-20 sm:px-8 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#6D4DFE]/[0.07] blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><Eyebrow>One wallet. More possibilities.</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#111116] sm:text-5xl">Make more happen <span className="text-[#6258E8]">together.</span></h2></div>
          <p className="max-w-sm text-sm leading-7 text-zinc-500">A shared space for the plans, people and moments that matter.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-between rounded-[1.8rem] border border-zinc-200/80 bg-white p-7 shadow-[0_18px_60px_rgba(20,20,40,0.035)] sm:p-9">
            <div>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.18em] text-zinc-400">{active.number} / 04</span><span className="rounded-full bg-[#F0EEFF] px-3 py-1.5 text-[10px] font-semibold text-[#6258E8]">{active.kicker}</span></div>
              <AnimatePresence mode="wait">
                <motion.div key={active.number} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                  <h3 className="mt-12 text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-zinc-950 sm:text-4xl">{active.title}</h3>
                  <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600">{active.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-12 flex items-center justify-between gap-4">
              <div className="flex gap-2">{experienceCards.map((card, index) => <button key={card.number} aria-label={`Show ${card.title}`} aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-10 bg-[#6258E8]" : "w-4 bg-zinc-200 hover:bg-zinc-400"}`} />)}</div>
              <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 transition hover:text-[#6258E8]">Get started <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          <div className="relative min-h-[340px] overflow-hidden rounded-[1.8rem] bg-zinc-900 sm:min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div key={active.image} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${active.image}')` }} />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
            <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">ShareWallet experience</div>
            <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4 text-white sm:inset-x-9 sm:bottom-9">
              <div><p className="text-xs text-white/65">Built around your circle</p><p className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{active.kicker}</p></div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md"><ArrowUpRight size={19} /></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingSections() {
  return (
    <>
      <section id="about" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div><Eyebrow>Money feels different together</Eyebrow><h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#111116] sm:text-6xl lg:text-7xl">Your people.<br />Your goals. <span className="text-[#6258E8]">One circle.</span></h2></div>
          <div className="max-w-md lg:justify-self-end"><p className="text-base leading-8 text-zinc-600 sm:text-lg">ShareWallet brings your circle, shared plans and contributions into one simple place. Less chasing. More making progress together.</p><a href="#how-it-works" className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 hover:text-[#6258E8]">See how it works <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></a></div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full border border-[#6D4DFE]/10" />
      </section>

      <SavingsExperience />

      <section id="how-it-works" className="bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><Eyebrow>Simple by design</Eyebrow><h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.055em] text-zinc-950 sm:text-5xl">Three steps to start <span className="text-[#6258E8]">strong.</span></h2></div><p className="max-w-sm text-sm leading-7 text-zinc-500">No complicated setup. Just bring your people and a goal worth sharing.</p></div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {steps.map((step) => { const Icon = step.icon; return <motion.article key={step.number} whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="group rounded-[1.6rem] border border-zinc-200 bg-[#FAFAFB] p-7 sm:p-9"><div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.2em] text-[#6258E8]">{step.number}</span><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#6258E8] shadow-sm transition group-hover:bg-[#6258E8] group-hover:text-white"><Icon size={22} /></span></div><h3 className="mt-14 text-xl font-semibold tracking-[-0.04em] text-zinc-950">{step.title}</h3><p className="mt-3 max-w-xs text-sm leading-7 text-zinc-600">{step.description}</p></motion.article>; })}
          </div>
        </div>
      </section>

      <section id="product" className="overflow-hidden bg-[#F5F5F7] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div><Eyebrow>Your group at a glance</Eyebrow><h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.055em] text-zinc-950 sm:text-5xl">Everything in sync. <span className="text-[#6258E8]">Everyone in.</span></h2><p className="mt-5 max-w-md text-sm leading-7 text-zinc-600">Keep your groups, members, contributions and activity organised in one shared workspace.</p><ul className="mt-8 space-y-4">{["See your savings circles in one place","Follow contribution activity","Stay connected with your members"].map((item) => <li key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAE8FF] text-[#6258E8]"><Check size={14} /></span>{item}</li>)}</ul><Link href="/signup" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#111116] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6258E8]">Create your circle <ArrowUpRight size={16} /></Link></div>
          <div className="relative mx-auto w-full max-w-[650px]"><div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#DAD6FF] via-white to-[#E8E4FF] blur-2xl" /><div className="relative overflow-hidden rounded-[1.7rem] border border-white bg-white shadow-[0_30px_90px_rgba(40,35,100,0.12)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#6258E8]" /><span className="text-sm font-bold text-zinc-900">ShareWallet</span></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">Group workspace</span></div>
            <div className="grid gap-5 p-6 sm:grid-cols-[1fr_0.8fr] sm:p-8"><div><p className="text-xs text-zinc-500">Your savings circle</p><h3 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">The Weekend Crew</h3><p className="mt-1 text-xs text-zinc-400">A shared goal, built together</p><div className="mt-8 rounded-2xl border border-zinc-100 bg-[#FAFAFC] p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-zinc-500">Group members</span><Users size={16} className="text-[#6258E8]" /></div><div className="mt-5 flex -space-x-2">{["A","R","S","M"].map((letter,i)=><span key={letter} className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-xs font-bold ${["bg-violet-100 text-violet-700","bg-blue-100 text-blue-700","bg-orange-100 text-orange-700","bg-emerald-100 text-emerald-700"][i]}`}>{letter}</span>)}</div><p className="mt-4 text-xs text-zinc-500">Your people, in one place.</p></div></div>
              <div className="rounded-2xl bg-[#F4F2FF] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6258E8]"><Target size={19} /></div><p className="mt-6 text-xs font-medium text-zinc-500">Shared goal</p><p className="mt-1 text-lg font-semibold text-zinc-900">Plan it together</p><div className="mt-6 h-2 overflow-hidden rounded-full bg-[#E1DEFF]"><div className="h-full w-2/3 rounded-full bg-[#6D63EF]" /></div><p className="mt-3 text-[10px] leading-5 text-zinc-500">A clear view of your group journey.</p></div>
            </div><div className="border-t border-zinc-100 px-6 py-4 text-[10px] text-zinc-400">Illustrative product preview</div>
          </div></div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-28"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#111116] px-7 py-16 text-center text-white sm:px-12 lg:py-24"><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" /><div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" /><div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B8B2FF]"><Sparkles size={23} /></div><Eyebrow>Your next chapter starts here</Eyebrow><h2 className="relative z-10 mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Big goals feel closer when you <span className="text-[#AAA4FF]">share them.</span></h2><p className="relative z-10 mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">Bring your circle together and take the first step towards a shared savings goal.</p><Link href="/signup" className="relative z-10 mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#EAE8FF]">Create your account <ArrowUpRight size={17} /></Link></div></section>

      <CinematicFooter />
    </>
  );
}
