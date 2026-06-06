"use client";

/**
 * Wraps page content with a Framer Motion fade+slide entry.
 * Drop-in replacement for the CSS `.page-enter` div.
 * Used in every dashboard page wrapper.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
