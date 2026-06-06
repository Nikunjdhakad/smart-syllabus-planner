"use client";

/**
 * Burst animation that plays once when a task is completed.
 * Renders 6 tiny particles that fan out and fade away.
 * Mount/unmount this component to trigger the animation.
 */
import { motion, AnimatePresence } from "framer-motion";

const PARTICLES = [0, 1, 2, 3, 4, 5];
const ANGLES = [0, 60, 120, 180, 240, 300];
const COLORS = [
  "oklch(0.68 0.22 270)",   // primary violet
  "oklch(0.68 0.18 145)",   // emerald
  "oklch(0.74 0.14 85)",    // amber
  "oklch(0.68 0.22 270)",
  "oklch(0.65 0.18 200)",   // cyan
  "oklch(0.68 0.18 145)",
];

export function TaskCompleteBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {PARTICLES.map((i) => {
            const angle = (ANGLES[i] ?? 0) * (Math.PI / 180);
            const x = Math.cos(angle) * 18;
            const y = Math.sin(angle) * 18;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ opacity: 0, x, y, scale: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: COLORS[i],
                }}
              />
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
}
