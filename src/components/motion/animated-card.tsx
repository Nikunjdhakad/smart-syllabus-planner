"use client";

/**
 * Card with hover elevation + border glow micro-interaction.
 * Wrap any card content with this to get the hover lift.
 * The `.card-hover` CSS class is kept for non-interactive cards;
 * this component is for interactive clickable cards.
 */
import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof motion.div> & {
  children: ReactNode;
  glow?: boolean;
};

export function AnimatedCard({ children, className, glow = true, ...props }: Props) {
  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: glow
          ? "0 8px 32px oklch(0.68 0.22 270 / 0.14), 0 2px 8px oklch(0 0 0 / 0.10)"
          : "0 6px 24px oklch(0 0 0 / 0.12)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      className={cn("transition-colors duration-200", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
