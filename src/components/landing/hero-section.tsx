"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChaosZone } from "./chaos-zone";
import { AIPortal } from "./ai-portal";
import { SuccessZone } from "./success-zone";
import { FloatingParticles } from "./floating-particles";
import { HeroCTA } from "./hero-cta";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="hero-bg-deep relative overflow-hidden"
    >
      {/* ── Grid overlay ── */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-30" aria-hidden />

      {/* ── Floating particles ── */}
      <FloatingParticles mouseX={mouse.x} mouseY={mouse.y} />

      {/* ══════════ VISUAL STORY — Three zones ══════════ */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20">
        {/* Desktop: three-column layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-0">
            {/* LEFT — Chaos */}
            <div className="relative h-[420px]">
              <ChaosZone mouseX={mouse.x} mouseY={mouse.y} />
            </div>

            {/* CENTER — AI Portal */}
            <div className="relative flex items-center justify-center px-2">
              {/* Directional flow lines: chaos → portal */}
              <DataFlowLeft />

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <AIPortal />
              </motion.div>

              {/* Directional flow lines: portal → success */}
              <DataFlowRight />
            </div>

            {/* RIGHT — Success */}
            <div className="relative h-[420px]">
              <SuccessZone mouseX={mouse.x} mouseY={mouse.y} />
            </div>
          </div>

          {/* Flow labels */}
          <div className="mt-2 grid grid-cols-3 text-center">
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-rose-400/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Academic Chaos
            </motion.p>
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-violet-400/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              AI Processing
            </motion.p>
            <motion.p
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-400/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              Organized Success
            </motion.p>
          </div>
        </div>

        {/* Tablet: Portal center, chaos+success flanking below */}
        <div className="hidden md:flex md:flex-col md:items-center md:gap-6 lg:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AIPortal />
          </motion.div>
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="relative h-[300px]">
              <ChaosZone mouseX={0} mouseY={0} />
            </div>
            <div className="relative h-[300px]">
              <SuccessZone mouseX={0} mouseY={0} />
            </div>
          </div>
        </div>

        {/* Mobile: Portal only */}
        <div className="flex flex-col items-center gap-6 md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="scale-[0.8]"
          >
            <AIPortal />
          </motion.div>
        </div>
      </div>

      {/* ══════════ CTA — Below the visual story ══════════ */}
      <div className="relative z-20 mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <HeroCTA />
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/30 dark:text-white/30">
          Scroll
        </span>
        <motion.div
          className="h-6 w-4 rounded-full border border-foreground/20 dark:border-white/20"
        >
          <motion.div
            className="mx-auto mt-1 h-1.5 w-1 rounded-full bg-foreground/30 dark:bg-white/30"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   Data Flow Animations — connect the three zones
   ══════════════════════════════════════════════ */

function DataFlowLeft() {
  return (
    <div className="pointer-events-none absolute -left-16 top-1/2 z-0 flex -translate-y-1/2 flex-col items-center gap-3" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="h-[2px] rounded-full"
          style={{
            width: 40 + Math.random() * 30,
            background: `linear-gradient(90deg, rgba(251,113,133,${0.15 + i * 0.08}), rgba(167,139,250,${0.4 + i * 0.1}))`,
          }}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: [- 60, 10], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function DataFlowRight() {
  return (
    <div className="pointer-events-none absolute -right-16 top-1/2 z-0 flex -translate-y-1/2 flex-col items-center gap-3" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="h-[2px] rounded-full"
          style={{
            width: 40 + Math.random() * 30,
            background: `linear-gradient(90deg, rgba(167,139,250,${0.4 + i * 0.1}), rgba(52,211,153,${0.15 + i * 0.08}))`,
          }}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: [-10, 60], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.5 + 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
