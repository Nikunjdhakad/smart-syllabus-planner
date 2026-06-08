"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Loader2,
  ListTodo,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskCompleteBurst } from "@/components/motion/task-complete-burst";
import { StatCard } from "@/components/shared/stat-card";
import { QuizModal } from "@/components/quiz/quiz-modal";
import { cn } from "@/lib/utils";
import type { PlannerTask, StudyPlanDetail, StudyPlanListItem } from "@/types/study-plan";
import type { SubjectItem, SyllabusItem } from "@/types/syllabus";

// ─── helpers ────────────────────────────────────────────────────

async function readApiError(r: Response) {
  try { const b = await r.json(); return typeof b.error === "string" ? b.error : "Request failed"; }
  catch { return "Request failed"; }
}

function dateKey(iso: string) {
  return new Date(iso).toISOString().split("T")[0]!;
}

function formatDayLabel(key: string) {
  const d = new Date(`${key}T12:00:00`);
  const today = dateKey(new Date().toISOString());
  const tomorrow = dateKey(new Date(Date.now() + 86400000).toISOString());
  if (key === today)    return { top: "Today",    sub: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) };
  if (key === tomorrow) return { top: "Tomorrow", sub: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) };
  return {
    top: d.toLocaleDateString("en-US", { weekday: "short" }),
    sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function isPast(key: string) {
  return key < dateKey(new Date().toISOString());
}

function groupTasksByDate(tasks: PlannerTask[]) {
  const g: Record<string, PlannerTask[]> = {};
  for (const t of tasks) { (g[dateKey(t.dueDate)] ??= []).push(t); }
  return g;
}

// ─── style maps ─────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { dot: "bg-rose-500",   bar: "bg-rose-500",   chip: "bg-rose-500/12 text-rose-500 border-rose-500/25",   label: "High"   },
  medium: { dot: "bg-amber-500",  bar: "bg-amber-500",  chip: "bg-amber-500/12 text-amber-500 border-amber-500/25", label: "Medium" },
  low:    { dot: "bg-emerald-500",bar: "bg-emerald-500",chip: "bg-emerald-500/12 text-emerald-500 border-emerald-500/25", label: "Low" },
} as const;

const STATUS_CONFIG = {
  completed:   { chip: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Done" },
  in_progress: { chip: "bg-primary/10 text-primary border-primary/20",            label: "In progress" },
  missed:      { chip: "bg-destructive/10 text-destructive border-destructive/20", label: "Missed" },
  pending:     { chip: "bg-muted/60 text-muted-foreground border-border/60",       label: "Pending" },
} as const;

const SUBJECT_PALETTES = [
  "bg-violet-500/12 text-violet-500 border-violet-500/25",
  "bg-sky-500/12 text-sky-500 border-sky-500/25",
  "bg-emerald-500/12 text-emerald-500 border-emerald-500/25",
  "bg-amber-500/12 text-amber-500 border-amber-500/25",
  "bg-rose-500/12 text-rose-500 border-rose-500/25",
  "bg-cyan-500/12 text-cyan-500 border-cyan-500/25",
  "bg-pink-500/12 text-pink-500 border-pink-500/25",
  "bg-indigo-500/12 text-indigo-500 border-indigo-500/25",
] as const;

// ─── sub-components ──────────────────────────────────────────────

/** Thin left accent bar showing priority colour */
function PriorityBar({ priority }: { priority: string }) {
  const bar = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.bar ?? "bg-border";
  return <div className={cn("absolute left-0 top-0 h-full w-[3px] rounded-l-card-sm transition-all", bar)} aria-hidden />;
}

/** Animated check ring for completed tasks */
function DoneRing() {
  return (
    <span className="relative flex size-5 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-[copilot-pulse_1.5s_ease-out_1]" aria-hidden />
      <CheckCircle2 className="size-5 text-emerald-500" strokeWidth={2} />
    </span>
  );
}

/** Single task row inside a day card */
function TaskRow({
  task,
  subjectName,
  subjectPalette,
  onComplete,
  onUndo,
  busy,
  justCompleted,
}: {
  task: PlannerTask;
  subjectName: string | null;
  subjectPalette: string;
  onComplete: () => void;
  onUndo: () => void;
  busy: boolean;
  justCompleted: boolean;
}) {
  const done = task.status === "completed";
  const missed = task.status === "missed";
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.low;
  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  return (
    <li
      className={cn(
        "group relative flex items-start gap-3 rounded-card-sm pl-4 pr-3 py-3 transition-all duration-200",
        "border border-transparent",
        done
          ? "bg-emerald-500/5 border-emerald-500/10"
          : missed
          ? "bg-destructive/5 border-destructive/10"
          : "hover:bg-white/4 hover:border-border/40",
      )}
    >
      <PriorityBar priority={task.priority} />

      {/* Complete toggle — contains the burst */}
      <div className="relative mt-0.5 shrink-0">
        <TaskCompleteBurst show={justCompleted} />
        <button
          type="button"
          onClick={done ? onUndo : onComplete}
          disabled={busy}
          aria-label={done ? "Undo completion" : "Mark complete"}
          className={cn(
            "flex size-5 items-center justify-center rounded-full border-2 transition-all duration-200",
            done
              ? "border-emerald-500 bg-emerald-500"
              : "border-border/60 bg-transparent hover:border-primary hover:bg-primary/10",
            busy && "opacity-50 cursor-not-allowed",
          )}
        >
          {busy ? (
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
          ) : done ? (
            <Check className="size-2.5 text-white" strokeWidth={3} />
          ) : null}
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug transition-all duration-300",
            done && "line-through text-muted-foreground opacity-60",
            missed && "text-muted-foreground opacity-70",
          )}
        >
          {task.taskTitle}
        </p>

        {/* Chip row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {subjectName && (
            <span className={cn("inline-flex items-center gap-1 rounded-chip border px-2 py-0.5 text-[10px] font-medium", subjectPalette)}>
              <BookOpen className="size-2.5" aria-hidden />
              {subjectName}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1 rounded-chip border px-2 py-0.5 text-[10px] font-medium", priority.chip)}>
            <Flame className="size-2.5" aria-hidden />
            {priority.label}
          </span>
          {(done || missed || task.status === "in_progress") && (
            <span className={cn("inline-flex items-center rounded-chip border px-2 py-0.5 text-[10px] font-medium", status.chip)}>
              {status.label}
            </span>
          )}
        </div>
      </div>

      {done && (
        <span className="shrink-0 mt-0.5">
          <DoneRing />
        </span>
      )}
    </li>
  );
}

/** A single day card in the timeline */
function DayCard({
  dateKey: key,
  tasks,
  subjects,
  actingTaskId,
  justCompletedId,
  onComplete,
  onUndo,
  isToday,
}: {
  dateKey: string;
  tasks: PlannerTask[];
  subjects: SubjectItem[];
  actingTaskId: string | null;
  justCompletedId: string | null;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  isToday: boolean;
}) {
  const subjectMap = Object.fromEntries(subjects.map((s, i) => [s.subjectId, { name: s.subjectName, palette: SUBJECT_PALETTES[i % SUBJECT_PALETTES.length]! }]));
  const done = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const allDone = done === total && total > 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const past = isPast(key);
  const { top, sub } = formatDayLabel(key);

  // Sort: completed last
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    const po = { high: 0, medium: 1, low: 2 };
    return (po[a.priority as keyof typeof po] ?? 2) - (po[b.priority as keyof typeof po] ?? 2);
  });

  // Estimate study hours from task count (proxy: 1 task ≈ 1h)
  const estHours = (total * 1.0).toFixed(1);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-card border transition-all duration-300",
        allDone
          ? "border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-card to-card shadow-sm shadow-emerald-500/10"
          : isToday
          ? "border-primary/30 bg-gradient-to-br from-primary/8 via-card to-card shadow-sm shadow-primary/10"
          : past
          ? "border-border/40 bg-card/60 opacity-80"
          : "border-border/60 bg-card hover:border-border/80 hover:shadow-sm",
      )}
    >
      {/* Today glow line */}
      {isToday && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" aria-hidden />
      )}

      {/* Day header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Date badge */}
          <div className={cn(
            "flex flex-col items-center justify-center rounded-card-sm px-2.5 py-1.5 min-w-[3rem] text-center border",
            isToday
              ? "bg-primary/15 border-primary/30 text-primary"
              : allDone
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : past
              ? "bg-muted/40 border-border/40 text-muted-foreground"
              : "bg-muted/30 border-border/50 text-foreground",
          )}>
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{top}</span>
            <span className="text-xs font-semibold leading-tight mt-0.5">{sub.split(",")[1]?.trim() ?? sub}</span>
          </div>

          <div>
            <p className="text-sm font-semibold leading-snug">
              {allDone ? (
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <Trophy className="size-3.5" aria-hidden />
                  All done!
                </span>
              ) : (
                sub
              )}
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="size-3" aria-hidden />
                {done}/{total} tasks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                ~{estHours}h
              </span>
            </div>
          </div>
        </div>

        {/* Progress ring / percent */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn(
            "text-lg font-bold tabular-nums leading-none",
            allDone ? "text-emerald-500" : isToday ? "text-primary" : "text-foreground",
          )}>
            {pct}%
          </span>
          {/* Progress bar */}
          <div className="h-1 w-16 overflow-hidden rounded-full bg-border/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                allDone ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task list */}
      <AnimatePresence initial={false}>
        <ul className="space-y-1 px-3 pb-3">
          {sorted.map((task) => {
            const sub = subjectMap[task.subjectId ?? ""];
            return (
              <motion.div
                key={task.taskId}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <TaskRow
                  task={task}
                  subjectName={sub?.name ?? null}
                  subjectPalette={sub?.palette ?? SUBJECT_PALETTES[0]!}
                  onComplete={() => onComplete(task.taskId)}
                  onUndo={() => onUndo(task.taskId)}
                  busy={actingTaskId === task.taskId}
                  justCompleted={justCompletedId === task.taskId}
                />
              </motion.div>
            );
          })}
        </ul>
      </AnimatePresence>
    </article>
  );
}

/** Plan selector sidebar item */
function PlanItem({
  plan,
  active,
  deleting,
  onClick,
  onDelete,
}: {
  plan: StudyPlanListItem;
  active: boolean;
  deleting: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const examIn = Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86400000);
  return (
    <div
      className={cn(
        "group relative flex items-start gap-2 rounded-card-sm p-3 transition-all duration-200 cursor-pointer",
        active
          ? "bg-primary/12 border border-primary/25 shadow-sm"
          : "border border-transparent hover:bg-white/4 hover:border-border/40",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={active}
    >
      {/* Active accent line */}
      {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" aria-hidden />}

      <div className="min-w-0 flex-1 pl-1">
        <p className="truncate text-sm font-semibold leading-snug">{plan.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {examIn > 0 ? `${examIn}d to exam` : "Exam passed"} · {plan.progress}%
        </p>

        {/* Mini progress */}
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              plan.progress === 100 ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${plan.progress}%` }}
          />
        </div>

        {/* Stat chips */}
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-chip border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {plan.completedTasks}/{plan.totalTasks} done
          </span>
          {plan.status === "active" && (
            <span className="rounded-chip border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        disabled={deleting}
        aria-label="Delete plan"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
      </button>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────

export function StudyPlanner() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  
  const [plans, setPlans] = useState<StudyPlanListItem[]>([]);
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDetail, setPlanDetail] = useState<StudyPlanDetail | null>(null);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [actingTaskId, setActingTaskId] = useState<string | null>(null);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTaskId, setQuizTaskId] = useState<string | null>(null);
  const [quizTaskTitle, setQuizTaskTitle] = useState<string>("");

  // Form state
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState("2");
  const [selectedSyllabusIds, setSelectedSyllabusIds] = useState<string[]>([]);
  const [weakSubjectIds, setWeakSubjectIds] = useState<string[]>([]);

  // Timeline scroll ref
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Filter tasks based on URL parameter
  const filteredTasks = statusFilter
    ? tasks.filter((task) => {
        if (statusFilter === "completed") return task.status === "completed";
        if (statusFilter === "pending") return task.status === "pending" || task.status === "in_progress";
        if (statusFilter === "overdue" || statusFilter === "missed") return task.status === "missed";
        return true;
      })
    : tasks;
    
  // Calculate filtered stats
  const filteredCompleted = filteredTasks.filter((t) => t.status === "completed").length;
  const filteredPending = filteredTasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
  const filteredOverdue = filteredTasks.filter((t) => t.status === "missed").length;

  const loadPlans = useCallback(async () => {
    const r = await fetch("/api/study-plans");
    if (!r.ok) throw new Error(await readApiError(r));
    return (await r.json()).data.plans as StudyPlanListItem[];
  }, []);

  const loadPlanDetail = useCallback(async (planId: string) => {
    const r = await fetch(`/api/study-plans/${planId}`);
    if (!r.ok) throw new Error(await readApiError(r));
    const b = await r.json();
    return { plan: b.data.plan as StudyPlanDetail, tasks: b.data.tasks as PlannerTask[] };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planList, syllabusRes, subjectRes] = await Promise.all([
          loadPlans(), fetch("/api/syllabus"), fetch("/api/subjects"),
        ]);
        if (cancelled) return;
        setPlans(planList);
        if (syllabusRes.ok) {
          const items = ((await syllabusRes.json()).data.syllabi as SyllabusItem[]).filter(
            (s) => s.extractionStatus === "completed",
          );
          setSyllabi(items);
          if (items.length === 1) setSelectedSyllabusIds([items[0]!.syllabusId]);
        }
        if (subjectRes.ok) setSubjects((await subjectRes.json()).data.subjects as SubjectItem[]);
        if (planList.length > 0) setSelectedPlanId((c) => c ?? planList[0]!.planId);
      } catch (err) {
        if (!cancelled) setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load planner" });
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadPlans]);

  useEffect(() => {
    if (!selectedPlanId) { setPlanDetail(null); setTasks([]); return; }
    let cancelled = false;
    setLoadingDetail(true);
    loadPlanDetail(selectedPlanId)
      .then(({ plan, tasks: t }) => {
        if (cancelled) return;
        setPlanDetail(plan);
        setTasks(t);
        // Auto-scroll to today if present
        setTimeout(() => {
          const el = document.getElementById("timeline-today");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      })
      .catch((err) => { if (!cancelled) setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load plan" }); })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [selectedPlanId, loadPlanDetail]);

  function updatePlanCounts(planId: string, delta: number) {
    const calc = (completed: number, total: number) => ({
      completedTasks: Math.max(0, completed + delta),
      progress: total > 0 ? Math.round((Math.max(0, completed + delta) / total) * 100) : 0,
    });
    setPlans((p) => p.map((pl) => pl.planId !== planId ? pl : { ...pl, ...calc(pl.completedTasks, pl.totalTasks) }));
    setPlanDetail((p) => !p || p.planId !== planId ? p : { ...p, ...calc(p.completedTasks, p.totalTasks) });
  }

  async function handleComplete(taskId: string) {
    // Show quiz modal instead of completing directly
    const task = tasks.find((t) => t.taskId === taskId);
    if (task) {
      setQuizTaskId(taskId);
      setQuizTaskTitle(task.taskTitle);
      setShowQuiz(true);
    }
  }
  
  function handleQuizComplete() {
    // Refresh plan detail and tasks after quiz completion
    setShowQuiz(false);
    setQuizTaskId(null);
    setQuizTaskTitle("");
    
    if (selectedPlanId) {
      loadPlanDetail(selectedPlanId)
        .then(({ plan, tasks: t }) => {
          setPlanDetail(plan);
          setTasks(t);
        })
        .catch((err) => {
          setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to refresh" });
        });
    }
  }
  
  function handleQuizCancel() {
    setShowQuiz(false);
    setQuizTaskId(null);
    setQuizTaskTitle("");
  }

  async function handleUndo(taskId: string) {
    setActingTaskId(taskId); setMessage(null);
    try {
      const r = await fetch(`/api/tasks/${taskId}/undo`, { method: "POST" });
      if (!r.ok) throw new Error(await readApiError(r));
      const updated = (await r.json()).data.task as PlannerTask;
      setTasks((p) => p.map((t) => t.taskId === taskId ? { ...t, ...updated } : t));
      if (selectedPlanId) updatePlanCounts(selectedPlanId, -1);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Could not undo task" });
    } finally { setActingTaskId(null); }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault(); setGenerating(true); setMessage(null);
    try {
      const r = await fetch("/api/study-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), examDate: new Date(examDate).toISOString(),
          dailyStudyHours: Number(dailyStudyHours),
          weakSubjects: weakSubjectIds, syllabusIds: selectedSyllabusIds,
        }),
      });
      if (!r.ok) throw new Error(await readApiError(r));
      const body = await r.json();
      const planId = body.data.plan.planId as string;
      setShowGenerate(false); setTitle(""); setExamDate(""); setWeakSubjectIds([]);
      const list = await loadPlans();
      setPlans(list); setSelectedPlanId(planId);
      setMessage({ type: "success", text: `✓ Plan created — ${body.data.plan.totalTasks} tasks scheduled` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to generate plan" });
    } finally { setGenerating(false); }
  }

  async function handleDeletePlan(planId: string) {
    if (!confirm("Delete this study plan and all its tasks?")) return;
    setDeletingPlanId(planId);
    try {
      const r = await fetch(`/api/study-plans/${planId}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await readApiError(r));
      const list = await loadPlans();
      setPlans(list);
      if (selectedPlanId === planId) setSelectedPlanId(list[0]?.planId ?? null);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to delete plan" });
    } finally { setDeletingPlanId(null); }
  }

  const tasksByDate = groupTasksByDate(filteredTasks);
  const sortedDateKeys = Object.keys(tasksByDate).sort();
  const todayKey = dateKey(new Date().toISOString());
  const readySyllabi = syllabi.length > 0;

  // Plan-level stats (use filtered or full tasks based on filter)
  const totalTasks = planDetail?.totalTasks ?? 0;
  const completedTasks = planDetail?.completedTasks ?? 0;
  const progress = planDetail?.progress ?? 0;
  const daysLeft = planDetail ? Math.max(0, Math.ceil((new Date(planDetail.examDate).getTime() - Date.now()) / 86400000)) : 0;
  const remainingTasks = totalTasks - completedTasks;
  
  // Clear filter helper
  const clearFilter = () => {
    window.history.pushState({}, "", "/planner");
    window.location.reload();
  };

  // Timeline scroll helpers
  function scrollTimeline(dir: "prev" | "next") {
    const el = timelineRef.current;
    if (!el) return;
    el.scrollBy({ top: dir === "next" ? 400 : -400, behavior: "smooth" });
  }

  return (
    <div className="page-enter space-y-5">
      {/* Toast message */}
      {message && (
        <div role="status" className={cn(
          "flex items-center gap-2 rounded-card-sm border px-4 py-3 text-sm animate-[fade-in-up_0.25s_ease-out]",
          message.type === "success"
            ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-500"
            : "border-destructive/25 bg-destructive/8 text-destructive",
        )}>
          {message.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : null}
          {message.text}
        </div>
      )}
      
      {/* Filter indicator */}
      {statusFilter && (
        <div className="flex items-center justify-between gap-3 rounded-card border border-primary/20 bg-primary/8 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Showing:</span>
            <span className="rounded-chip border border-primary/25 bg-primary/15 px-2.5 py-1 text-sm font-semibold text-primary capitalize">
              {statusFilter === "overdue" || statusFilter === "missed" ? "Overdue" : statusFilter} Tasks
            </span>
          </div>
          <button
            type="button"
            onClick={clearFilter}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/10"
          >
            <X className="size-3.5" />
            Clear filter
          </button>
        </div>
      )}

      {/* Planner Stats Cards - only show when plan is selected */}
      {planDetail && !showGenerate && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total tasks"
            value={String(totalTasks)}
            hint="All tasks in plan"
            icon={<Target className="size-5" strokeWidth={2} />}
          />
          <StatCard
            label="Completed"
            value={String(completedTasks)}
            hint="Tasks marked done"
            icon={<CheckCircle2 className="size-5" strokeWidth={2} />}
            accent="emerald"
            onClick={() => window.location.href = "/planner?status=completed"}
          />
          <StatCard
            label="Pending"
            value={String(filteredPending)}
            hint="Still to complete"
            icon={<ListTodo className="size-5" strokeWidth={2} />}
            accent="amber"
            onClick={() => window.location.href = "/planner?status=pending"}
          />
          <StatCard
            label="Overdue"
            value={String(filteredOverdue)}
            hint="Missed deadlines"
            icon={<RotateCcw className="size-5" strokeWidth={2} />}
            accent="rose"
            onClick={() => window.location.href = "/planner?status=overdue"}
          />
        </section>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-sm text-muted-foreground">
          Your personal study schedule. Mark tasks complete as you study.
        </p>
        <Button
          type="button" size="sm"
          variant={showGenerate ? "outline" : "default"}
          onClick={() => setShowGenerate((v) => !v)}
          disabled={!readySyllabi}
          className="gap-1.5"
        >
          {showGenerate ? "Cancel" : <><Plus className="size-3.5" />New plan</>}
        </Button>
      </div>

      {/* No syllabus prompt */}
      {!readySyllabi && !loadingPlans && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border/60 bg-card/40 py-14 text-center">
          <BookOpen className="size-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">No syllabus ready yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Upload and extract a syllabus first, then come back to generate a study plan.</p>
          </div>
        </div>
      )}

      {/* Generate form */}
      {showGenerate && readySyllabi && (
        <div className="overflow-hidden rounded-card border border-primary/20 bg-card shadow-sm shadow-primary/5 animate-[fade-in-up_0.2s_ease-out]">
          <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
            <div className="flex size-9 items-center justify-center rounded-card-sm bg-primary/15 border border-primary/20">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-heading-3 font-semibold">Generate study plan</h2>
              <p className="text-caption text-muted-foreground">Tasks spread from tomorrow to the day before your exam.</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="plan-title" className="text-sm font-semibold">Plan title</Label>
                <Input id="plan-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm prep" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exam-date" className="text-sm font-semibold">Exam date</Label>
                <div className="relative">
                  <Input id="exam-date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required className="h-10 pr-10 [color-scheme:dark]" />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="daily-hours" className="text-sm font-semibold">Daily hours</Label>
                <Input id="daily-hours" type="number" min={0.5} max={16} step={0.5} value={dailyStudyHours} onChange={(e) => setDailyStudyHours(e.target.value)} required className="h-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Syllabi to include</Label>
              <div className="flex flex-wrap gap-2">
                {syllabi.map((s) => {
                  const checked = selectedSyllabusIds.includes(s.syllabusId);
                  return (
                    <button key={s.syllabusId} type="button"
                      onClick={() => setSelectedSyllabusIds((p) => checked ? p.filter((id) => id !== s.syllabusId) : [...p, s.syllabusId])}
                      className={cn("rounded-card-sm border px-3 py-1.5 text-sm transition-all",
                        checked ? "border-primary/50 bg-primary/12 text-primary font-medium" : "border-border/60 hover:border-primary/30 hover:bg-white/4"
                      )}>
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {subjects.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Weak subjects <span className="font-normal text-muted-foreground">(gets extra tasks)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => {
                    const checked = weakSubjectIds.includes(sub.subjectId);
                    return (
                      <button key={sub.subjectId} type="button"
                        onClick={() => setWeakSubjectIds((p) => checked ? p.filter((id) => id !== sub.subjectId) : [...p, sub.subjectId])}
                        className={cn("rounded-card-sm border px-3 py-1.5 text-sm transition-all",
                          checked ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-border/60 hover:border-amber-500/30 hover:bg-white/4"
                        )}>
                        <Flame className="mr-1.5 inline size-3 text-amber-500" aria-hidden />
                        {sub.subjectName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={generating || selectedSyllabusIds.length === 0} className="h-10 gap-2">
                {generating ? <><Loader2 className="size-4 animate-spin" />Generating…</> : <><Sparkles className="size-4" />Generate plan</>}
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={() => setShowGenerate(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Main layout: sidebar + timeline */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">

        {/* ── Plan selector sidebar ── */}
        <aside className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-card border border-border/60 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold">Study plans</p>
              <span className="rounded-chip border border-border/50 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {plans.length}
              </span>
            </div>
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {loadingPlans ? (
                <div className="space-y-1.5 p-1">
                  {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-card-sm" />)}
                </div>
              ) : plans.length === 0 ? (
                <p className="px-3 py-4 text-caption text-muted-foreground">No plans yet. Generate one above.</p>
              ) : plans.map((plan) => (
                <PlanItem
                  key={plan.planId}
                  plan={plan}
                  active={selectedPlanId === plan.planId}
                  deleting={deletingPlanId === plan.planId}
                  onClick={() => setSelectedPlanId(plan.planId)}
                  onDelete={() => handleDeletePlan(plan.planId)}
                />
              ))}
            </div>
          </div>

          {/* Plan stats card */}
          {planDetail && (
            <div className="rounded-card border border-border/60 bg-card p-4 space-y-4 animate-[fade-in-up_0.25s_ease-out]">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <p className="text-sm font-semibold truncate">{planDetail.title}</p>
              </div>

              {/* Progress ring (CSS only) */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex size-16 items-center justify-center">
                  {/* Track */}
                  <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-border/40" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      strokeDasharray={`${(progress / 100) * 94.25} 94.25`}
                      strokeLinecap="round"
                      className={progress === 100 ? "text-emerald-500" : "text-primary"}
                      style={{ transition: "stroke-dasharray 0.7s ease" }}
                    />
                  </svg>
                  <span className={cn("text-sm font-bold tabular-nums", progress === 100 ? "text-emerald-500" : "text-primary")}>
                    {progress}%
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Done</span>
                    <span className="font-semibold">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Left</span>
                    <span className="font-semibold">{remainingTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Days to exam</span>
                    <span className={cn("font-semibold", daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-amber-500" : "text-foreground")}>
                      {daysLeft}d
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[10px] text-muted-foreground border-t border-border/40 pt-3">
                <div className="flex justify-between">
                  <span>Exam date</span>
                  <span className="font-medium text-foreground">
                    {new Date(planDetail.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Daily target</span>
                  <span className="font-medium text-foreground">{planDetail.dailyStudyHours}h/day</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Timeline ── */}
        <div className="relative flex flex-col rounded-card border border-border/60 bg-card overflow-hidden min-h-[32rem]">

          {/* Timeline header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-card-sm bg-primary/15 border border-primary/20">
                <CalendarDays className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Study Timeline</p>
                {planDetail && (
                  <p className="text-caption text-muted-foreground">
                    {sortedDateKeys.length} study days · {totalTasks} tasks
                  </p>
                )}
              </div>
            </div>

            {/* Scroll nav */}
            {sortedDateKeys.length > 0 && (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => scrollTimeline("prev")} aria-label="Scroll up"
                  className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-primary">
                  <ChevronLeft className="size-3.5" />
                </button>
                <button type="button" onClick={() => scrollTimeline("next")} aria-label="Scroll down"
                  className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-all hover:border-primary/30 hover:text-primary">
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Timeline body */}
          <div ref={timelineRef} className="flex-1 overflow-y-auto">
            {loadingDetail ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-card" />)}
              </div>
            ) : !selectedPlanId || !planDetail ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <CalendarDays className="size-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">Select or generate a plan to see your timeline</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Target className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No tasks found. Ensure your syllabus has pending topics.</p>
              </div>
            ) : (
              <div className="relative p-4">
                {/* Vertical timeline spine */}
                <div className="absolute left-[2.125rem] top-4 bottom-4 w-px bg-gradient-to-b from-primary/40 via-border/40 to-transparent pointer-events-none" aria-hidden />

                <div className="space-y-4">
                  {sortedDateKeys.map((key) => {
                    const isToday = key === todayKey;
                    return (
                      <div
                        key={key}
                        id={isToday ? "timeline-today" : undefined}
                        className="relative pl-12"
                      >
                        {/* Spine dot */}
                        <div className={cn(
                          "absolute left-[1.625rem] top-5 size-2.5 rounded-full border-2 border-background transition-all",
                          isToday
                            ? "bg-primary border-primary shadow-[0_0_8px] shadow-primary/60"
                            : tasksByDate[key]?.every((t) => t.status === "completed")
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-border/60 border-border/40",
                        )} aria-hidden />

                        <DayCard
                          dateKey={key}
                          tasks={tasksByDate[key]!}
                          subjects={subjects}
                          actingTaskId={actingTaskId}
                          justCompletedId={justCompletedId}
                          onComplete={handleComplete}
                          onUndo={handleUndo}
                          isToday={isToday}
                        />
                      </div>
                    );
                  })}

                  {/* End of timeline */}
                  {planDetail && (
                    <div className="relative pl-12">
                      <div className="absolute left-[1.625rem] top-3 size-2.5 rounded-full border-2 bg-amber-500 border-amber-500 shadow-[0_0_8px] shadow-amber-500/60" aria-hidden />
                      <div className="flex items-center gap-2 rounded-card border border-amber-500/20 bg-amber-500/8 px-4 py-3">
                        <Trophy className="size-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-500">Exam Day</p>
                          <p className="text-caption text-muted-foreground">
                            {new Date(planDetail.examDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      {showQuiz && quizTaskId && (
        <QuizModal
          taskId={quizTaskId}
          taskTitle={quizTaskTitle}
          onComplete={handleQuizComplete}
          onCancel={handleQuizCancel}
        />
      )}
    </div>
  );
}
