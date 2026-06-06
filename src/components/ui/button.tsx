import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type TargetAndTransition } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base — consistent font, spacing, transition; radius via --radius-btn token
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "text-sm font-semibold whitespace-nowrap",
    "transition-colors duration-150 outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/60",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Primary — violet, glowing, high emphasis */
        default: [
          "bg-primary text-primary-foreground border border-transparent",
          "shadow-[0_2px_12px_oklch(0.68_0.22_270/0.30)]",
          "hover:bg-primary/90 hover:shadow-[0_4px_20px_oklch(0.68_0.22_270/0.45)]",
        ].join(" "),
        /* Outline — medium emphasis */
        outline: [
          "border border-border/70 bg-transparent text-foreground",
          "hover:bg-white/6 hover:border-border",
          "dark:border-white/12 dark:hover:bg-white/8",
        ].join(" "),
        /* Secondary — low emphasis surface */
        secondary: [
          "bg-secondary text-secondary-foreground border border-transparent",
          "hover:bg-secondary/70",
        ].join(" "),
        /* Ghost — minimal, used in nav */
        ghost: [
          "border-transparent bg-transparent text-muted-foreground",
          "hover:bg-white/6 hover:text-foreground",
          "dark:hover:bg-white/8",
        ].join(" "),
        /* Destructive */
        destructive: [
          "bg-destructive/15 text-destructive border border-destructive/25",
          "hover:bg-destructive/25",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline border-transparent bg-transparent",
      },
      size: {
        default: "h-9 gap-2 px-4 rounded-[14px]",
        xs:      "h-6 gap-1 px-2 text-xs rounded-[10px]",
        sm:      "h-8 gap-1.5 px-3 text-[0.8125rem] rounded-[11px]",
        lg:      "h-11 gap-2 px-6 text-base rounded-[14px]",
        xl:      "h-12 gap-2.5 px-8 text-base rounded-[14px]",
        icon:    "size-9 rounded-[14px]",
        "icon-xs": "size-6 rounded-[10px]",
        "icon-sm": "size-8 rounded-[11px]",
        "icon-lg": "size-10 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Framer Motion whileHover/whileTap values by variant
const MOTION_HOVER: Record<string, TargetAndTransition> = {
  default:     { y: -1, scale: 1.01 },
  outline:     { y: -1 },
  secondary:   { y: -1 },
  ghost:       { scale: 1.02 },
  destructive: { scale: 1.01 },
  link:        {},
}

const MOTION_TAP: Record<string, TargetAndTransition> = {
  default:     { y: 0, scale: 0.97 },
  outline:     { y: 0, scale: 0.97 },
  secondary:   { y: 0, scale: 0.97 },
  ghost:       { scale: 0.96 },
  destructive: { scale: 0.97 },
  link:        { scale: 0.98 },
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const v = variant ?? "default"
  const hoverAnim = MOTION_HOVER[v] ?? {}
  const tapAnim   = MOTION_TAP[v]   ?? {}

  return (
    <motion.div
      whileHover={hoverAnim}
      whileTap={tapAnim}
      transition={{ duration: 0.15, ease: "easeOut" }}
      // Inherit display so it behaves as inline
      style={{ display: "inline-flex" }}
    >
      <ButtonPrimitive
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    </motion.div>
  )
}

export { Button, buttonVariants }
