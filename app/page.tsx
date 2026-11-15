"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import { LandingSections } from "../components/landing/landing-sections";
import { PortalShowcase } from "../components/landing/portal-showcase";

export default function Home() {
  const router = useRouter();

  return (
    <main className="w-full overflow-hidden bg-white text-[#101014]">
      <section id="home" className="relative flex min-h-[760px] min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-5 text-center sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            maskImage: "repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px)",
            WebkitMaskImage: "repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <Navbar />

        <div className="relative z-10 mt-16 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium shadow-sm sm:mb-5 sm:px-4 sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span>New</span>
          <span className="h-4 w-px bg-black/10" />
          <span>Smart Groups. Stronger Goals.</span>
          <span className="text-black/50">→</span>
        </div>

        <h1 className="relative z-10 mt-4 max-w-5xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          The Future of <br />
          Group <span className="relative cursor-pointer text-[#4F47EA] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-[#4F47EA] after:transition-all after:duration-300 after:ease-out hover:after:w-full">Savings</span>
          <span className="text-[#4F47EA]">.</span>
        </h1>

        <p className="relative z-10 mt-5 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
          Build trusted savings groups, automate contributions, and achieve financial goals together.
        </p>

        <div className="relative z-10 mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="w-full cursor-pointer rounded-lg border border-[#dadada] bg-white px-5 py-2.5 text-[15px] font-medium text-black transition-all duration-200 ease-out hover:scale-105 active:scale-95 sm:w-auto"
          >
            Get Started
          </button>
          <a
            href="#how-it-works"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-[15px] font-medium text-white transition-all duration-200 ease-out hover:scale-105 active:scale-95 sm:w-auto"
          >
            Learn More <span aria-hidden="true">↓</span>
          </a>
        </div>

        <p className="caveat pointer-events-none absolute left-8 top-[55%] hidden -rotate-12 text-left text-2xl text-gray-400 lg:block xl:left-20">Small<br />steps<br />Big futures</p>
        <p className="caveat pointer-events-none absolute right-8 top-28 hidden -rotate-12 text-left text-2xl text-gray-400 lg:block xl:right-20">Better<br />together</p>
      </section>

      <PortalShowcase />
      <LandingSections />
    </main>
  );
}
