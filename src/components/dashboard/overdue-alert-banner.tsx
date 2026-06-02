import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OverdueAlertBanner({ overdueCount }: { overdueCount: number }) {
  if (overdueCount === 0) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/8 px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
          <AlertTriangle className="size-4 text-destructive" />
        </div>
        <div>
          <p className="text-sm font-semibold text-destructive">
            {overdueCount} overdue task{overdueCount > 1 ? "s" : ""} detected
          </p>
          <p className="text-xs text-destructive/70">Your study plan needs attention.</p>
        </div>
      </div>
      <Link
        href={ROUTES.recovery}
        className={cn(buttonVariants({ size: "sm" }), "gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90")}
      >
        Recovery Center
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
