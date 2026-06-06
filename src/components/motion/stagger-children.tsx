"use client";

/**
 * Stagger-animates direct children.
 * Replaces the CSS `.stagger` class on card grids.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StaggerChildren({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
