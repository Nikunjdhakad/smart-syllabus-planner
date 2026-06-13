import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyllabusIntelligenceCenter } from "@/components/syllabus/syllabus-intelligence-center";

export const metadata: Metadata = { title: "Syllabus Intelligence Center" };

export default function SyllabusPage() {
  return (
    <DashboardShell
      title="Syllabus Intelligence Center"
      description="Transform raw syllabus documents into structured learning roadmaps"
    >
      <SyllabusIntelligenceCenter />
    </DashboardShell>
  );
}
