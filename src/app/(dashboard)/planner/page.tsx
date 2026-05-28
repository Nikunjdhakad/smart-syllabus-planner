import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export const metadata: Metadata = {
  title: "Study Planner",
};

export default function PlannerPage() {
  return (
    <DashboardShell
      title="Study planner"
      description="Configure exam dates, daily hours, and weak subjects to generate plans."
    >
      <PlaceholderPanel
        title="Planner module"
        description="Phase 3 will generate daily tasks, weekly plans, and priority scheduling."
      />
    </DashboardShell>
  );
}
