import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 overflow-hidden",
    "h-5 w-fit shrink-0 px-2.5 py-0.5",
    "text-[0.6875rem] font-semibold whitespace-nowrap",
    "rounded-[9999px] border",
    "transition-colors",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default:     "bg-primary/10 text-primary border-primary/25 dark:bg-primary/20 dark:border-primary/30",
        secondary:   "bg-secondary text-secondary-foreground border-border",
        destructive: "bg-destructive/10 text-destructive border-destructive/25",
        outline:     "border-border text-foreground bg-transparent",
        ghost:       "bg-transparent text-muted-foreground border-transparent",
        success:     "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
        warning:     "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400",
        info:        "bg-sky-500/10 text-sky-600 border-sky-500/25 dark:text-sky-400",
        link:        "text-primary underline-offset-4 hover:underline border-transparent bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">({ className: cn(badgeVariants({ variant }), className) }, props),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
