import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Progress from "@/models/Progress";
import Revision from "@/models/Revision";
import RecoveryPlan from "@/models/RecoveryPlan";

export async function getStudyCoachSummary(userId: string) {
  await connectDB();

  // Get overdue tasks
  const now = new Date();
  const overdueTasks = await Task.find({
    userId,
    completed: false,
    dueDate: { $lt: now },
  }).lean();

  // Get today's revisions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayRevisions = await Revision.find({
    userId,
    scheduledDate: { $gte: todayStart, $lte: todayEnd },
    completed: false,
  }).lean();

  // Get progress
  const progress = await Progress.findOne({ userId }).lean() as {
    completionPercentage?: number;
    currentStreak?: number;
    weakSubjects?: string[];
    readinessScore?: number;
  } | null;

  // Get active recovery plan
  const recoveryPlan = await RecoveryPlan.findOne({
    userId,
    status: "active",
  }).lean();

  // Calculate readiness score
  const completionPct = progress?.completionPercentage ?? 0;
  const streak = progress?.currentStreak ?? 0;
  const weakSubjects = progress?.weakSubjects ?? [];
  const readinessScore = progress?.readinessScore ?? Math.round(completionPct * 0.8 + Math.min(streak * 2, 20));

  // Generate recommendation
  let priority = "Review your study plan";
  let risk = "All tasks on track";
  let recommendation = "Keep up the good work!";
  let motivation = "You are doing great!";

  if (overdueTasks.length > 0) {
    risk = `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""} detected`;
    recommendation = "Complete your overdue tasks first";
  }

  if (weakSubjects.length > 0) {
    priority = weakSubjects[0] as string;
    recommendation = `Focus on ${weakSubjects[0]} today`;
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
    recoveryAlert: recoveryPlan
      ? "Recovery plan available"
      : null,
  };
}