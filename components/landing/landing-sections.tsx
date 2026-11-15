"use client";

import Link from "next/link";
import { CinematicFooter } from "@/components/ui/motion-footer";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  HandCoins,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
  Wallet,
  Plane,
  Laptop,
  GraduationCap,
  LifeBuoy,
  Sparkles,
  Eye,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Users,
    number: "01",
    title: "Group savings",
    description: "Create a shared space for the people you trust and work towards a common financial goal.",
    tone: "bg-violet-50 text-[#4F47EA]",
  },
  {
    icon: CircleDollarSign,
    number: "02",
    title: "Contributions",
    description: "Keep monthly contributions organised and make it easier for everyone to stay on track.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: HandCoins,
    number: "03",
    title: "Emergency funds",
    description: "Request support from your group when an unexpected expense comes your way.",
    tone: "bg-orange-50 text-orange-600",
  },
  {
    icon: MessageCircle,
    number: "04",
    title: "Group conversations",
    description: "Keep important group discussions and savings plans connected in one place.",
    tone: "bg-emerald-50 text-emerald-600",
  },
];

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

const goals = [
  { icon: Plane, title: "The next adventure", text: "Make that group trip happen." },
  { icon: Laptop, title: "A bigger upgrade", text: "Save together for something useful." },
  { icon: GraduationCap, title: "Learning goals", text: "Plan for courses and education." },
  { icon: LifeBuoy, title: "A safety cushion", text: "Build a fund for unexpected moments." },
];

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
      <section id="about" className="relative overflow-hidden border-y border-zinc-100 bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F47EA]">A little more together</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.045em] text-[#111116] sm:text-5xl">
              Better things happen <span className="text-[#4F47EA]">together.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
              Bring your people together, build consistent saving habits, and turn shared goals into something you can work towards as a team.
            </p>
          </div>
          <a href="#how-it-works" className="group inline-flex w-fit items-center gap-3 rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-[#4F47EA] hover:text-[#4F47EA]">
            See how it works <ArrowDown size={16} className="transition-transform group-hover:translate-y-1" />
          </a>
        </div>
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#4F47EA]/10" />
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-[#4F47EA]/10" />
      </section>

      <section id="how-it-works" className="bg-[#F8F8FB] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            eyebrow="How it works"
            title="Simple steps. Bigger goals."
            description="Getting started with shared savings should feel simple. Set up your circle, invite your people and start making progress."
            centered
          />
          <div className="relative mt-14 grid gap-4 md:grid-cols-3">
            <div className="absolute left-[17%] right-[17%] top-8 hidden border-t border-dashed border-[#C9C5F5] md:block" />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="relative rounded-3xl border border-zinc-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9C5F5] hover:shadow-xl hover:shadow-violet-950/[0.05]">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EFFF] text-[#4F47EA] ring-8 ring-white">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <p className="mt-8 text-xs font-bold tracking-[0.18em] text-[#7770D9]">STEP {step.number}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-600">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionIntro
              eyebrow="Made for your circle"
              title="Everything you need to save together."
              description="The essentials for managing a shared savings journey, thoughtfully brought into one place."
            />
            <Link href="/signup" className="group inline-flex w-fit shrink-0 items-center gap-2 pb-1 text-sm font-semibold text-[#4F47EA]">
              Start your group <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.number} className="group rounded-3xl border border-zinc-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D8D5FF] hover:shadow-xl hover:shadow-violet-950/[0.05] sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tone}`}><Icon size={22} /></span>
                    <span className="text-xs font-semibold tracking-[0.16em] text-zinc-300">{feature.number}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-zinc-950">{feature.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="product" className="overflow-hidden bg-[#F7F6FF] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionIntro
              eyebrow="Your shared workspace"
              title="A clearer view of your group goals."
              description="Keep the important parts of your savings journey together: your groups, members, contributions and activity."
            />
            <ul className="mt-8 space-y-4">
              {["See your groups in one place", "Keep track of contribution activity", "Stay connected with your members"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#4F47EA]"><Check size={14} /></span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-[600px]">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#DAD6FF] via-white to-[#E8E4FF] blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_28px_80px_rgba(40,35,100,0.12)]">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#4F47EA]" /><span className="text-sm font-bold text-zinc-900">ShareWallet</span></div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">Group workspace</span>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_0.8fr] sm:p-6">
                <div>
                  <p className="text-xs text-zinc-500">Your savings circle</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">The Weekend Crew</h3>
                  <p className="mt-1 text-xs text-zinc-400">A shared goal, built together</p>
                  <div className="mt-7 rounded-xl border border-zinc-100 bg-[#FAFAFC] p-4">
                    <div className="flex items-center justify-between"><span className="text-xs font-medium text-zinc-500">Group activity</span><Users size={16} className="text-[#4F47EA]" /></div>
                    <div className="mt-4 flex -space-x-2">
                      {["A","R","S","M"].map((letter, i) => <span key={letter} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${["bg-violet-100 text-violet-700","bg-blue-100 text-blue-700","bg-orange-100 text-orange-700","bg-emerald-100 text-emerald-700"][i]}`}>{letter}</span>)}
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">Your people, in one place.</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#F7F6FF] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4F47EA]"><Target size={18} /></div>
                  <p className="mt-5 text-xs font-medium text-zinc-500">Shared goal</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">Plan it together</p>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#E4E1FF]"><div className="h-full w-2/3 rounded-full bg-[#6D63EF]" /></div>
                  <p className="mt-2 text-[10px] leading-5 text-zinc-500">A simple overview of your group journey.</p>
                </div>
              </div>
              <div className="border-t border-zinc-100 px-5 py-3 text-[10px] text-zinc-400">Illustrative product preview</div>
            </div>
          </div>
        </div>
      </section>

      <section id="emergency" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2rem] bg-[#11111A] p-7 text-white sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:p-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AAA4FF]">Support that stays close</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.04em] sm:text-5xl">Because nobody should face emergencies alone.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">When an unexpected expense comes up, ShareWallet gives group members a way to request support and coordinate help within their circle.</p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-[#EAE8FF]">Build your support circle <ArrowRight size={16} /></Link>
          </div>
          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center py-8">
            <div className="absolute h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute h-48 w-48 rounded-full border border-white/10" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl shadow-violet-950/30"><HeartHandshake size={54} strokeWidth={1.2} className="text-[#B8B2FF]" /></div>
            <span className="absolute right-3 top-7 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-[10px] text-zinc-200">Request support</span>
            <span className="absolute bottom-5 left-0 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 text-[10px] text-zinc-200">Your group, together</span>
          </div>
        </div>
      </section>

      <section id="goals" className="bg-[#F8F8FB] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Dream it. Plan it. Save for it." title="Small contributions. Big dreams." description="Whether it is a shared experience or a practical goal, a little planning can bring your people closer to making it happen." centered />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return <article key={goal.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/[0.04]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EFFF] text-[#4F47EA]"><Icon size={21} /></span><h3 className="mt-6 text-base font-semibold text-zinc-950">{goal.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{goal.text}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section id="why-sharewallet" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Why ShareWallet" title="Saving money is good. Saving together is better." description="Shared goals work best when everyone understands the plan and can see how the group is moving forward." centered />
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              { icon: Eye, title: "Clarity for everyone", text: "Keep group contributions and activity visible to the people involved." },
              { icon: Target, title: "A reason to stay consistent", text: "Give your group a shared goal that keeps everyone moving in the same direction." },
              { icon: HeartHandshake, title: "Progress as a team", text: "Make saving a shared habit, supported by the people around you." },
            ].map((item) => {
              const Icon = item.icon;
              return <div key={item.title} className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EFFF] text-[#4F47EA]"><Icon size={24} /></span><h3 className="mt-5 text-lg font-semibold text-zinc-950">{item.title}</h3><p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-zinc-600">{item.text}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section id="security" className="border-y border-zinc-100 bg-[#F8F8FB] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4F47EA]">Designed with care</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">Your group deserves clarity and care.</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">ShareWallet brings account access, group activity and payment workflows into one organised experience.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5"><LockKeyhole className="text-[#4F47EA]" size={22} /><p className="mt-3 text-sm font-semibold text-zinc-900">Account access</p><p className="mt-1 text-xs text-zinc-500">Authentication flows</p></div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5"><ShieldCheck className="text-[#4F47EA]" size={22} /><p className="mt-3 text-sm font-semibold text-zinc-900">Clear activity</p><p className="mt-1 text-xs text-zinc-500">Group records</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#11111A] px-6 py-16 text-center text-white sm:px-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#B8B2FF]"><Sparkles size={23} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#AAA4FF]">Start something together</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">Your people. Your goals. One shared wallet.</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">Bring your circle together and take the first step towards a shared savings goal.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#EAE8FF]">Create your account <ArrowUpRight size={17} /></Link>
        </div>
      </section>

      <CinematicFooter />
    </>
  );
}
