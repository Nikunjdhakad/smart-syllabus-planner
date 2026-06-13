import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Clock,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TaskSummaryItem } from "@/types/progress";

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function TodaysMission({
  nextTask,
  dueRevisions,
  overdueCount,
}: {
  nextTask: TaskSummaryItem | null;
  dueRevisions: number;
  overdueCount: number;
}) {
  const hasMission = nextTask || dueRevisions > 0 || overdueCount > 0;

  if (!hasMission) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-6 text-center">
        <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground/30" />
        <p className="font-semibold text-foreground">No missions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a study plan to get personalized daily tasks.
        </p>
        <Link
          href={ROUTES.planner}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Open Study Planner <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  const dueText = nextTask ? formatDueDate(nextTask.dueDate) : null;
  const isOverdue = dueText?.includes("overdue");

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          Today&apos;s Mission
        </h2>
        <Link href={ROUTES.planner} className="text-xs font-medium text-primary hover:underline">
          View planner →
        </Link>
      </div>

      <div className="dash-mission-accent rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — task info */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {nextTask && (
              <>
                <p className="truncate text-base font-semibold text-foreground">
                  {nextTask.taskTitle}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {dueText}
                  </span>
                  <span className="text-border">·</span>
                  <span className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium",
                    nextTask.priority === "high"
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-500 dark:text-rose-400"
                      : nextTask.priority === "medium"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {nextTask.priority} priority
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right — quick stats */}
          <div className="flex shrink-0 items-center gap-3">
            {dueRevisions > 0 && (
              <Link
                href={ROUTES.revisions}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/15 dark:text-amber-400"
              >
                <RotateCcw className="size-3" />
                {dueRevisions} revision{dueRevisions > 1 ? "s" : ""} due
              </Link>
            )}
            {overdueCount > 0 && (
              <Link
                href={ROUTES.recovery}
                className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
              >
                <AlertTriangle className="size-3" />
                {overdueCount} overdue
              </Link>
            )}
            {nextTask && (
              <Link
                href={ROUTES.planner}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
              >
                Start studying
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Overdue inline alert */}
        {isOverdue && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="size-3 shrink-0" />
            This task is overdue — consider using the Recovery Center.
          </div>
        )}
      </div>
    </div>
  );
}
