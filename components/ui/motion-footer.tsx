"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUp,
  ArrowUpRight,
  CircleDollarSign,
  Heart,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

const highlights = [
  "Group savings",
  "Monthly contributions",
  "Shared goals",
  "Support when it matters",
  "Progress together",
];

function MagneticLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        event.currentTarget.style.transform = `translate3d(${x * 0.12}px, ${y * 0.16}px, 0) scale(1.03)`;
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.transform = "translate3d(0, 0, 0) scale(1)";
      }}
      className={
        secondary
          ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white/85 backdrop-blur-xl transition-[transform,background-color,border-color] duration-300 hover:border-white/30 hover:bg-white/10"
          : "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#171522] shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-[transform,background-color] duration-300 hover:bg-[#EAE8FF]"
      }
    >
      {children}
    </Link>
  );
}

export function CinematicFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const revealItems = footer.querySelectorAll<HTMLElement>("[data-footer-reveal]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      ref={footerRef}
      className="relative isolate overflow-hidden bg-[#0D0D16] px-5 pb-7 pt-14 text-white sm:px-8 sm:pt-20"
    >
      <style>{".sw-footer-aurora{background:radial-gradient(ellipse at center,rgba(79,71,234,.34),rgba(109,77,254,.13) 38%,transparent 72%);animation:sw-footer-breathe 9s ease-in-out infinite alternate}.sw-footer-grid{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:58px 58px;mask-image:linear-gradient(to bottom,transparent,black 18%,black 75%,transparent)}.sw-footer-marquee{animation:sw-footer-marquee 34s linear infinite}.sw-footer-reveal{opacity:0;transform:translateY(24px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}.sw-footer-reveal.is-visible{opacity:1;transform:translateY(0)}@keyframes sw-footer-breathe{from{transform:translate(-50%,-50%) scale(.92);opacity:.65}to{transform:translate(-50%,-50%) scale(1.08);opacity:1}}@keyframes sw-footer-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media(prefers-reduced-motion:reduce){.sw-footer-aurora,.sw-footer-marquee{animation:none}.sw-footer-reveal{opacity:1;transform:none;transition:none}}"} />

      <div
        aria-hidden="true"
        className="sw-footer-aurora pointer-events-none absolute left-1/2 top-[42%] z-0 h-[480px] w-[min(900px,110vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[85px]"
      />
      <div
        aria-hidden="true"
        className="sw-footer-grid pointer-events-none absolute inset-0 z-0 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap text-[21vw] font-black leading-[0.72] tracking-[-0.09em] text-transparent opacity-[0.08]"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,.7)" }}
      >
        SHAREWALLET
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="sw-footer-reveal overflow-hidden border-y border-white/10 bg-white/[0.035] py-4 backdrop-blur-md">
          <div className="sw-footer-marquee flex w-max items-center gap-10 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55 sm:gap-14 sm:text-xs">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-10 sm:gap-14">
                {highlights.map((item) => (
                  <span key={item} className="flex items-center gap-10 sm:gap-14">
                    {item}
                    <span className="text-[#A9A2FF]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div data-footer-reveal className="sw-footer-reveal mx-auto flex max-w-4xl flex-col items-center py-20 text-center sm:py-28">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-[#BDB8FF] shadow-[0_0_45px_rgba(109,77,254,.18)] backdrop-blur-xl">
            <Wallet size={23} strokeWidth={1.7} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#B7B1FF] sm:text-xs">
            Better goals are built together
          </p>
          <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl md:text-7xl">
            Make your next goal a <span className="text-[#A9A2FF]">shared one.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
            Bring your people together, organise contributions and make steady progress towards the things that matter.
          </p>
          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <MagneticLink href="/signup">
              Create your account <ArrowUpRight size={16} />
            </MagneticLink>
            <MagneticLink href="/signin" secondary>
              Sign in
            </MagneticLink>
          </div>
        </div>

        <div data-footer-reveal className="sw-footer-reveal grid gap-10 border-t border-white/10 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="ShareWallet home" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F47EA] text-white">
                <Wallet size={19} />
              </span>
              <span>Share<span className="text-[#A9A2FF]">Wallet</span></span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">
              A shared space for people working towards better financial goals, together.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
              <Heart size={13} className="text-[#A9A2FF]" /> Built for goals worth sharing.
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Explore</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/50">
              <a className="transition hover:text-white" href="#about">About</a>
              <a className="transition hover:text-white" href="#how-it-works">How it works</a>
              <a className="transition hover:text-white" href="#features">Features</a>
              <a className="transition hover:text-white" href="#product">Your workspace</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Your account</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/50">
              <Link className="transition hover:text-white" href="/signin">Sign in</Link>
              <Link className="transition hover:text-white" href="/signup">Create account</Link>
              <a className="transition hover:text-white" href="#emergency">Emergency support</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">What matters</h3>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/50">
              <span className="flex items-center gap-2"><Users size={15} className="text-[#A9A2FF]" /> Your circle</span>
              <span className="flex items-center gap-2"><CircleDollarSign size={15} className="text-[#A9A2FF]" /> Shared contributions</span>
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#A9A2FF]" /> Clear group activity</span>
            </div>
            <a className="mt-4 inline-block text-sm text-white/50 transition hover:text-white" href="mailto:support@sharewallet.live">
              support@sharewallet.live
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ShareWallet. All rights reserved.</span>
          <span className="flex items-center gap-2">Save together. Grow together.</span>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex h-10 w-10 items-center justify-center self-start rounded-full border border-white/15 bg-white/[0.05] text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white sm:self-auto"
          >
            <ArrowUp size={17} />
          </button>
        </div>
      </div>
    </footer>
  );
}
