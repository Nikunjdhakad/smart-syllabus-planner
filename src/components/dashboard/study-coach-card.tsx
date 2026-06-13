"use client";

import { useEffect, useState } from "react";
import { Bot, Target, ShieldAlert, RotateCcw, Sparkles, Brain } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useCopilot } from "@/components/copilot/copilot-store";

interface CoachSummary {
  readinessScore: number;
  priority: string;
  risk: string;
  recommendation: string;
  motivation: string;
  revisionAlert: string | null;
  recoveryAlert: string | null;
  quizInsight: string | null;
}

export function StudyCoachCard() {
  const [data, setData] = useState<CoachSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { setOpen } = useCopilot();

  useEffect(() => {
    fetch("/api/agent/summary")
      .then((r) => r.json())
      .then((json) => {
        setData(json.data ?? json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-primary/20" />
          <div className="h-5 w-40 rounded bg-primary/20" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-primary/10" />
          <div className="h-4 w-3/4 rounded bg-primary/10" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      {/* Glow effect */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/20">
          <Brain className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">AI Study Coach</p>
          <p className="text-xs text-muted-foreground">Powered by Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
          <Sparkles className="size-3 text-primary" />
          <span className="text-xs font-medium text-primary">{data.readinessScore}% Ready</span>
        </div>
      </div>

      {/* Readiness bar */}
      <div className="relative mb-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
            style={{ width: `${data.readinessScore}%` }}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="relative grid gap-3 sm:grid-cols-2 mb-5">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Today's Priority</p>
          <p className="text-sm font-medium">{data.priority}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Risk</p>
          <p className="text-sm font-medium text-amber-400">{data.risk}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 sm:col-span-2">
          <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
          <p className="text-sm font-medium">{data.recommendation}</p>
        </div>
      </div>

      {/* Motivation */}
      <p className="relative text-xs text-muted-foreground italic mb-5">
        "{data.motivation}"
      </p>

      {/* Alerts */}
      {(data.revisionAlert || data.recoveryAlert || data.quizInsight) && (
        <div className="relative flex flex-wrap gap-2 mb-5">
          {data.quizInsight && (
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Target className="size-3" />
              {data.quizInsight}
            </span>
          )}
          {data.revisionAlert && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
              <RotateCcw className="size-3" />
              {data.revisionAlert}
            </span>
          )}
          {data.recoveryAlert && (
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
              <ShieldAlert className="size-3" />
              {data.recoveryAlert}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="relative flex flex-wrap gap-2">
        {data.recoveryAlert && (
          <Link
            href={ROUTES.recovery}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <ShieldAlert className="size-3" />
            View Recovery Plan
          </Link>
        )}
        {data.revisionAlert && (
          <Link
            href={ROUTES.revisions}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <RotateCcw className="size-3" />
            View Revisions
          </Link>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Bot className="size-3" />
          Open Copilot
        </button>
      </div>
    </div>
  );
}