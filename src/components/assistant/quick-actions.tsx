import { BookOpen, CalendarCheck, Flame, LifeBuoy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "What should I study today?", icon: BookOpen },
  { label: "Can I finish before my exam?", icon: CalendarCheck },
  { label: "What is my weakest subject?", icon: Flame },
  { label: "Generate a crash plan", icon: LifeBuoy },
  { label: "What revisions are due?", icon: RotateCcw },
] as const;

export function QuickActions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
        Quick questions
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5",
              "text-xs font-medium text-muted-foreground transition-all duration-200",
              "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
