/**
 * Smart notification generation engine.
 * Analyses user data and creates contextual, non-redundant notifications.
 *
 * Deduplication strategy:
 *  - One notification per (userId, type) per calendar day, regardless of read state.
 *  - Previously read notifications are NOT recreated until the next calendar day.
 *  - Title/count changes within a day are ignored to prevent churn.
 */
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import Revision from "@/models/Revision";
import StudyPlan from "@/models/StudyPlan";
import Task from "@/models/Task";
import { ROUTES } from "@/lib/constants";
import type { NotificationType, NotificationPriority } from "@/types/notification";

interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  actionLink?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a notification only if no notification of the same type was created
 * for this user today (UTC day boundary), regardless of whether it was read.
 *
 * This prevents read notifications from being regenerated on page refresh.
 */
async function createIfNew(
  userId: string,
  payload: NotificationPayload,
): Promise<boolean> {
  // Dedup window: start of today UTC
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const existing = await Notification.findOne({
    userId,
    type: payload.type,
    createdAt: { $gte: todayStart },
    // No `read` filter — skip regardless of read state
  }).lean();

  if (existing) return false;

  await Notification.create({
    notificationId: crypto.randomUUID(),
    userId,
    ...payload,
    metadata: payload.metadata ?? {},
    actionLink: payload.actionLink ?? null,
  });
  return true;
}

export async function generateSmartNotifications(userId: string): Promise<number> {
  await connectDB();

  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [tasks, activePlan, revisions] = await Promise.all([
    Task.find({ userId }).lean(),
    StudyPlan.findOne({ userId, status: "active" }).lean(),
    Revision.find({ userId, status: "scheduled" }).lean(),
  ]);

  let created = 0;

  // ── Missed tasks alert ───────────────────────────────────────
  const missedTasks = tasks.filter((t) => t.status === "missed");
  if (missedTasks.length > 0) {
    const priority: NotificationPriority =
      missedTasks.length >= 10 ? "critical" : missedTasks.length >= 5 ? "high" : "medium";
    const ok = await createIfNew(userId, {
      title: `${missedTasks.length} missed task${missedTasks.length > 1 ? "s" : ""}`,
      message:
        missedTasks.length >= 5
          ? `You have ${missedTasks.length} missed tasks. Generate a recovery plan to get back on track.`
          : `You missed ${missedTasks.length} task${missedTasks.length > 1 ? "s" : ""}. Review your study planner.`,
      type: "missed_task",
      priority,
      actionLink: ROUTES.recovery,
      metadata: { count: missedTasks.length },
    });
    if (ok) created++;
  }

  // ── Today's study reminder ───────────────────────────────────
  const todayTasks = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= todayStart && due < todayEnd && t.status !== "completed";
  });
  if (todayTasks.length > 0) {
    const ok = await createIfNew(userId, {
      title: `${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today`,
      message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} scheduled for today. Keep your streak going!`,
      type: "study_reminder",
      priority: "medium",
      actionLink: ROUTES.planner,
      metadata: { count: todayTasks.length },
    });
    if (ok) created++;
  }

  // ── Exam deadline alert ──────────────────────────────────────
  if (activePlan?.examDate) {
    const examDate = new Date(activePlan.examDate);
    const daysLeft = Math.ceil((examDate.getTime() - now.getTime()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 14) {
      const priority: NotificationPriority =
        daysLeft <= 3 ? "critical" : daysLeft <= 7 ? "high" : "medium";
      const ok = await createIfNew(userId, {
        title: `Exam in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
        message: `Your exam for "${activePlan.title}" is ${daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}. Final review time!`,
        type: "deadline_alert",
        priority,
        actionLink: ROUTES.planner,
        metadata: { daysLeft, planId: activePlan.planId },
      });
      if (ok) created++;
    }
  }

  // ── Revisions due / overdue ──────────────────────────────────
  const overdueRevisions = revisions.filter(
    (r) => new Date(r.scheduledDate) < todayStart,
  );
  const dueTodayRevisions = revisions.filter((r) => {
    const d = new Date(r.scheduledDate);
    return d >= todayStart && d < todayEnd;
  });

  if (overdueRevisions.length > 0) {
    const ok = await createIfNew(userId, {
      title: `${overdueRevisions.length} overdue revision${overdueRevisions.length > 1 ? "s" : ""}`,
      message: `You have ${overdueRevisions.length} overdue revision session${overdueRevisions.length > 1 ? "s" : ""}. Spaced repetition works best when done on time.`,
      type: "revision_reminder",
      priority: "high",
      actionLink: ROUTES.revisions,
      metadata: { count: overdueRevisions.length },
    });
    if (ok) created++;
  } else if (dueTodayRevisions.length > 0) {
    const ok = await createIfNew(userId, {
      title: `${dueTodayRevisions.length} revision${dueTodayRevisions.length > 1 ? "s" : ""} due today`,
      message: `Time to review! You have ${dueTodayRevisions.length} revision session${dueTodayRevisions.length > 1 ? "s" : ""} scheduled for today.`,
      type: "revision_reminder",
      priority: "medium",
      actionLink: ROUTES.revisions,
      metadata: { count: dueTodayRevisions.length },
    });
    if (ok) created++;
  }

  // ── Exam readiness / low completion ─────────────────────────
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (totalTasks > 0 && completionPct < 30 && activePlan?.examDate) {
    const daysLeft = Math.ceil(
      (new Date(activePlan.examDate).getTime() - now.getTime()) / 86400000,
    );
    if (daysLeft > 0 && daysLeft <= 30) {
      const ok = await createIfNew(userId, {
        title: "Low exam readiness detected",
        message: `Only ${completionPct}% complete with ${daysLeft} days until your exam. Consider generating a recovery plan.`,
        type: "exam_readiness",
        priority: completionPct < 15 ? "critical" : "high",
        actionLink: ROUTES.recovery,
        metadata: { completionPct, daysLeft },
      });
      if (ok) created++;
    }
  }

  // ── Recovery needed ──────────────────────────────────────────
  if (missedTasks.length >= 5) {
    const ok = await createIfNew(userId, {
      title: "Recovery plan recommended",
      message: `With ${missedTasks.length} missed tasks, an AI recovery plan can reschedule them intelligently around your remaining time.`,
      type: "recovery_alert",
      priority: "high",
      actionLink: ROUTES.recovery,
      metadata: { missedCount: missedTasks.length },
    });
    if (ok) created++;
  }

  return created;
}
