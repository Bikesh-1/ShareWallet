"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

const stars = [
  ["9%", "48%", "0s"], ["18%", "29%", "1s"], ["28%", "53%", "2s"],
  ["38%", "20%", ".5s"], ["48%", "42%", "1.8s"], ["59%", "25%", ".8s"],
  ["69%", "48%", "2.4s"], ["79%", "31%", "1.3s"], ["90%", "55%", "2.8s"],
  ["14%", "70%", "1.6s"], ["86%", "72%", ".3s"], ["52%", "12%", "2.2s"],
];

export function PortalShowcase() {
  return (
    <section className="portal-section relative isolate flex min-h-[570px] flex-col items-center overflow-hidden bg-[#05020D] px-5 pt-16 text-center text-white sm:min-h-[630px] sm:pt-20">
      <div className="relative z-10 flex flex-col items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-violet-100 shadow-[0_0_28px_rgba(139,92,246,0.12)]">
          <Sparkles size={13} className="text-violet-300" /> Made for goals worth sharing
        </span>
        <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
          Bring your goals <span className="portal-gradient-text">closer.</span>
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-violet-100/65 sm:text-base">
          One small step, one shared goal, and a brighter way to move forward together.
        </p>
        <Link href="/signup" className="mt-7 inline-flex items-center gap-2 rounded-xl border border-violet-200/30 bg-violet-500/20 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(139,92,246,0.2)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-violet-100/60 hover:bg-violet-500/30">
          Start saving together <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%]" aria-hidden="true">
        {stars.map(([left, top, delay], i) => (
          <span key={i} className="portal-star absolute h-[2px] w-[2px] rounded-full bg-violet-100" style={{ left, top, animationDelay: delay }} />
        ))}
        <div className="portal-haze absolute bottom-[-110px] left-1/2 h-[340px] w-[min(1000px,120vw)] -translate-x-1/2 rounded-[50%]" />
        <div className="portal-arch portal-outer absolute bottom-[-365px] left-1/2 h-[560px] w-[560px] max-w-[130vw] -translate-x-1/2 rounded-full" />
        <div className="portal-arch portal-middle absolute bottom-[-330px] left-1/2 h-[500px] w-[500px] max-w-[118vw] -translate-x-1/2 rounded-full" />
        <div className="portal-arch portal-inner absolute bottom-[-295px] left-1/2 h-[440px] w-[440px] max-w-[105vw] -translate-x-1/2 rounded-full" />
        <div className="portal-core absolute bottom-[-275px] left-1/2 h-[390px] w-[390px] max-w-[94vw] -translate-x-1/2 rounded-full" />
        <div className="portal-floor absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2" />
      </div>

      <style jsx>{`
        .portal-section {
          background: radial-gradient(ellipse at 50% 100%, rgba(91,25,190,.22), transparent 47%), #05020d;
        }
        .portal-gradient-text {
          background: linear-gradient(100deg,#d9c8ff 5%,#a78bfa 48%,#f0abff 95%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .portal-star { opacity: .2; box-shadow: 0 0 9px 2px rgba(190,150,255,.55); animation: twinkle 3.8s ease-in-out infinite; }
        .portal-haze {
          background: radial-gradient(ellipse,rgba(147,51,234,.42),rgba(109,40,217,.18) 35%,transparent 72%);
          filter: blur(28px); animation: breathe 6s ease-in-out infinite;
        }
        .portal-arch {
          border: 2px solid rgba(205,164,255,.72);
          box-shadow: 0 -8px 18px rgba(255,255,255,.72),0 -18px 42px rgba(192,132,252,.72),0 -34px 82px rgba(126,34,206,.58),inset 0 8px 18px rgba(255,255,255,.12);
        }
        .portal-outer { border-color: rgba(168,85,247,.38); filter: blur(2px); animation: pulse 7s ease-in-out infinite; }
        .portal-middle { border-color: rgba(216,180,254,.7); box-shadow: 0 -5px 14px rgba(255,255,255,.68),0 -15px 42px rgba(192,132,252,.8),0 -28px 70px rgba(147,51,234,.52); animation: pulse 5s ease-in-out infinite reverse; }
        .portal-inner { border-width: 3px; border-color: rgba(255,235,255,.96); box-shadow: 0 -5px 15px #fff,0 -18px 42px rgba(232,190,255,.95),0 -34px 82px rgba(168,85,247,.78); }
        .portal-core { background: radial-gradient(ellipse at 50% 0%,rgba(168,85,247,.46),rgba(91,33,182,.2) 34%,transparent 70%); filter: blur(8px); }
        .portal-floor { background: linear-gradient(90deg,transparent,rgba(167,139,250,.3) 20%,rgba(245,208,254,.9) 50%,rgba(167,139,250,.3) 80%,transparent); box-shadow: 0 0 18px rgba(192,132,252,.8),0 0 55px rgba(126,34,206,.75); }
        @keyframes twinkle { 0%,100% {opacity:.16;transform:scale(.75)} 50% {opacity:.9;transform:scale(1.35)} }
        @keyframes breathe { 0%,100% {opacity:.65;transform:translateX(-50%) scale(.94)} 50% {opacity:1;transform:translateX(-50%) scale(1.06)} }
        @keyframes pulse { 0%,100% {filter:brightness(.88) blur(1px)} 50% {filter:brightness(1.25) blur(2px)} }
        @media (prefers-reduced-motion: reduce) { .portal-star,.portal-haze,.portal-arch {animation:none!important} }
      `}</style>
    </section>
  );
}
