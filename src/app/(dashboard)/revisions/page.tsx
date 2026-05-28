import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export const metadata: Metadata = {
  title: "Revisions",
};

export default function RevisionsPage() {
  return (
    <DashboardShell
      title="Revisions"
      description="Automatic revision scheduling with spaced repetition reminders."
    >
      <PlaceholderPanel
        title="Revision module"
        description="Phase 5 will schedule revision sessions and track completion."
      />
    </DashboardShell>
  );
}
