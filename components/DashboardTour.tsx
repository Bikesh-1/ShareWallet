"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, HelpCircle, X } from "lucide-react";

const STORAGE_KEY = "sharewallet:dashboard-tour:v1";

const steps = [
  { title: "Welcome to ShareWallet", description: "A quick tour will show you where to manage your savings groups, friends, contributions and account activity.", section: null, target: null },
  { title: "Your Home dashboard", description: "Start here for your ShareWallet workspace, customer ID, friends, groups and a quick overview of your account.", section: "home", target: "nav-home" },
  { title: "Savings Groups", description: "Create or open a group, invite trusted members and manage shared savings in one place.", section: "group", target: "nav-group" },
  { title: "Payouts", description: "Track emergency-fund payouts you receive and check whether each payout is pending or completed.", section: "payout", target: "nav-payout" },
  { title: "Friends", description: "Connect with people on ShareWallet using their unique Customer ID. You can then invite them to your groups.", section: "friend", target: "nav-friend" },
  { title: "Contributions", description: "Review your contribution payments, amounts and payment statuses.", section: "contribution", target: "nav-contribution" },
  { title: "Activity", description: "See your recent transactions and follow your payment history over time.", section: "activity", target: "nav-activity" },
  { title: "Notifications", description: "Stay informed about money requests, approvals and payment updates.", section: "notification", target: "nav-notification" },
  { title: "Your Profile", description: "View your personal details and Customer ID. Keep your account information up to date.", section: "profile", target: "nav-profile" },
  { title: "Settings", description: "Find account security options, sign out and change your password here.", section: "setting", target: "nav-setting" },
];

type Rect = { top: number; left: number; width: number; height: number };

export default function DashboardTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const finish = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "completed");
    setActive(false);
    setRect(null);
  }, []);

  const start = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== "completed") {
      const timer = window.setTimeout(() => setActive(true), 650);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const current = steps[step];
    if (current.section) {
      window.dispatchEvent(new CustomEvent("sharewallet:tour-navigate", { detail: current.section }));
    }

    let frame = 0;
    let timer = 0;
    const measure = () => {
      if (!current.target) {
        setRect(null);
        return;
      }
      const element = document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`);
      if (!element) {
        setRect(null);
        return;
      }
      const bounds = element.getBoundingClientRect();
      setRect({
        top: Math.max(8, bounds.top - 7),
        left: Math.max(8, bounds.left - 7),
        width: Math.min(window.innerWidth - 16, bounds.width + 14),
        height: Math.min(window.innerHeight - 16, bounds.height + 14),
      });
    };
    timer = window.setTimeout(() => { frame = window.requestAnimationFrame(measure); }, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  if (!active) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label="Restart ShareWallet product tour"
        title="Take a dashboard tour"
        className="fixed bottom-20 right-5 z-[80] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#4F47EA] text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#4038d5] lg:bottom-6"
      >
        <HelpCircle size={21} />
      </button>
    );
  }

  const current = steps[step];
  const cardWidth = Math.min(360, window.innerWidth - 32);
  const cardLeft = rect
    ? Math.max(16, Math.min(rect.left, window.innerWidth - cardWidth - 16))
    : Math.max(16, (window.innerWidth - cardWidth) / 2);
  const placeBelow = rect ? rect.top + rect.height + 16 + 220 < window.innerHeight : false;
  const cardTop = rect
    ? Math.max(16, Math.min(placeBelow ? rect.top + rect.height + 16 : rect.top - 236, window.innerHeight - 250))
    : Math.max(24, (window.innerHeight - 250) / 2);

  return (
    <div className="fixed inset-0 z-[100]">
      {rect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-2xl border-2 border-[#8b80ff] shadow-[0_0_0_9999px_rgba(8,8,18,0.76),0_0_28px_rgba(109,77,254,0.48)] transition-all duration-200"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#080812]/80" />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sharewallet-tour-title"
        className="fixed z-[102] rounded-2xl border border-white/10 bg-[#11111b] p-5 text-white shadow-2xl sm:p-6"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#aaa2ff]">ShareWallet walkthrough</span>
          <button type="button" onClick={finish} aria-label="Skip tour" className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        <div className="mb-3 flex gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((item, index) => <span key={item.title} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-[#8175ff]" : "bg-white/15"}`} />)}
        </div>
        <p className="mb-2 text-xs text-zinc-500">STEP {step + 1} OF {steps.length}</p>
        <h2 id="sharewallet-tour-title" className="text-xl font-bold tracking-tight">{current.title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-300">{current.description}</p>
        <div className="mt-6 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="rounded-lg px-2 py-2 text-sm text-zinc-400 transition hover:text-white">Skip tour</button>
          <div className="flex items-center gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"><ArrowLeft size={15} /> Back</button>}
            {step < steps.length - 1 ? (
              <button type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} className="inline-flex items-center gap-1 rounded-lg bg-[#6D4DFE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5b3de5]">Next <ArrowRight size={15} /></button>
            ) : (
              <button type="button" onClick={finish} className="inline-flex items-center gap-1 rounded-lg bg-[#6D4DFE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5b3de5]">Finish <Check size={15} /></button>
            )}
          </div>
        </div>
      </section>
      <button type="button" aria-label="Close tour" onClick={finish} className="fixed inset-0 z-[99] cursor-default" />
    </div>
  );
}
