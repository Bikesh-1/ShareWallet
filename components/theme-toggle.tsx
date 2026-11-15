"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[#17171C] shadow-[0_8px_28px_rgba(15,15,25,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#6D4DFE]/40 hover:bg-[#F4F1FF] hover:text-[#4F47EA] dark:border-white/10 dark:bg-[#17171C]/90 dark:text-white dark:hover:bg-[#292536] sm:bottom-7 sm:right-7"
    >
      {isDark ? <Sun size={19} strokeWidth={2} /> : <Moon size={19} strokeWidth={2} />}
    </button>
  );
}
