"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trophy,
  AlertCircle,
  TrendingUp,
  Timer,
  Award,
  Zap,
  ListTodo,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskCompleteBurst } from "@/components/motion/task-complete-burst";
import { QuizModal } from "@/components/quiz/quiz-modal";
import { CreatePlanWizard } from "@/components/planner/create-plan-wizard";
import { StatCard } from "@/components/shared/stat-card";
import { FilterBadge } from "@/components/shared/filter-badge";
import { getPlannerFilter, filterTasksByStatus } from "@/lib/filter-utils";
import { cn } from "@/lib/utils";
import type { PlannerTask, StudyPlanDetail, StudyPlanListItem } from "@/types/study-plan";
import type { SubjectItem, SyllabusItem } from "@/types/syllabus";

// ─── HELPERS ────────────────────────────────────────────────────

async function readApiError(r: Response) {
  try {
    const b = await r.json();
    return typeof b.error === "string" ? b.error : "Request failed";
  } catch {
    return "Request failed";
  }
}

function dateKey(iso: string) {
  return new Date(iso).toISOString().split("T")[0]!;
}

function formatDayLabel(key: string) {
  const d = new Date(`${key}T12:00:00`);
  const today = dateKey(new Date().toISOString());
  const tomorrow = dateKey(new Date(Date.now() + 86400000).toISOString());
  if (key === today) return { top: "Today", sub: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) };
  if (key === tomorrow) return { top: "Tomorrow", sub: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) };
  return {
    top: d.toLocaleDateString("en-US", { weekday: "short" }),
    sub: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function isPast(key: string) {
  return key < dateKey(new Date().toISOString());
}

function isToday(key: string) {
  return key === dateKey(new Date().toISOString());
}

function groupTasksByDate(tasks: PlannerTask[]) {
  const g: Record<string, PlannerTask[]> = {};
  for (const t of tasks) {
    (g[dateKey(t.dueDate)] ??= []).push(t);
  }
  return g;
}

// ─── STYLE CONFIGS ──────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high: { bg: "bg-rose-500/15", text: "text-rose-500", border: "border-rose-500/30", dot: "bg-rose-500" },
  medium: { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30", dot: "bg-amber-500" },
  low: { bg: "bg-emerald-500/15", text: "text-emerald-500", border: "border-emerald-500/30", dot: "bg-emerald-500" },
} as const;

const SUBJECT_COLORS = [
  { bg: "bg-violet-500/12", text: "text-violet-500", border: "border-violet-500/25" },
  { bg: "bg-sky-500/12", text: "text-sky-500", border: "border-sky-500/25" },
  { bg: "bg-emerald-500/12", text: "text-emerald-500", border: "border-emerald-500/25" },
  { bg: "bg-amber-500/12", text: "text-amber-500", border: "border-amber-500/25" },
  { bg: "bg-rose-500/12", text: "text-rose-500", border: "border-rose-500/25" },
  { bg: "bg-cyan-500/12", text: "text-cyan-500", border: "border-cyan-500/25" },
] as const;

// ─── SUB-COMPONENTS ─────────────────────────────────────────────

/** Task Card Component - Redesigned for clarity */
function TaskCard({
  task,
  subjectName,
  subjectColor,
  onComplete,
  busy,
  justCompleted,
}: {
  task: PlannerTask;
  subjectName: string | null;
  subjectColor: typeof SUBJECT_COLORS[number];
  onComplete: () => void;
  busy: boolean;
  justCompleted: boolean;
}) {
  const done = task.status === "completed";
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-300",
        done
          ? "border-emerald-500/20 bg-emerald-500/5 opacity-70"
          : "border-border/60 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5",
      )}
    >
      {/* Completion burst effect */}
      <div className="absolute inset-0 pointer-events-none">
        <TaskCompleteBurst show={justCompleted} />
      </div>

      {/* Task Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className={cn(
          "text-base font-semibold leading-tight transition-all",
          done && "line-through text-muted-foreground",
        )}>
          {task.taskTitle}
        </h4>

        {/* Completion status indicator */}
        {done && (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-500">
            <CheckCircle2 className="size-3.5" />
            <span>Complete</span>
          </div>
        )}
      </div>

      {/* Task Metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Subject Badge */}
        {subjectName && (
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            subjectColor.bg, subjectColor.text, subjectColor.border,
          )}>
            <BookOpen className="size-3" />
            {subjectName}
          </span>
        )}

        {/* Priority Badge */}
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          priority.bg, priority.text, priority.border,
        )}>
          <Flame className="size-3" />
          {task.priority}
        </span>

        {/* Estimated Duration */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="size-3" />
          ~1h
        </span>
      </div>

      {/* Action Button */}
      {!done && (
        <Button
          type="button"
          onClick={onComplete}
          disabled={busy}
          size="sm"
          className="w-full gap-2 font-medium"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Zap className="size-4" />
              <span>Start Verification</span>
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}

/** Day Block Component - Timeline style */
function DayBlock({
  dateKey: key,
  tasks,
  subjects,
  actingTaskId,
  justCompletedId,
  onComplete,
  isToday: today,
}: {
  dateKey: string;
  tasks: PlannerTask[];
  subjects: SubjectItem[];
  actingTaskId: string | null;
  justCompletedId: string | null;
  onComplete: (id: string) => void;
  isToday: boolean;
}) {
  const subjectMap = Object.fromEntries(
    subjects.map((s, i) => [s.subjectId, { name: s.subjectName, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length]! }]),
  );

  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total && total > 0;
  const { top, sub } = formatDayLabel(key);
  const past = isPast(key);

  // Sort: incomplete first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    const po = { high: 0, medium: 1, low: 2 };
    return (po[a.priority as keyof typeof po] ?? 2) - (po[b.priority as keyof typeof po] ?? 2);
  });

  return (
    <article
      className={cn(
        "relative rounded-2xl border p-6 transition-all duration-300",
        today && !allDone
          ? "border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card shadow-xl shadow-primary/20 ring-2 ring-primary/20"
          : allDone
          ? "border-emerald-500/30 bg-emerald-500/5"
          : past
          ? "border-border/40 bg-card/50 opacity-60"
          : "border-border/60 bg-card",
      )}
    >
      {/* Today accent glow */}
      {today && !allDone && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-50 blur-xl" />
      )}

      {/* Day Header */}
      <div className="relative flex items-start justify-between gap-4 mb-5 pb-5 border-b border-border/50">
        <div className="flex items-center gap-4">
          {/* Date Badge */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border p-3 min-w-[4.5rem]",
              today
                ? "border-primary/30 bg-primary/15 text-primary"
                : allDone
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-border/50 bg-muted/30 text-foreground",
            )}
          >
            <span className="text-xs font-bold uppercase tracking-wide">{top}</span>
            <span className="text-sm font-semibold mt-1">{sub.split(",")[1]?.trim() ?? sub.split(" ")[1]}</span>
          </div>

          {/* Day Info */}
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {allDone ? (
                <span className="flex items-center gap-2 text-emerald-500">
                  <Trophy className="size-5" />
                  All Complete!
                </span>
              ) : today ? (
                <span className="flex items-center gap-2 text-primary">
                  <Target className="size-5" />
                  Today's Study Mission
                </span>
              ) : (
                sub
              )}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                {completed}/{total} tasks
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="size-4" />
                ~{total}h study
              </span>
            </div>
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "text-2xl font-bold tabular-nums",
              allDone ? "text-emerald-500" : today ? "text-primary" : "text-foreground",
            )}
          >
            {percentage}%
          </span>
          {/* Progress bar */}
          <div className="h-2 w-24 overflow-hidden rounded-full bg-border/30">
            <motion.div
              className={cn(
                "h-full rounded-full",
                allDone ? "bg-emerald-500" : "bg-primary",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task) => {
            const sub = subjectMap[task.subjectId ?? ""];
            return (
              <TaskCard
                key={task.taskId}
                task={task}
                subjectName={sub?.name ?? null}
                subjectColor={sub?.color ?? SUBJECT_COLORS[0]!}
                onComplete={() => onComplete(task.taskId)}
                busy={actingTaskId === task.taskId}
                justCompleted={justCompletedId === task.taskId}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </article>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export function StudyPlanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status");

  // Get active filter from URL
  const activeFilter = getPlannerFilter(searchParams);

  // State
  const [plans, setPlans] = useState<StudyPlanListItem[]>([]);
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planDetail, setPlanDetail] = useState<StudyPlanDetail | null>(null);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actingTaskId, setActingTaskId] = useState<string | null>(null);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizTaskId, setQuizTaskId] = useState<string | null>(null);
  const [quizTaskTitle, setQuizTaskTitle] = useState<string>("");

  const timelineRef = useRef<HTMLDivElement>(null);

  // Data loading callbacks
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

  // Load initial data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planList, syllabusRes, subjectRes] = await Promise.all([
          loadPlans(),
          fetch("/api/syllabus"),
          fetch("/api/subjects"),
        ]);
        if (cancelled) return;
        setPlans(planList);
        if (syllabusRes.ok) {
          const items = ((await syllabusRes.json()).data.syllabi as SyllabusItem[]).filter(
            (s) => s.extractionStatus === "completed",
          );
          setSyllabi(items);
        }
        if (subjectRes.ok) setSubjects((await subjectRes.json()).data.subjects as SubjectItem[]);
        if (planList.length > 0) setSelectedPlanId((c) => c ?? planList[0]!.planId);
      } catch (err) {
        if (!cancelled)
          setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load planner" });
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPlans]);

  // Load plan detail when selection changes
  useEffect(() => {
    if (!selectedPlanId) {
      setPlanDetail(null);
      setTasks([]);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    loadPlanDetail(selectedPlanId)
      .then(({ plan, tasks: t }) => {
        if (cancelled) return;
        setPlanDetail(plan);
        setTasks(t);
        // Auto-scroll to today
        setTimeout(() => {
          const el = document.getElementById("day-today");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      })
      .catch((err) => {
        if (!cancelled)
          setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load plan" });
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPlanId, loadPlanDetail]);

  // Task completion handler
  async function handleComplete(taskId: string) {
    const task = tasks.find((t) => t.taskId === taskId);
    if (task) {
      setQuizTaskId(taskId);
      setQuizTaskTitle(task.taskTitle);
      setShowQuiz(true);
    }
  }

  function handleQuizComplete() {
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

  // Plan generation handler
  async function handleGenerate(data: {
    title: string;
    examDate: string;
    dailyStudyHours: number;
    syllabusIds: string[];
    weakSubjects: string[];
  }) {
    setGenerating(true);
    setMessage(null);
    try {
      const r = await fetch("/api/study-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          examDate: new Date(data.examDate).toISOString(),
          dailyStudyHours: data.dailyStudyHours,
          weakSubjects: data.weakSubjects,
          syllabusIds: data.syllabusIds,
        }),
      });
      if (!r.ok) throw new Error(await readApiError(r));
      const body = await r.json();
      const planId = body.data.plan.planId as string;
      setShowGenerate(false);
      const list = await loadPlans();
      setPlans(list);
      setSelectedPlanId(planId);
      setMessage({ type: "success", text: `✓ Plan created — ${body.data.plan.totalTasks} tasks scheduled` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to generate plan" });
    } finally {
      setGenerating(false);
    }
  }

  // Apply filter to tasks
  const filteredTasks = useMemo(() => filterTasksByStatus(tasks, activeFilter), [tasks, activeFilter]);

  // Computed values
  const tasksByDate = groupTasksByDate(filteredTasks);
  const sortedDateKeys = Object.keys(tasksByDate).sort();
  const todayKey = dateKey(new Date().toISOString());
  const readySyllabi = syllabi.length > 0;

  const totalTasks = planDetail?.totalTasks ?? 0;
  const completedTasks = planDetail?.completedTasks ?? 0;
  const progress = planDetail?.progress ?? 0;
  const daysLeft = planDetail
    ? Math.max(0, Math.ceil((new Date(planDetail.examDate).getTime() - Date.now()) / 86400000))
    : 0;
  const remainingTasks = totalTasks - completedTasks;

  // Today's tasks
  const todayTasks = tasksByDate[todayKey] ?? [];
  const todayPending = todayTasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const todayFirstTask = todayPending[0];

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => t.status === "missed");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 xl:pr-[25rem] space-y-8">
      {/* Toast Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-xl backdrop-blur-sm",
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {message.type === "success" ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Planner Hero */}
      <section className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Study Planner</h1>
          <p className="mt-2 text-lg text-muted-foreground">Your personalized roadmap to exam success.</p>
        </div>
        <Button
          type="button"
          onClick={() => setShowGenerate(!showGenerate)}
          disabled={!readySyllabi}
          size="lg"
          className="gap-2 font-semibold"
        >
          <Plus className="size-5" />
          Create Plan
        </Button>
      </section>

      {/* No syllabus state */}
      {!readySyllabi && !loadingPlans && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
          <BookOpen className="size-16 text-muted-foreground/40" />
          <div>
            <h3 className="text-xl font-semibold">No Syllabus Found</h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Upload and extract a syllabus first to start generating personalized study plans.
            </p>
          </div>
        </div>
      )}

      {/* Generate Form Wizard */}
      <AnimatePresence>
        {showGenerate && readySyllabi && (
          <CreatePlanWizard
            syllabi={syllabi}
            subjects={subjects}
            onSubmit={async (data) => {
              await handleGenerate(data);
            }}
            onCancel={() => setShowGenerate(false)}
            generating={generating}
          />
        )}
      </AnimatePresence>

      {/* SECTION 2: Active Plan Overview */}
      {planDetail && !showGenerate && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-6">
            {/* Plan Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                  <Target className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{planDetail.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Exam: {new Date(planDetail.examDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Days Left</span>
                  </div>
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      daysLeft <= 7 ? "text-destructive" : daysLeft <= 14 ? "text-amber-500" : "text-foreground",
                    )}
                  >
                    {daysLeft}
                  </span>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progress</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-500">{progress}%</span>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topics Left</span>
                  </div>
                  <span className="text-2xl font-bold">{remainingTasks}</span>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex size-32 items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-border/30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(progress / 100) * 264} 264`}
                    strokeLinecap="round"
                    className={progress === 100 ? "text-emerald-500" : "text-primary"}
                    style={{ transition: "stroke-dasharray 0.8s ease" }}
                  />
                </svg>
                <div className="text-center">
                  <span className={cn("text-3xl font-bold", progress === 100 ? "text-emerald-500" : "text-primary")}>
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="text-center text-sm">
                <p className="font-semibold">{completedTasks}/{totalTasks}</p>
                <p className="text-muted-foreground">Tasks Complete</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Task Stats - Clickable Filters */}
      {planDetail && !showGenerate && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          {/* FilterBadge - Show active filter */}
          {activeFilter && (
            <FilterBadge
              filterType="status"
              filterValue={activeFilter}
              onClear={() => router.push("/planner")}
            />
          )}

          {/* StatCards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total tasks"
              value={String(tasks.length)}
              hint="All scheduled"
              icon={ListTodo}
              accent="primary"
              // No onClick = not clickable
            />
            <StatCard
              label="Completed"
              value={String(tasks.filter((t) => t.status === "completed").length)}
              hint="Tasks done"
              icon={CheckCircle2}
              accent="emerald"
              onClick={() => router.push("/planner?status=completed")}
            />
            <StatCard
              label="Pending"
              value={String(tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length)}
              hint="In progress"
              icon={Clock}
              accent="amber"
              onClick={() => router.push("/planner?status=pending")}
            />
            <StatCard
              label="Overdue"
              value={String(tasks.filter((t) => t.status === "missed").length)}
              hint="Needs attention"
              icon={AlertCircle}
              accent="rose"
              onClick={() => router.push("/planner?status=overdue")}
            />
          </div>
        </motion.section>
      )}

      {/* SECTION 3: Today's Study Mission */}
      {planDetail && todayFirstTask && !showGenerate && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-2xl shadow-primary/20"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/20 border-2 border-primary/30">
              <Zap className="size-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Today's Study Mission</h2>
              <p className="text-muted-foreground">Start here — your most important task today</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Today's Subject */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</span>
              </div>
              <p className="text-lg font-semibold">
                {subjects.find((s) => s.subjectId === todayFirstTask.subjectId)?.subjectName ?? "Unknown"}
              </p>
            </div>

            {/* Today's Topic */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic</span>
              </div>
              <p className="text-lg font-semibold line-clamp-2">{todayFirstTask.taskTitle}</p>
            </div>

            {/* Estimated Time */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</span>
              </div>
              <p className="text-lg font-semibold">~1 hour</p>
            </div>

            {/* Priority */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</span>
              </div>
              <p className="text-lg font-semibold capitalize">{todayFirstTask.priority}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-5">
            <Button
              type="button"
              onClick={() => handleComplete(todayFirstTask.taskId)}
              disabled={actingTaskId === todayFirstTask.taskId}
              size="lg"
              className="w-full gap-2 text-lg font-bold"
            >
              {actingTaskId === todayFirstTask.taskId ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="size-5" />
                  Start Knowledge Verification
                </>
              )}
            </Button>
          </div>
        </motion.section>
      )}

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && !showGenerate && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/15 border border-destructive/30">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-destructive">Overdue Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  {overdueTasks.length} {overdueTasks.length === 1 ? "task" : "tasks"} missed — recovery available
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => (window.location.href = "/recovery")}
            >
              View Recovery
            </Button>
          </div>
        </motion.section>
      )}

      {/* SECTION 4: Timeline Experience */}
      {planDetail && !showGenerate && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Study Timeline</h2>
              <p className="text-muted-foreground">Your day-by-day study journey</p>
            </div>
          </div>

          {loadingDetail ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : sortedDateKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
              <Target className="size-16 text-muted-foreground/40" />
              <div>
                <h3 className="text-xl font-semibold">
                  {activeFilter ? `No ${activeFilter} tasks` : "No Tasks Yet"}
                </h3>
                <p className="mt-2 text-muted-foreground max-w-md">
                  {activeFilter 
                    ? "Try a different filter or clear to see all tasks"
                    : "Your study timeline will appear here once tasks are generated"}
                </p>
                {activeFilter && (
                  <Button onClick={() => router.push("/planner")} className="mt-4">
                    Show all tasks
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div ref={timelineRef} className="space-y-6">
              <AnimatePresence mode="popLayout">
                {sortedDateKeys.map((key, index) => {
                  const today = isToday(key);
                  return (
                    <motion.div
                      key={key}
                      id={today ? "day-today" : undefined}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <DayBlock
                        dateKey={key}
                        tasks={tasksByDate[key]!}
                        subjects={subjects}
                        actingTaskId={actingTaskId}
                        justCompletedId={justCompletedId}
                        onComplete={handleComplete}
                        isToday={today}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Exam Day Marker */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: sortedDateKeys.length * 0.05 + 0.2 }}
                className="flex items-center gap-4 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 shadow-lg shadow-amber-500/10"
              >
                <div className="flex size-16 items-center justify-center rounded-xl bg-amber-500/20 border-2 border-amber-500/40">
                  <Trophy className="size-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-500">Exam Day</h3>
                  <p className="text-lg text-muted-foreground">
                    {new Date(planDetail.examDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </section>
      )}

      {/* No plan selected state */}
      {!planDetail && !loadingPlans && !showGenerate && plans.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
          <CalendarDays className="size-16 text-muted-foreground/40" />
          <div>
            <h3 className="text-xl font-semibold">Select a Study Plan</h3>
            <p className="mt-2 text-muted-foreground">Choose a plan from your list to view your study timeline</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loadingPlans && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="size-16 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your plans...</p>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && quizTaskId && (
        <QuizModal taskId={quizTaskId} taskTitle={quizTaskTitle} onComplete={handleQuizComplete} onCancel={handleQuizCancel} />
      )}

      {/* Plan Selector - Floating Sidebar */}
      {plans.length > 0 && !showGenerate && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-6 top-24 w-80 max-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl hidden xl:flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/30">
            <p className="font-semibold">My Plans</p>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">{plans.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {plans.map((plan) => {
              const active = selectedPlanId === plan.planId;
              const examIn = Math.ceil((new Date(plan.examDate).getTime() - Date.now()) / 86400000);
              return (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.planId)}
                  className={cn(
                    "w-full text-left rounded-xl border p-3 transition-all",
                    active
                      ? "border-primary/40 bg-primary/10 shadow-md shadow-primary/10"
                      : "border-border/40 hover:border-primary/30 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className={cn("font-semibold truncate", active && "text-primary")}>{plan.title}</p>
                    {active && <Award className="size-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {examIn > 0 ? `${examIn}d to exam` : "Exam passed"} · {plan.completedTasks}/{plan.totalTasks} done
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/30">
                    <motion.div
                      className={cn("h-full rounded-full", plan.progress === 100 ? "bg-emerald-500" : "bg-primary")}
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
