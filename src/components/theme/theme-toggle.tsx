"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mount to avoid hydration mismatch.
  // On the server we don't know the user's stored theme preference.
  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted ? theme === "dark" : true; // default dark before mount

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-8 w-14 items-center rounded-full border border-border",
        "bg-muted transition-all duration-300",
        "hover:border-primary/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className,
      )}
    >
      {/* Sliding thumb */}
      <span
        className={cn(
          "absolute flex size-6 items-center justify-center rounded-full",
          "bg-background shadow-sm transition-transform duration-300",
          isDark ? "translate-x-1" : "translate-x-7",
        )}
        aria-hidden
      >
        {/* Only render icon after mount to prevent hydration mismatch */}
        {mounted && (isDark
          ? <Moon className="size-3.5 text-primary" />
          : <Sun className="size-3.5 text-amber-500" />
        )}
      </span>

      {/* Background icons — always visible, decorative */}
      <Sun  className="absolute left-1.5 size-3 text-muted-foreground/40" aria-hidden />
      <Moon className="absolute right-1.5 size-3 text-muted-foreground/40" aria-hidden />
    </button>
  );
}
