import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "text-sm font-semibold whitespace-nowrap",
    "transition-all duration-200 outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
    "active:not-aria-[haspopup]:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground border border-transparent",
          "shadow-[0_2px_8px_rgba(124,58,237,0.25)]",
          "hover:bg-primary/90 hover:shadow-[0_4px_16px_rgba(124,58,237,0.35)] hover:-translate-y-px",
        ].join(" "),
        outline: [
          "border border-border bg-background text-foreground",
          "hover:bg-muted hover:border-border",
          "shadow-sm",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground border border-border/60",
          "hover:bg-secondary/80",
          "shadow-sm",
        ].join(" "),
        ghost: [
          "border-transparent bg-transparent text-muted-foreground",
          "hover:bg-muted hover:text-foreground",
        ].join(" "),
        destructive: [
          "bg-destructive/10 text-destructive border border-destructive/30",
          "hover:bg-destructive/20",
        ].join(" "),
        link: "text-primary underline-offset-4 hover:underline border-transparent bg-transparent shadow-none",
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

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
