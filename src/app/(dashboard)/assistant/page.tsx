import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export const metadata: Metadata = {
  title: "AI Assistant",
};

export default function AssistantPage() {
  return (
    <DashboardShell
      title="AI study assistant"
      description="Ask study questions, get daily suggestions, and emergency recovery plans."
    >
      <PlaceholderPanel
        title="Assistant module"
        description="Phase 6 will integrate Google Gemini for conversational academic help."
      />
    </DashboardShell>
  );
}
