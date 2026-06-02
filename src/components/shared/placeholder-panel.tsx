import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaceholderPanel({
  title,
  description,
  phase,
  icon: Icon = Construction,
  steps,
}: {
  title: string;
  description: string;
  phase?: number;
  icon?: LucideIcon;
  steps?: string[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-10 text-center shadow-sm">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/8 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-12 size-32 rounded-full bg-primary/5 blur-2xl" aria-hidden />

      <div className="relative flex flex-col items-center">
        {/* Icon with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" aria-hidden />
          <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
            <Icon className="size-8" strokeWidth={1.5} />
          </div>
        </div>

        {phase !== undefined && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Phase {phase}
          </span>
        )}

        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>

        {steps && steps.length > 0 && (
          <ul className="stagger mt-8 w-full max-w-sm space-y-2 text-left">
            {steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/3 px-3.5 py-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
