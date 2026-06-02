import { AlertTriangle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecoveryRecommendation } from "@/types/recovery";

const cfg = {
  info: { icon: Info, rowClass: "border-border/60 bg-white/3", iconClass: "text-primary/60" },
  warning: { icon: AlertTriangle, rowClass: "border-amber-500/25 bg-amber-500/5", iconClass: "text-amber-400" },
  critical: { icon: Zap, rowClass: "border-destructive/25 bg-destructive/5", iconClass: "text-destructive" },
};

const typeLabels: Record<string, string> = { hours: "Hours", pace: "Pace", exam: "Exam", schedule: "Schedule" };

export function RecommendationsPanel({ recommendations }: { recommendations: RecoveryRecommendation[] }) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="text-sm font-semibold">Recovery suggestions</p>
        <p className="text-xs text-muted-foreground mt-0.5">AI-generated recommendations to get back on track.</p>
      </div>
      <ul className="divide-y divide-border/40 p-4 space-y-2">
        {recommendations.map((rec, i) => {
          const { icon: Icon, rowClass, iconClass } = cfg[rec.severity];
          return (
            <li key={i} className={cn("flex items-start gap-3 rounded-xl border p-3.5", rowClass)}>
              <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs font-medium">
                    {typeLabels[rec.type] ?? rec.type}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">{rec.severity}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
