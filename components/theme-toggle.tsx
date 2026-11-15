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
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 2147483000,
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "9px",
          minWidth: "54px",
          height: "54px",
          padding: "0 16px",
          borderRadius: "9999px",
          border: isDark ? "1px solid rgba(255,255,255,.16)" : "1px solid rgba(20,20,30,.12)",
          background: isDark ? "#24232B" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#17171C",
          boxShadow: "0 8px 30px rgba(15,15,25,.22)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
          backdropFilter: "blur(16px)",
        }}
      >
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
        <span>{isDark ? "Light" : "Dark"}</span>
      </button>
    </div>
  );
}
