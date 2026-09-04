"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px)`,
          WebkitMaskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 text-center">
        <Navbar />

        <div className="inline-flex items-center gap-2 mb-4 sm:mb-5 border border-black/10 bg-white shadow-sm font-medium py-1.5 px-3 sm:px-4 rounded-full text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span>New</span>
          </span>
          <span className="h-4 w-px bg-black/10"></span>
          <span>Smart Groups. Stronger Goals.</span>
          <span className="text-black/50">→</span>
        </div>

        <h1 className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] font-bold tracking-tight">
          The Future of <br />
          Group Savings
          <span className="text-[#4F47EA]">.</span>
        </h1>

        <p className="mt-5 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-gray-600">
          Build trusted savings groups, automate contributions, and achieve
          financial goals together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-7">
          <button onClick={() => router.push("/signup")}
            className="w-full sm:w-auto text-black border border-[#dadada] bg-white px-5 py-2.5 rounded-lg text-[15px] font-medium cursor-pointer transition-all duration-200 ease-out hover:scale-105 active:scale-95">
            Get Started
          </button>

          <button
            className="
              w-full
              sm:w-auto
              text-white
              bg-black
              px-5
              py-2.5
              rounded-lg
              text-[15px]
              font-medium
              cursor-pointer
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-200
              ease-out
              hover:scale-105
              active:scale-95
            "
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}