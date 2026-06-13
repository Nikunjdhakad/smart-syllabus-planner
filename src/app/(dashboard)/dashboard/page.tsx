import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  LineChart,
  ListTodo,
  RotateCcw,
  Target,
  ShieldAlert,
} from "lucide-react";
import { StudyCoachCard } from "@/components/dashboard/study-coach-card";
import { RevisionOverview } from "@/components/dashboard/revision-overview";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { TodaysMission } from "@/components/dashboard/todays-mission";
import { QuizAnalyticsCard } from "@/components/dashboard/quiz-analytics-card";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { getProgressSummary } from "@/lib/progress/summary";
import { getRecoveryDashboardData } from "@/lib/recovery/dashboard";
import { getRevisionDashboardBuckets } from "@/lib/revisions/list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/shared/stat-card";
import { FeatureCard } from "@/components/shared/feature-card";
import User from "@/models/User";
import StudyPlan from "@/models/StudyPlan";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function getReadinessScore(completionPct: number, streak: number, missedCount: number): number {
  const base = completionPct * 0.6;
  const streakBonus = Math.min(streak * 2, 20);
  const missedPenalty = Math.min(missedCount * 3, 20);
  return Math.max(0, Math.min(100, Math.round(base + streakBonus - missedPenalty)));
}

function getReadinessLabel(score: number): { label: string; color: string; ring: string } {
  if (score >= 80) return { label: "Exam Ready", color: "text-emerald-500 dark:text-emerald-400", ring: "stroke-emerald-500" };
  if (score >= 60) return { label: "On Track", color: "text-primary", ring: "stroke-primary" };
  if (score >= 40) return { label: "Needs Focus", color: "text-amber-500 dark:text-amber-400", ring: "stroke-amber-500" };
  return { label: "Behind Schedule", color: "text-destructive", ring: "stroke-destructive" };
}

function getDaysUntilExam(examDate: Date | null | undefined): number | null {
  if (!examDate) return null;
  const diff = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── SVG Progress Ring ──────────────────────────────────────────
function ReadinessRing({ score, color }: { score: number; color: string }) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/30"
      />
      {/* Score ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={`dash-ring-animate ${color}`}
        style={{
          strokeDasharray: circumference,
          "--ring-circumference": circumference,
          "--ring-offset": offset,
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        } as React.CSSProperties}
      />
      {/* Score text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-foreground text-2xl font-bold"
        style={{ fontSize: "1.5rem" }}
      >
        {score}
      </text>
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  await connectDB();

  const [user, summary, revisions, recovery, activePlan] = await Promise.all([
    session ? User.findOne({ userId: session.userId }).lean() : null,
    session ? getProgressSummary(session.userId) : null,
    session ? getRevisionDashboardBuckets(session.userId) : null,
    session ? getRecoveryDashboardData(session.userId) : null,
    session ? StudyPlan.findOne({ userId: session.userId, status: "active" }).lean() : null,
  ]);

  const firstName = user?.name?.split(" ")[0] ?? "Student";
  const metrics = summary?.metrics;
  const hasTasks = (metrics?.totalTasks ?? 0) > 0;
  const readinessScore = getReadinessScore(
    metrics?.completionPercentage ?? 0,
    metrics?.currentStreak ?? 0,
    recovery?.overdueCount ?? 0,
  );
  const { label: readinessLabel, color: readinessColor, ring: ringColor } = getReadinessLabel(readinessScore);
  const daysUntilExam = getDaysUntilExam(activePlan?.examDate);
  const greeting = getGreeting();

  return (
    <DashboardShell
      title={`${greeting}, ${firstName}`}
      description={hasTasks ? "Here's your academic command center." : "Generate a study plan to start tracking progress."}
    >
      <div className="dash-stagger space-y-8">

        {/* ═══════════════════════════════════════════════════════════
           SECTION 1: Personal Command Header
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasTasks
                  ? "Here's your mission for today."
                  : "Generate a study plan to start tracking progress."}
              </p>
            </div>
            {daysUntilExam !== null && (
              <div className="flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/8 px-4 py-2">
                <span
                  className="size-2 rounded-full bg-amber-500"
                  style={{ animation: "dash-pulse-dot 2s ease-in-out infinite" }}
                />
                <span className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                  {daysUntilExam} day{daysUntilExam !== 1 ? "s" : ""} until exam
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 2: Readiness Hero Card (DOMINANT ELEMENT)
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 sm:p-8">
            {/* Glow background */}
            <div className="dash-hero-glow pointer-events-none absolute inset-0" aria-hidden />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Left — Score ring + label */}
              <div className="flex items-center gap-5">
                <div className="dash-score-animate">
                  <ReadinessRing score={readinessScore} color={ringColor} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    Readiness Score
                  </p>
                  <p className={`mt-1 text-lg font-bold ${readinessColor}`}>
                    {readinessLabel}
                  </p>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-border/30">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden h-16 w-px bg-border/40 sm:block" />

              {/* Right — Quick metrics */}
              <div className="grid flex-1 grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {metrics?.completedTasks ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">tasks done</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                    {metrics?.remainingTasks ?? 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">to finish</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-primary">
                    {hasTasks ? `${metrics!.completionPercentage}%` : "0%"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {hasTasks ? `${metrics!.completedTasks} of ${metrics!.totalTasks}` : "No tasks"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 3: Today's Mission
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <TodaysMission
            nextTask={summary?.upcomingTasks?.[0] ?? null}
            dueRevisions={revisions?.upcoming?.length ?? 0}
            overdueCount={recovery?.overdueCount ?? 0}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 4 + 5: AI Study Coach + Upcoming Work (side-by-side)
           ═══════════════════════════════════════════════════════════ */}
        <section className="grid gap-6 lg:grid-cols-5">
          {/* AI Study Coach — 3/5 width on desktop */}
          <div className="lg:col-span-3">
            <StudyCoachCard />
          </div>

          {/* Upcoming Tasks — 2/5 width on desktop */}
          <div className="lg:col-span-2">
            <UpcomingTasks tasks={summary?.upcomingTasks ?? []} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 6: Smart Insights (compact stat strip)
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Smart Insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Study streak"
              value={`${metrics?.currentStreak ?? 0}d`}
              hint={(metrics?.studyDaysCompleted ?? 0) > 0 ? `${metrics!.studyDaysCompleted} days studied` : "Complete a task to start"}
              icon={<Flame className="size-5" strokeWidth={2} />}
              accent="amber"
            />
            <StatCard
              label="Completed tasks"
              value={String(metrics?.completedTasks ?? 0)}
              hint="Tasks marked done"
              icon={<CheckCircle2 className="size-5" strokeWidth={2} />}
              accent="emerald"
              href={ROUTES.planner + "?status=completed"}
            />
            <StatCard
              label="Pending"
              value={String(metrics?.remainingTasks ?? 0)}
              hint="Still to complete"
              icon={<ListTodo className="size-5" strokeWidth={2} />}
              accent="rose"
              href={ROUTES.planner + "?status=pending"}
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 7: Revisions Overview
           ═══════════════════════════════════════════════════════════ */}
        {revisions && <RevisionOverview buckets={revisions} />}

        {/* ═══════════════════════════════════════════════════════════
           SECTION 8: Quiz Analytics (lower priority)
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <QuizAnalyticsCard />
        </section>

        {/* ═══════════════════════════════════════════════════════════
           SECTION 9: Quick Access Modules
           ═══════════════════════════════════════════════════════════ */}
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Quick Access
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <FeatureCard href={ROUTES.syllabus} icon={BookOpen} title="Syllabus" description="Upload and manage subjects." accentIndex={0} />
            <FeatureCard href={ROUTES.planner} icon={CalendarDays} title="Planner" description="Study schedules and tasks." accentIndex={1} />
            <FeatureCard href={ROUTES.progress} icon={LineChart} title="Progress" description="Track completion analytics." accentIndex={2} />
            <FeatureCard href={ROUTES.revisions} icon={RotateCcw} title="Revisions" description="Spaced repetition system." accentIndex={3} />
            <FeatureCard href={ROUTES.recovery} icon={ShieldAlert} title="Recovery" description="Recover missed tasks." accentIndex={4} />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
