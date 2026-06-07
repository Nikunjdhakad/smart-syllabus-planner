import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type Accent = "primary" | "emerald" | "amber" | "rose" | "cyan";

const accentConfig: Record<Accent, { icon: string; value: string; bg: string; border: string }> = {
  primary: {
    icon:   "bg-primary/10 text-primary dark:bg-primary/20",
    value:  "text-primary dark:text-primary",
    bg:     "from-primary/5 to-transparent dark:from-primary/8",
    border: "border-border hover:border-primary/30",
  },
  emerald: {
    icon:   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    value:  "text-emerald-600 dark:text-emerald-400",
    bg:     "from-emerald-500/5 to-transparent dark:from-emerald-500/8",
    border: "border-border hover:border-emerald-500/30",
  },
  amber: {
    icon:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    value:  "text-amber-600 dark:text-amber-400",
    bg:     "from-amber-500/5 to-transparent dark:from-amber-500/8",
    border: "border-border hover:border-amber-500/30",
  },
  rose: {
    icon:   "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20",
    value:  "text-rose-600 dark:text-rose-400",
    bg:     "from-rose-500/5 to-transparent dark:from-rose-500/8",
    border: "border-border hover:border-rose-500/30",
  },
  cyan: {
    icon:   "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 dark:bg-cyan-500/20",
    value:  "text-cyan-600 dark:text-cyan-400",
    bg:     "from-cyan-500/5 to-transparent dark:from-cyan-500/8",
    border: "border-border hover:border-cyan-500/30",
  },
};

// Accept either a LucideIcon component reference OR a pre-rendered ReactElement
type IconProp = LucideIcon | React.ReactElement;

function renderIcon(icon: IconProp, className: string): React.ReactNode {
  if (React.isValidElement(icon)) return icon;
  const Icon = icon as LucideIcon;
  return <Icon className="size-5" strokeWidth={2} />;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: IconProp;
  className?: string;
  accent?: Accent;
}) {
  const cfg = accentConfig[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[24px] border bg-card p-5",
        "shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        cfg.border,
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", cfg.bg)} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn("count-up font-bold tabular-nums leading-none", cfg.value)}
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.125rem)", letterSpacing: "-0.03em" }}
          >
            {value}
          </p>
          {hint && <p className="text-xs text-muted-foreground leading-snug">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[20px]",
            "transition-transform duration-300 group-hover:scale-110",
            cfg.icon,
          )}
        >
          {renderIcon(icon, "size-5")}
        </div>
      </div>
    </div>
  );
}
