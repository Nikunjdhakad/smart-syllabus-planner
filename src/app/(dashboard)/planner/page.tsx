import type { Metadata } from "next";

import { StudyPlanner } from "@/components/planner/study-planner";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = { title: "Study Planner" };

export default function PlannerPage() {
  return (
    <DashboardShell
      title="Study planner"
      description="Configure exam dates, daily hours, and weak subjects. AI generates a personalized schedule."
    >
      <div className="page-enter">
        <StudyPlanner />
      </div>
    </DashboardShell>
  );
}
