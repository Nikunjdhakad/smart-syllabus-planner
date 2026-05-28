import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export const metadata: Metadata = {
  title: "Syllabus",
};

export default function SyllabusPage() {
  return (
    <DashboardShell
      title="Syllabus"
      description="Upload PDFs, images, or enter syllabus manually. AI extraction comes next."
    >
      <PlaceholderPanel
        title="Syllabus module"
        description="Phase 2 will add file upload, manual entry, and Gemini-powered topic extraction."
      />
    </DashboardShell>
  );
}
