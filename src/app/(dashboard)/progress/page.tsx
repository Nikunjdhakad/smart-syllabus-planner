import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export const metadata: Metadata = {
  title: "Progress",
};

export default function ProgressPage() {
  return (
    <DashboardShell
      title="Progress"
      description="Track syllabus completion, subject-wise progress, and study streaks."
    >
      <PlaceholderPanel
        title="Progress module"
        description="Phase 4 will add task completion, charts, and analytics dashboard."
      />
    </DashboardShell>
  );
}
