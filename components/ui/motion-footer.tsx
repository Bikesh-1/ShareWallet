"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Heart, Wallet } from "lucide-react";

const tickerItems = [
  "GROUP SAVINGS",
  "TRANSPARENT TRACKING",
  "SHARED GOALS",
  "PROGRESS TOGETHER",
  "SUPPORT WHEN IT MATTERS",
];

export function CinematicFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const items = footer.querySelectorAll<HTMLElement>("[data-footer-reveal]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative isolate overflow-hidden bg-[#080809] px-5 pb-6 pt-10 text-white sm:px-8 sm:pt-14"
    >
      <style>{".sw-footer-grid{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:68px 68px;mask-image:linear-gradient(to bottom,transparent,black 12%,black 88%,transparent)}.sw-footer-reveal{opacity:0;transform:translateY(20px);transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1)}.sw-footer-reveal.is-visible{opacity:1;transform:translateY(0)}.sw-footer-marquee{animation:sw-footer-marquee 32s linear infinite}@keyframes sw-footer-marquee{to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){.sw-footer-marquee{animation:none}.sw-footer-reveal{opacity:1;transform:none;transition:none}}"}</style>

      <div aria-hidden="true" className="sw-footer-grid pointer-events-none absolute inset-0 z-0 opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-24 h-80 w-[min(900px,100vw)] -translate-x-1/2 rounded-full bg-[#6D4DFE]/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1500px]">
        <div data-footer-reveal className="sw-footer-reveal overflow-hidden border-y border-white/[0.08] py-4">
          <div className="sw-footer-marquee flex w-max items-center gap-9 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.25em] text-white/55 sm:gap-14 sm:text-xs">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-9 sm:gap-14">
                {tickerItems.map((item) => (
                  <span key={item} className="flex items-center gap-9 sm:gap-14">
                    {item}
                    <span className="text-[#8D7CFF]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div data-footer-reveal className="sw-footer-reveal relative flex flex-col items-center pb-16 pt-14 text-center sm:pb-20 sm:pt-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A99DFF] sm:text-xs">
            Your goals. Your people. Your pace.
          </p>
          <h2 className=" text-[clamp(3.5rem,10vw,8.5rem)] font-semibold  tracking-[-0.055em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/45">
            Ready to begin?
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/50 sm:text-base">
            Bring your circle together and turn the goals you share into progress you can see.
          </p>

          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex min-w-[210px] items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.10] px-7 py-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.16]"
            >
              <Wallet size={18} className="text-white/70" />
              Create your account
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/signin"
              className="inline-flex min-w-[170px] items-center justify-center rounded-full border border-white/10 bg-[#111113] px-7 py-4 text-sm font-semibold text-white/80 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#19191D] hover:text-white"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:support@sharewallet.live" className="rounded-full border border-white/10 bg-white/[0.035] px-6 py-3 text-xs font-medium text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
              Support
            </a>
            <a href="mailto:support@sharewallet.live?subject=Privacy%20Policy%20Enquiry" className="rounded-full border border-white/10 bg-white/[0.035] px-6 py-3 text-xs font-medium text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
              Privacy enquiry
            </a>
          </div>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute -bottom-7 left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap text-[15vw] font-black leading-[0.72] tracking-[-0.095em] text-transparent opacity-[0.11]" style={{ WebkitTextStroke: "1px rgba(255,255,255,.75)" }}>
          SHAREWALLET
        </div>

        <div className="relative flex flex-col gap-5 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/45 sm:text-xs">
            © {new Date().getFullYear()} SHAREWALLET. ALL RIGHTS RESERVED.
          </p>

          <div className="inline-flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55 sm:self-auto sm:text-xs">
            Crafted with <Heart size={14} fill="#FF5A68" stroke="#FF5A68" /> by
            <span className="normal-case tracking-normal text-white">ShareWallet</span>
          </div>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="absolute -top-5 right-0 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#101012] text-white/65 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-[#1A1A1E] hover:text-white sm:static"
          >
            <ArrowUp size={19} />
          </button>
        </div>
      </div>
    </footer>
  );
}
