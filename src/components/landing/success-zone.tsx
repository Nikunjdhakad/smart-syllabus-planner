"use client";

import { motion } from "framer-motion";
import { Check, BookOpen, FlaskConical, Calculator, Globe } from "lucide-react";

interface SuccessZoneProps {
  mouseX: number;
  mouseY: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.6 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

/* ── Mini calendar data ── */
const calendarDays = [
  { day: "M", active: true, color: "bg-violet-500" },
  { day: "T", active: true, color: "bg-sky-500" },
  { day: "W", active: false, color: "" },
  { day: "T", active: true, color: "bg-emerald-500" },
  { day: "F", active: true, color: "bg-violet-500" },
  { day: "S", active: false, color: "" },
  { day: "S", active: true, color: "bg-amber-500" },
];

/* ── Study schedule blocks ── */
const scheduleBlocks = [
  { time: "9:00", subject: "Mathematics", duration: "2h", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  { time: "11:30", subject: "Physics", duration: "1.5h", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { time: "14:00", subject: "Chemistry", duration: "2h", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
];

/* ── Subject cards ── */
const subjects = [
  { name: "Linear Algebra", icon: Calculator, progress: 78, color: "text-violet-400" },
  { name: "Organic Chemistry", icon: FlaskConical, progress: 62, color: "text-emerald-400" },
  { name: "World History", icon: Globe, progress: 91, color: "text-amber-400" },
  { name: "English Lit", icon: BookOpen, progress: 45, color: "text-sky-400" },
];

export function SuccessZone({ mouseX, mouseY }: SuccessZoneProps) {
  const parallaxX = mouseX * -15;
  const parallaxY = mouseY * -10;

  return (
    <motion.div
      className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        transition: "transform 0.4s ease-out",
      }}
    >
      {/* ── Mini Calendar ── */}
      <motion.div
        variants={cardVariants}
        className="hero-float hero-glass hero-card-glow-active w-full max-w-[220px] rounded-xl p-3"
        style={{ "--float-y": "-6px", "--float-duration": "5s", "--float-delay": "0s" } as React.CSSProperties}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50 dark:text-white/40">
          This Week
        </p>
        <div className="flex gap-1.5">
          {calendarDays.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[9px] font-medium text-foreground/40 dark:text-white/30">{d.day}</span>
              <div
                className={`size-5 rounded-md ${
                  d.active
                    ? `${d.color} shadow-sm`
                    : "bg-foreground/5 dark:bg-white/5"
                }`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Study Schedule ── */}
      <motion.div
        variants={cardVariants}
        className="hero-float hero-glass hero-card-glow-active w-full max-w-[220px] rounded-xl p-3"
        style={{ "--float-y": "-8px", "--float-duration": "4.5s", "--float-delay": "-1.2s" } as React.CSSProperties}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50 dark:text-white/40">
          Today&apos;s Plan
        </p>
        <div className="flex flex-col gap-1.5">
          {scheduleBlocks.map((b, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${b.color}`}>
              <span className="text-[9px] font-mono opacity-70">{b.time}</span>
              <span className="flex-1 text-[10px] font-medium">{b.subject}</span>
              <span className="text-[9px] opacity-60">{b.duration}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Subject Progress ── */}
      <motion.div
        variants={cardVariants}
        className="hero-float hero-glass hero-card-glow-active w-full max-w-[220px] rounded-xl p-3"
        style={{ "--float-y": "-5px", "--float-duration": "5.5s", "--float-delay": "-2s" } as React.CSSProperties}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50 dark:text-white/40">
          Progress
        </p>
        <div className="flex flex-col gap-2">
          {subjects.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <Icon className={`size-3 ${s.color} shrink-0`} strokeWidth={2} />
                <span className="flex-1 text-[10px] font-medium text-foreground/70 dark:text-white/60">
                  {s.name}
                </span>
                <div className="h-1.5 w-12 overflow-hidden rounded-full bg-foreground/5 dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, rgba(124,58,237,0.8), rgba(6,182,212,0.8))`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.progress}%` }}
                    transition={{ duration: 1.5, delay: 1 + i * 0.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[9px] font-mono text-foreground/40 dark:text-white/40">
                  {s.progress}%
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Revision Timeline ── */}
      <motion.div
        variants={cardVariants}
        className="hero-float hero-glass hero-card-glow-active w-full max-w-[220px] rounded-xl p-3"
        style={{ "--float-y": "-7px", "--float-duration": "4.8s", "--float-delay": "-0.5s" } as React.CSSProperties}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50 dark:text-white/40">
          Revisions
        </p>
        <div className="flex items-center gap-1">
          {[1, 3, 7, 14].map((d, i) => (
            <div key={d} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${
                    i < 2
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-foreground/5 text-foreground/40 dark:bg-white/10 dark:text-white/30"
                  }`}
                >
                  {i < 2 ? <Check className="size-2.5" /> : `D${d}`}
                </div>
              </div>
              {i < 3 && (
                <div className={`h-px w-3 ${i < 1 ? "bg-emerald-500/40" : "bg-foreground/10 dark:bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
