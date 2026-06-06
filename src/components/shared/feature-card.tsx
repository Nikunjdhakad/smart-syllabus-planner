import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const accentStyles = [
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "group-hover:border-violet-500/30" },
  { bg: "bg-sky-500/10", text: "text-sky-400", border: "group-hover:border-sky-500/30" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "group-hover:border-emerald-500/30" },
  { bg: "bg-amber-500/10", text: "text-amber-400", border: "group-hover:border-amber-500/30" },
  { bg: "bg-rose-500/10", text: "text-rose-400", border: "group-hover:border-rose-500/30" },
] as const;

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  accentIndex = 0,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentIndex?: number;
}) {
  const accent = accentStyles[accentIndex % accentStyles.length];

  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-card border border-border/60 bg-card p-5 card-hover",
          accent.border,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-card-sm", accent.bg, accent.text)}>
            <Icon className="size-5" strokeWidth={2} />
          </div>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            aria-hidden
          />
        </div>
        <div className="relative mt-3">
          <p className="text-heading-3 font-semibold">{title}</p>
          <p className="mt-1.5 text-body-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
