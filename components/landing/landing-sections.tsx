"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CinematicFooter } from "@/components/ui/motion-footer";
import {
  ArrowUpRight,
  Check,
  HeartHandshake,
  Target,
  Users,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create your group",
    description: "Start a group around a shared goal, from a weekend getaway to a long-term savings plan.",
    icon: Users,
  },
  {
    number: "02",
    title: "Bring your people in",
    description: "Invite friends and family members you trust to join your savings circle.",
    icon: HeartHandshake,
  },
  {
    number: "03",
    title: "Make progress together",
    description: "Coordinate contributions, follow group activity and keep your shared goal moving.",
    icon: TrendingUp,
  },
];

const experienceCards = [
  {
    number: "01",
    title: "Group savings",
    short: "Save as one",
    description: "Create a savings circle with the people you trust. Set a common target and keep everyone moving towards it.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85",
  },
  {
    number: "02",
    title: "Monthly contributions",
    short: "Stay on track",
    description: "Bring monthly contributions into one organised space and make your group's progress easier to follow.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1100&q=85",
  },
  {
    number: "03",
    title: "Emergency support",
    short: "Be there together",
    description: "When an unexpected expense comes up, members can request support from their circle and coordinate help.",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1100&q=85",
  },
  {
    number: "04",
    title: "Shared experiences",
    short: "Make it happen",
    description: "Plan a trip, a big purchase or a milestone together. Turn a shared idea into a goal you can work towards.",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1100&q=85",
  },
  {
    number: "05",
    title: "Group conversations",
    short: "Keep connected",
    description: "Keep the conversations around your plans close to your savings journey, all in one shared space.",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85",
  },
];

function SavingsExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = experienceCards[activeIndex];

  return (
    <section className="relative isolate overflow-hidden bg-[#F8F8FB] px-5 py-20 sm:px-8 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          WebkitMaskImage: "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F47EA]">One circle. Many possibilities.</p>
            <div className="relative mt-5 min-h-[250px] sm:min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.number}
                  initial={{ opacity: 0, y: 22, filter: "blur(7px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(5px)" }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-zinc-400">0{activeIndex + 1} / 05</span>
                  <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#111116] sm:text-5xl xl:text-6xl">
                    {active.title.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="text-[#4F47EA]">{active.title.split(" ").slice(-1)}</span>
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600 sm:text-base">{active.description}</p>
                  <Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#111116] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#4F47EA]">
                    Get started <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex h-[390px] min-w-0 gap-2 overflow-x-auto pb-2 md:h-[470px] md:overflow-hidden md:pb-0">
            {experienceCards.map((card, index) => {
              const isActive = activeIndex === index;
              return (
                <motion.button
                  key={card.number}
                  type="button"
                  layout
                  aria-pressed={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  transition={{ type: "spring", stiffness: 190, damping: 25, mass: 0.8 }}
                  className={`group relative h-full shrink-0 overflow-hidden rounded-[1.35rem] text-left outline-none ring-offset-4 focus-visible:ring-2 focus-visible:ring-[#4F47EA] ${isActive ? "w-[260px] md:w-[min(54%,390px)]" : "w-[72px] md:w-[68px]"}`}
                  style={{ flex: isActive ? "1 1 0%" : "0 0 auto" }}
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${card.image}')` }} />
                  <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? "bg-gradient-to-t from-black/80 via-black/10 to-black/10" : "bg-black/45 group-hover:bg-black/30"}`} />
                  <span className="absolute left-4 top-4 text-xs font-semibold tracking-[0.18em] text-white/80">{card.number}</span>
                  {isActive ? (
                    <motion.div layout className="absolute inset-x-5 bottom-5">
                      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/65">{card.short}</motion.p>
                      <motion.h3 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">{card.title}</motion.h3>
                    </motion.div>
                  ) : (
                    <span className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-white [writing-mode:vertical-rl] rotate-180 md:block">{card.title}</span>
                  )}
                  {!isActive && <span className="absolute inset-x-0 bottom-5 text-center text-xs font-semibold text-white md:hidden">{card.number}</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}



function SectionIntro({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F47EA]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#111116] sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">{description}</p>
    </div>
  );
}

export function LandingSections() {
  return (
    <>
      <section id="about" className="relative overflow-hidden border-y border-zinc-200/70 bg-white px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#4F47EA]">Money feels different together</p>
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#111116] sm:text-6xl lg:text-7xl">
              Good things grow<br />when we <span className="text-[#4F47EA]">grow together.</span>
            </h2>
          </div>
          <div className="max-w-md pb-1 lg:justify-self-end">
            <p className="text-base leading-8 text-zinc-600 sm:text-lg">ShareWallet brings your circle, shared plans and contributions into one simple place. Less chasing. More making progress together.</p>
            <a href="#how-it-works" className="group mt-7 inline-flex items-center gap-3 border-b border-zinc-300 pb-2 text-sm font-semibold text-zinc-950 transition hover:border-[#4F47EA] hover:text-[#4F47EA]">
              Get to know ShareWallet <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 h-[440px] w-[440px] rounded-full border border-[#4F47EA]/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-[300px] w-[300px] rounded-full border border-[#4F47EA]/10" />
      </section>

      <SavingsExperience />

      <section id="how-it-works" className="relative overflow-hidden bg-[#F5F5F7] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionIntro eyebrow="The process" title="From a shared idea to a shared win." description="A simple rhythm makes it easier for everyone to take part and keep the goal moving." />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">01 — 03 / Getting started</span>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="group relative min-h-[300px] bg-white p-7 transition-colors duration-300 hover:bg-[#F8F7FF] sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.18em] text-[#4F47EA]">{step.number}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all group-hover:border-[#4F47EA] group-hover:bg-[#4F47EA] group-hover:text-white"><Icon size={20} strokeWidth={1.7} /></span>
                  </div>
                  <div className="mt-20">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-zinc-950">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-7 text-zinc-600">{step.description}</p>
                  </div>
                  {index < 2 && <ArrowUpRight className="absolute bottom-9 right-9 text-zinc-300 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#4F47EA]" size={20} />}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="product" className="overflow-hidden bg-[#F5F5F7] px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionIntro eyebrow="Your group at a glance" title="Know where you stand. Keep moving forward." description="Your groups, members, contributions and activity—organised in a shared workspace that is easy to understand." />
            <ul className="mt-8 space-y-4">
              {["See your savings circles in one place", "Follow contribution activity", "Stay connected with your members"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAE8FF] text-[#4F47EA]"><Check size={14} /></span>{item}</li>
              ))}
            </ul>
            <Link href="/signup" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[#111116] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4F47EA]">Create your circle <ArrowUpRight size={16} /></Link>
          </div>
          <div className="relative mx-auto w-full max-w-[650px]">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-[#DAD6FF] via-white to-[#E8E4FF] blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-zinc-200 bg-white shadow-[0_30px_90px_rgba(40,35,100,0.12)]">
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#4F47EA]" /><span className="text-sm font-bold text-zinc-900">ShareWallet</span></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">Your group space</span>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-[1fr_0.8fr] sm:p-8">
                <div>
                  <p className="text-xs text-zinc-500">Your savings circle</p><h3 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">The Weekend Crew</h3><p className="mt-1 text-xs text-zinc-400">A shared goal, built together</p>
                  <div className="mt-8 rounded-2xl border border-zinc-100 bg-[#FAFAFC] p-5">
                    <div className="flex items-center justify-between"><span className="text-xs font-medium text-zinc-500">Group members</span><Users size={16} className="text-[#4F47EA]" /></div>
                    <div className="mt-5 flex -space-x-2">{["A","R","S","M"].map((letter, i) => <span key={letter} className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-xs font-bold ${["bg-violet-100 text-violet-700","bg-blue-100 text-blue-700","bg-orange-100 text-orange-700","bg-emerald-100 text-emerald-700"][i]}`}>{letter}</span>)}</div>
                    <p className="mt-4 text-xs text-zinc-500">Your people, in one place.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#F4F2FF] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4F47EA]"><Target size={19} /></div>
                  <p className="mt-6 text-xs font-medium text-zinc-500">Shared goal</p><p className="mt-1 text-lg font-semibold text-zinc-900">Plan it together</p>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#E1DEFF]"><div className="h-full w-2/3 rounded-full bg-[#6D63EF]" /></div>
                  <p className="mt-3 text-[10px] leading-5 text-zinc-500">A clear view of your group journey.</p>
                </div>
              </div>
              <div className="border-t border-zinc-100 px-6 py-4 text-[10px] text-zinc-400">Illustrative product preview · UI concept</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8 lg:py-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#111116] px-7 py-16 text-center text-white sm:px-12 lg:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
          <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B8B2FF]"><Sparkles size={23} /></div>
          <p className="relative z-10 mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#AAA4FF]">Your next chapter starts here</p>
          <h2 className="relative z-10 mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Big goals feel closer when you <span className="text-[#AAA4FF]">share them.</span></h2>
          <p className="relative z-10 mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">Bring your circle together and take the first step towards a shared savings goal.</p>
          <Link href="/signup" className="relative z-10 mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#EAE8FF]">Create your account <ArrowUpRight size={17} /></Link>
        </div>
      </section>

      <CinematicFooter />
    </>
  );
}
