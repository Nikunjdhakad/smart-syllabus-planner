"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CalendarClock, Check, CheckCircle2, Loader2, RotateCcw, Sparkles, X, Brain, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { FilterBadge } from "@/components/shared/filter-badge";
import { getRevisionFilter, filterRevisionsByStatus } from "@/lib/filter-utils";
import { cn } from "@/lib/utils";
import type { RevisionItem, RevisionListResponse } from "@/types/revision";

async function readApiError(r: Response): Promise<string> {
  try { const b = await r.json(); return typeof b.error === "string" ? b.error : "Request failed"; }
  catch { return "Request failed"; }
}

function formatDueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function revisionTitle(item: RevisionItem) {
  const topic = item.topicName ?? item.topicId.slice(0, 8);
  return item.subjectName ? `${topic} · ${item.subjectName}` : topic;
}

function RevisionCard({ item, actingId, onComplete, onSkip }: {
  item: RevisionItem;
  actingId: string | null;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
}) {
  const busy = actingId === item.revisionId;
  const missed = item.displayStatus === "missed";
  const completed = item.displayStatus === "completed";

  return (
    <li className={cn(
      "group relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200",
      missed
        ? "border-destructive/25 bg-destructive/5 hover:border-destructive/40"
        : completed
        ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-border/60 bg-card hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5",
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm font-semibold leading-snug",
            completed && "text-muted-foreground line-through opacity-70"
          )}>
            {revisionTitle(item)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Due {formatDueDate(item.dueDate)}
          </p>
        </div>

        {/* Revision number badge */}
        <span className={cn(
          "shrink-0 flex size-7 items-center justify-center rounded-full text-[10px] font-bold border",
          missed
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : completed
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
            : "border-primary/30 bg-primary/10 text-primary"
        )}>
          R{item.revisionNumber}
        </span>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium border",
          missed
            ? "border-destructive/25 bg-destructive/10 text-destructive"
            : completed
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
            : "border-primary/25 bg-primary/10 text-primary"
        )}>
          {missed ? <AlertCircle className="size-2.5" /> : completed ? <CheckCircle2 className="size-2.5" /> : <CalendarClock className="size-2.5" />}
          {missed ? "Missed" : completed ? "Completed" : item.displayStatus}
        </span>
      </div>

      {/* Action buttons */}
      {!completed && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onComplete(item.revisionId)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-all",
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
              busy && "opacity-50 cursor-not-allowed"
            )}
          >
            {busy ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            Mark Done
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSkip(item.revisionId)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
              busy && "opacity-50 cursor-not-allowed"
            )}
          >
            <X className="size-3" />
            Skip
          </button>
        </div>
      )}

      {completed && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
          <Trophy className="size-3" />
          <span>Revision completed</span>
        </div>
      )}
    </li>
  );
}

function RevisionListBlock({ items, actingId, onComplete, onSkip, empty }: {
  items: RevisionItem[];
  actingId: string | null;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  empty: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted/40">
          <CheckCircle2 className="size-5 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <RevisionCard
          key={item.revisionId}
          item={item}
          actingId={actingId}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      ))}
    </ul>
  );
}

export function RevisionManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeFilter = getRevisionFilter(searchParams);

  const [buckets, setBuckets] = useState<RevisionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/revisions");
    if (!r.ok) throw new Error(await readApiError(r));
    const b = await r.json();
    return b.data as RevisionListResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;
    load().then((d) => { if (!cancelled) setBuckets(d); })
      .catch((e) => { if (!cancelled) setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to load" }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [load]);

  async function updateStatus(revisionId: string, status: "completed" | "skipped") {
    setActingId(revisionId); setMessage(null);
    try {
      const r = await fetch(`/api/revisions/${revisionId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error(await readApiError(r));
      setBuckets(await load());
      setMessage({ type: "success", text: status === "completed" ? "✓ Revision completed!" : "Revision skipped" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Update failed" });
    } finally { setActingId(null); }
  }

  async function handleGenerate() {
    setGenerating(true); setMessage(null);
    try {
      const r = await fetch("/api/revisions/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!r.ok) throw new Error(await readApiError(r));
      const b = await r.json();
      setBuckets(await load());
      setMessage({ type: "success", text: b.data.message ?? "Revisions generated!" });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Generate failed" });
    } finally { setGenerating(false); }
  }

  const data = buckets ?? { upcoming: [], missed: [], completed: [], total: 0 };

  const allRevisions = useMemo(
    () => [...data.upcoming, ...data.missed, ...data.completed],
    [data.upcoming, data.missed, data.completed]
  );

  const filteredRevisions = useMemo(
    () => filterRevisionsByStatus(allRevisions, activeFilter),
    [allRevisions, activeFilter]
  );

  const filteredData = useMemo(() => {
    if (!activeFilter) return data;
    return {
      upcoming: filteredRevisions.filter((r) => r.displayStatus === "scheduled" && new Date(r.dueDate) >= new Date()),
      missed: filteredRevisions.filter((r) => r.displayStatus === "missed" || r.displayStatus === "skipped" || (r.displayStatus === "scheduled" && new Date(r.dueDate) < new Date())),
      completed: filteredRevisions.filter((r) => r.displayStatus === "completed"),
      total: data.total,
    };
  }, [activeFilter, filteredRevisions, data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalDone = data.completed.length;
  const totalAll = data.upcoming.length + data.missed.length + data.completed.length;
  const completionPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <div className="page-enter space-y-6">
      {activeFilter && (
        <FilterBadge
          filterType="status"
          filterValue={activeFilter}
          onClear={() => router.push("/revisions")}
        />
      )}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/8 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-5 -bottom-5 size-24 rounded-full bg-primary/5 blur-2xl" aria-hidden />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
              <Brain className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Spaced Repetition</h2>
              <p className="mt-0.5 text-xs text-muted-foreground max-w-sm">
                Reviews at 1, 3, 7 days after completion — plus a final review before your exam.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Completion ring */}
            <div className="flex items-center gap-3">
              <div className="relative flex size-14 items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-border/40" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                    strokeDasharray={`${(completionPct / 100) * 94.25} 94.25`}
                    strokeLinecap="round" className="text-primary"
                    style={{ transition: "stroke-dasharray 0.7s ease" }}
                  />
                </svg>
                <span className="text-xs font-bold text-primary">{completionPct}%</span>
              </div>
              <div>
                <p className="text-xs font-semibold">{totalDone}/{totalAll}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>

            <Button type="button" size="sm" variant="outline" disabled={generating} onClick={handleGenerate} className="shrink-0 gap-1.5">
              {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <p role="status" className={cn(
          "rounded-xl border px-4 py-3 text-sm",
          message.type === "success"
            ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400"
            : "border-destructive/25 bg-destructive/8 text-destructive"
        )}>
          {message.text}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Upcoming"
          value={String(data.upcoming.length)}
          hint="Scheduled"
          icon={CalendarClock}
          accent="cyan"
          onClick={() => router.push("/revisions?status=upcoming")}
        />
        <StatCard
          label="Missed"
          value={String(data.missed.length)}
          hint="Needs attention"
          icon={AlertCircle}
          accent="rose"
          onClick={() => router.push("/revisions?status=missed")}
        />
        <StatCard
          label="Completed"
          value={String(data.completed.length)}
          hint="Finished"
          icon={CheckCircle2}
          accent="emerald"
          onClick={() => router.push("/revisions?status=completed")}
        />
      </div>

      {/* Columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            icon: CalendarClock,
            iconClass: "text-primary",
            headerClass: "border-primary/20 bg-primary/5",
            title: `Upcoming`,
            count: filteredData.upcoming.length,
            items: filteredData.upcoming,
            empty: "No upcoming revisions"
          },
          {
            icon: AlertCircle,
            iconClass: "text-destructive",
            headerClass: "border-destructive/20 bg-destructive/5",
            title: `Missed`,
            count: filteredData.missed.length,
            items: filteredData.missed,
            empty: "No missed revisions"
          },
          {
            icon: CheckCircle2,
            iconClass: "text-emerald-500",
            headerClass: "border-emerald-500/20 bg-emerald-500/5",
            title: `Completed`,
            count: filteredData.completed.length,
            items: filteredData.completed,
            empty: "None completed yet"
          },
        ].map(({ icon: Icon, iconClass, headerClass, title, count, items, empty }) => (
          <div key={title} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className={cn("flex items-center justify-between border-b px-4 py-3.5", headerClass)}>
              <div className="flex items-center gap-2">
                <Icon className={cn("size-4 shrink-0", iconClass)} />
                <span className="text-sm font-semibold">{title}</span>
              </div>
              <span className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                iconClass,
                "bg-background/50 border border-current/20"
              )}>
                {count}
              </span>
            </div>
            <div className="p-4">
              <RevisionListBlock
                items={items}
                actingId={actingId}
                onComplete={(id) => updateStatus(id, "completed")}
                onSkip={(id) => updateStatus(id, "skipped")}
                empty={empty}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}