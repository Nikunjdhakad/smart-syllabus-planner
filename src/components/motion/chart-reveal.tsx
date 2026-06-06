"use client";

/**
 * Wraps a chart container with a fade-in + subtle scale-up on mount.
 * Keeps charts feeling alive without being distracting.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ChartReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
