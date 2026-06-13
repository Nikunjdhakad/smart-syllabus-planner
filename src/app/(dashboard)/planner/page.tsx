import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudyPlanner } from "@/components/planner/study-planner";

export const metadata: Metadata = { title: "Study Planner" };

export default function PlannerPage() {
  return (
    <DashboardShell
      title="Study Planner"
      description="Create and manage your study plans, schedules, and tasks."
    >
      <StudyPlanner />
    </DashboardShell>
  );
}
