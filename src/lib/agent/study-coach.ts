import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Progress from "@/models/Progress";
import Revision from "@/models/Revision";
import RecoveryPlan from "@/models/RecoveryPlan";

export async function getStudyCoachSummary(userId: string) {
  await connectDB();

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Overdue tasks: past due date and not completed
  const overdueTasks = await Task.find({
    userId,
    status: { $in: ["pending", "in_progress", "missed"] },
    dueDate: { $lt: todayStart },
  }).lean();

  // Today's revisions
  const todayRevisions = await Revision.find({
    userId,
    scheduledDate: { $gte: todayStart, $lt: todayEnd },
    status: "scheduled",
  }).lean();

  // Global progress record (no subjectId)
  const progress = await Progress.findOne({ userId, subjectId: { $exists: false } }).lean();

  // Latest recovery plan (generated or applied)
  const recoveryPlan = await RecoveryPlan.findOne({ userId })
    .sort({ createdAt: -1 })
    .lean();

  // Compute readiness score from actual data
  const allTasks = await Task.find({ userId }).lean();
  const totalTasks     = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;
  const completionPct  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak         = progress?.streakDays ?? 0;
  const missed         = overdueTasks.length;

  const readinessScore = Math.max(
    0,
    Math.min(100, Math.round(completionPct * 0.6 + Math.min(streak * 2, 20) - Math.min(missed * 3, 20))),
  );

  // Derive recommendations
  let priority       = "Review your study plan";
  let risk           = "All tasks on track";
  let recommendation = "Keep up the good work!";
  let motivation     = "You are doing great!";

  if (overdueTasks.length > 0) {
    risk           = `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} detected`;
    recommendation = "Complete your overdue tasks first";
  }

  if (readinessScore >= 80) {
    motivation = "You are ahead of schedule. Keep it up!";
  } else if (readinessScore >= 60) {
    motivation = "Good progress! A little more effort will get you there.";
  } else {
    motivation = "Stay focused! Consistent effort leads to success.";
  }

  return {
    readinessScore,
    priority,
    risk,
    recommendation,
    motivation,
    revisionAlert: todayRevisions.length > 0
      ? `${todayRevisions.length} revision${todayRevisions.length > 1 ? "s" : ""} due today`
      : null,
    recoveryAlert: recoveryPlan ? "Recovery plan available" : null,
  };
}
