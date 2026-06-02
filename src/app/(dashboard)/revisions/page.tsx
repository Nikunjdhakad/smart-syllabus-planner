import type { Metadata } from "next";

import { RevisionManager } from "@/components/revisions/revision-manager";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = { title: "Revisions" };

export default function RevisionsPage() {
  return (
    <DashboardShell
      title="Revisions"
      description="Spaced repetition scheduling: 1, 3, and 7 days after completing a topic — then a final review before your exam."
    >
      <div className="page-enter">
        <RevisionManager />
      </div>
    </DashboardShell>
  );
}
