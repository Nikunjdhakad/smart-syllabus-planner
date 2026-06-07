import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[16px]",
        "border border-border bg-background px-3.5 py-2",
        "text-[0.9375rem] text-foreground",
        "placeholder:text-muted-foreground/70",
        "shadow-sm",
        "transition-all duration-150 outline-none",
        "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        "file:inline-flex file:h-7 file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium file:mr-3 file:rounded-md file:px-2",
        className
      )}
      {...props}
    />
  )
}

export { Input }
