"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Play } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function HeroCTA() {
  return (
    <div className="relative z-20 flex flex-col items-center text-center">
      {/* ── Badge ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-600 dark:border-violet-400/20 dark:text-violet-300">
          <Sparkles className="size-3.5" />
          AI-Powered Academic Planning
        </span>
      </motion.div>

      {/* ── Main headline ── */}
      <motion.h1
        className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <span className="bg-gradient-to-r from-slate-900 via-violet-800 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:via-violet-200 dark:to-cyan-200">
          Upload Your Syllabus.
        </span>
        <br />
        <span className="bg-gradient-to-r from-violet-600 via-violet-700 to-cyan-700 bg-clip-text text-transparent dark:from-violet-300 dark:via-violet-400 dark:to-cyan-400">
          Let AI Build The Roadmap.
        </span>
      </motion.h1>

      {/* ── Subheadline ── */}
      <motion.p
        className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        AI extracts your syllabus, builds adaptive study plans, tracks your progress,
        and generates recovery schedules — all automatically.
      </motion.p>

      {/* ── Feature pills ── */}
      <motion.div
        className="mt-5 flex flex-wrap items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {["AI Extraction", "Study Planning", "Progress Tracking", "Recovery Plans"].map((f) => (
          <span
            key={f}
            className="rounded-full border border-violet-500/15 bg-violet-500/5 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
          >
            {f}
          </span>
        ))}
      </motion.div>

      {/* ── CTA buttons ── */}
      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85 }}
      >
        {/* Primary CTA */}
        <Link
          href={ROUTES.register}
          className={cn(
            buttonVariants({ size: "lg" }),
            "group relative h-12 gap-2 overflow-hidden rounded-xl px-8 text-base font-semibold",
            "bg-gradient-to-r from-violet-600 to-violet-500 text-white",
            "shadow-[0_0_20px_rgba(124,58,237,0.3),0_0_60px_rgba(124,58,237,0.1)]",
            "hover:shadow-[0_0_30px_rgba(124,58,237,0.45),0_0_80px_rgba(124,58,237,0.15)]",
            "transition-shadow duration-300",
          )}
        >
          <Sparkles className="size-4" />
          Start Planning Free
          {/* Shine effect */}
          <span className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
        </Link>

        {/* Secondary CTA */}
        <Link
          href="#demo"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 gap-2 rounded-xl border-slate-300 bg-white/80 px-8 text-base dark:border-white/15 dark:bg-white/5",
            "text-slate-700 dark:text-slate-300",
            "hover:bg-white hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white",
            "transition-all duration-300",
          )}
        >
          <Play className="size-3.5" />
          Watch Demo
        </Link>
      </motion.div>
    </div>
  );
}
