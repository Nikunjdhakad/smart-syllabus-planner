import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "primary" | "emerald" | "amber" | "rose" | "cyan";

const accentConfig: Record<Accent, { icon: string; value: string; glow: string }> = {
  primary: {
    icon: "bg-primary/12 text-primary",
    value: "text-foreground",
    glow: "from-primary/6 to-transparent",
  },
  emerald: {
    icon: "bg-emerald-500/12 text-emerald-400",
    value: "text-emerald-400",
    glow: "from-emerald-500/6 to-transparent",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-400",
    value: "text-amber-400",
    glow: "from-amber-500/6 to-transparent",
  },
  rose: {
    icon: "bg-rose-500/12 text-rose-400",
    value: "text-rose-400",
    glow: "from-rose-500/6 to-transparent",
  },
  cyan: {
    icon: "bg-cyan-500/12 text-cyan-400",
    value: "text-cyan-400",
    glow: "from-cyan-500/6 to-transparent",
  },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  className?: string;
  accent?: Accent;
}) {
  const cfg = accentConfig[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-border/80",
        "hover:shadow-lg hover:shadow-black/10",
        className,
      )}
    >
      {/* Gradient top-left accent */}
      <div
        className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", cfg.glow)}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            {label}
          </p>
          <p className={cn("count-up text-3xl font-bold tracking-tight tabular-nums", cfg.value)}>
            {value}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground leading-snug">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            "transition-transform duration-300 group-hover:scale-110",
            cfg.icon,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
