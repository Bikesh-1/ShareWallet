"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CinematicFooter } from "@/components/ui/motion-footer";
import {
  ArrowUpRight, ArrowRight, Users, CalendarDays, Zap, Wallet,
  ShieldCheck, TrendingUp, HandCoins, Bell, Plus, ChevronRight,
} from "lucide-react";

const features = [
  { number: "01", title: "Group savings", description: "Create a circle with friends and save towards something that matters.", icon: Wallet },
  { number: "02", title: "Monthly contributions", description: "Keep contributions organised and see how your group is progressing.", icon: CalendarDays },
  { number: "03", title: "Emergency support", description: "Request help from your circle when an unexpected expense comes up.", icon: Zap },
];

const steps = [
  { number: "01", title: "Create a group", description: "Start with a shared goal and invite your people." },
  { number: "02", title: "Contribute together", description: "Build a steady habit with clear monthly contributions." },
  { number: "03", title: "Reach the goal", description: "Track progress and support each other along the way." },
];

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500"><span className="text-[#5145E5]">{number}</span><span className="h-px w-8 bg-zinc-300" />{children}</div>;
}

function ProductShowcase() {
  return (
    <section id="product" className="relative overflow-hidden bg-[#2114D8] px-5 py-16 text-white sm:px-8 lg:py-20">
      <div aria-hidden="true" className="absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full border border-white/15" />
      <div aria-hidden="true" className="absolute -right-8 -top-24 h-[360px] w-[360px] rounded-full border border-white/15" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="max-w-lg">
          <SectionLabel number="03" ><span className="text-white/65">Inside ShareWallet</span></SectionLabel>
          <h2 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.065em] sm:text-6xl">Your circle.<br />At a glance.</h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/70 sm:text-base">A shared space to see your groups, follow contributions and keep every member on the same page.</p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            {["Group activity in one place","Contribution visibility","Requests and updates"].map((item) => <li key={item} className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15"><ShieldCheck size={12} /></span>{item}</li>)}
          </ul>
          <Link href="/signup" className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#2114D8] transition hover:-translate-y-1">Explore your workspace <ArrowUpRight size={16} /></Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7 }} className="relative mx-auto w-full max-w-[760px]">
          <div className="overflow-hidden rounded-t-[1.2rem] border-[7px] border-[#171717] bg-white text-zinc-900 shadow-[0_35px_100px_rgba(0,0,0,0.3)] sm:border-[10px]">
            <div className="flex h-9 items-center gap-1.5 bg-[#F6F6F8] px-4"><span className="h-2 w-2 rounded-full bg-[#FF6B6B]" /><span className="h-2 w-2 rounded-full bg-[#F5C451]" /><span className="h-2 w-2 rounded-full bg-[#55C58B]" /><span className="ml-3 text-[9px] font-semibold text-zinc-400">app.sharewallet.live</span></div>
            <div className="grid min-h-[300px] grid-cols-[105px_1fr] sm:min-h-[370px] sm:grid-cols-[155px_1fr]">
              <aside className="border-r border-zinc-100 bg-[#FAFAFC] p-3 sm:p-5"><p className="text-[10px] font-black tracking-tight sm:text-xs">Sha<span className="text-[#5145E5]">r</span>e.Wallet</p><div className="mt-8 space-y-2">{["Dashboard","Groups","Friends","Transactions","Requests"].map((item,i)=><div key={item} className={`rounded-lg px-2 py-2 text-[8px] font-semibold sm:px-3 sm:text-[10px] ${i===0?"bg-[#5145E5] text-white":"text-zinc-500"}`}>{item}</div>)}</div><div className="mt-6 rounded-lg bg-[#5145E5] px-2 py-2 text-center text-[8px] font-bold text-white sm:text-[10px]"><Plus size={11} className="mr-1 inline" /> Create Group</div></aside>
              <main className="p-4 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[8px] text-zinc-400 sm:text-[10px]">YOUR DASHBOARD</p><h3 className="mt-1 text-sm font-black tracking-tight sm:text-xl">Good evening, there.</h3></div><div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0EEFF] text-[#5145E5]"><Bell size={13} /></div></div>
                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{[{label:"Total saved",value:"₹24,000"},{label:"Active groups",value:"03"},{label:"Requests",value:"02"}].map((item)=><div key={item.label} className="rounded-xl border border-zinc-100 p-2.5 sm:p-4"><p className="text-[7px] text-zinc-400 sm:text-[9px]">{item.label}</p><p className="mt-2 text-sm font-black sm:text-xl">{item.value}</p></div>)}</div>
                <div className="mt-5 flex items-center justify-between"><h4 className="text-[10px] font-black sm:text-sm">Your groups</h4><span className="text-[8px] font-bold text-[#5145E5] sm:text-[10px]">View all <ArrowRight size={10} className="inline" /></span></div>
                <div className="mt-3 space-y-2.5">{[{name:"Goa Trip",amount:"₹18,000 / ₹30,000",pct:"60%"},{name:"Hostel Emergency",amount:"₹6,000 / ₹10,000",pct:"60%"}].map((item)=> <div key={item.name} className="rounded-xl border border-zinc-100 p-3 sm:p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold sm:text-xs">{item.name}</p><p className="mt-1 text-[7px] text-zinc-400 sm:text-[9px]">{item.amount}</p></div><span className="text-[8px] font-bold sm:text-[10px]">{item.pct}</span></div><div className="mt-3 h-1.5 rounded-full bg-zinc-100"><div className="h-full w-3/5 rounded-full bg-[#5145E5]" /></div></div>)}</div>
              </main>
            </div>
          </div>
          <div className="mx-auto h-3 w-[88%] rounded-b-xl bg-gradient-to-b from-zinc-300 to-zinc-500 shadow-xl" />
        </motion.div>
      </div>
    </section>
  );
}

export function LandingSections() {
  return (
    <>
      <section id="about" className="relative overflow-hidden bg-[#F5F1E8] px-5 pb-20 pt-24 sm:px-8 lg:pb-28 lg:pt-32">
        <div className="mx-auto max-w-7xl">
          <SectionLabel number="01">About ShareWallet</SectionLabel>
          <div className="mt-8 grid gap-9 border-b border-zinc-300 pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <h2 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#111116] sm:text-7xl lg:text-[6.4rem]">A smarter way to save together, <span className="bg-[#5145E5] px-2 text-white">support together.</span></h2>
            <div className="flex flex-col justify-between gap-8 lg:border-l lg:border-zinc-300 lg:pl-12">
              <p className="max-w-md text-base leading-8 text-zinc-700 sm:text-lg">ShareWallet helps friends, classmates and communities build group savings, manage monthly contributions, and support each other when it matters.</p>
              <div className="grid grid-cols-3 gap-3 border-t border-zinc-300 pt-5">
                <div><p className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">400+</p><p className="mt-1 text-[9px] leading-4 text-zinc-500 sm:text-[11px]">Students onboard</p></div>
                <div className="border-l border-zinc-300 pl-3"><p className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">50+</p><p className="mt-1 text-[9px] leading-4 text-zinc-500 sm:text-[11px]">Groups created</p></div>
                <div className="border-l border-zinc-300 pl-3"><p className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">₹0</p><p className="mt-1 text-[9px] leading-4 text-zinc-500 sm:text-[11px]">Interest on peer lending</p></div>
              </div>
            </div>
          </div>
          <div className="grid gap-8 pt-10 lg:grid-cols-[0.62fr_1.38fr]">
            <div className="relative min-h-[280px] overflow-hidden bg-zinc-300 sm:min-h-[390px]">
              <div className="absolute inset-0 bg-cover bg-center grayscale" style={{backgroundImage:"url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85')"}} />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2114D8]/55 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 bg-[#F5F1E8] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-900">Better, together.</span>
            </div>
            <div className="flex flex-col justify-center gap-0 lg:pl-8">
              <SectionLabel number="02">What you can do</SectionLabel>
              {features.map((feature)=>{const Icon=feature.icon;return <div key={feature.number} className="group flex gap-5 border-b border-zinc-300 py-6 sm:py-7"><span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#E5E0FF] text-[#5145E5] transition group-hover:bg-[#5145E5] group-hover:text-white"><Icon size={21}/></span><div><div className="flex items-baseline gap-3"><span className="text-[10px] font-bold text-[#5145E5]">{feature.number}</span><h3 className="text-xl font-black tracking-[-0.04em] text-zinc-950 sm:text-2xl">{feature.title}</h3></div><p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">{feature.description}</p></div><ArrowUpRight className="ml-auto mt-1 shrink-0 text-zinc-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#5145E5]" size={18}/></div>;})}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full border-[36px] border-[#2114D8] opacity-95" />
      </section>

      <ProductShowcase />

      <section id="how-it-works" className="bg-[#F5F1E8] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.55fr_1.45fr]">
          <div><SectionLabel number="04">How it works</SectionLabel><h2 className="mt-7 max-w-xs text-4xl font-black leading-[0.94] tracking-[-0.07em] text-zinc-950 sm:text-5xl">Get started in <span className="text-[#5145E5]">3 simple steps.</span></h2><div className="mt-5 h-1 w-24 bg-[#5145E5]" /></div>
          <div className="divide-y divide-zinc-300 border-y border-zinc-300">{steps.map((step,index)=><motion.div key={step.number} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:index*0.08}} className="grid gap-3 py-7 sm:grid-cols-[100px_1fr_1fr] sm:items-center sm:py-8"><p className="text-5xl font-black tracking-[-0.08em] text-[#2114D8] sm:text-6xl">{step.number}</p><h3 className="text-xl font-black tracking-[-0.04em] text-zinc-950 sm:text-2xl">{step.title}</h3><p className="max-w-xs text-sm leading-6 text-zinc-600">{step.description}</p></motion.div>)}</div>
        </div>
      </section>

      <section className="bg-[#F5F1E8] px-4 pb-5 sm:px-8 sm:pb-8"><div className="relative mx-auto flex max-w-7xl flex-col gap-6 overflow-hidden bg-[#2114D8] px-6 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12 lg:py-12"><div aria-hidden="true" className="absolute -right-12 -top-44 h-96 w-96 rounded-full border border-white/20"/><div className="relative"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">Your circle starts here</p><h2 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.065em] sm:text-6xl">Start saving together.</h2></div><Link href="/signup" className="relative inline-flex shrink-0 items-center justify-center gap-4 rounded-full bg-[#F5F1E8] px-6 py-4 text-sm font-black text-[#171717] transition hover:-translate-y-1 hover:bg-white">Create your group <ArrowUpRight size={17}/></Link></div></section>
      <CinematicFooter />
    </>
  );
}
