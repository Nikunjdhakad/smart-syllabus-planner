import type { Metadata } from "next";
import {
  BookOpen,
  Bot,
  CalendarDays,
  LineChart,
  RotateCcw,
} from "lucide-react";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FeatureCard } from "@/components/shared/feature-card";
import User from "@/models/User";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getSession();
  await connectDB();
  const user = session
    ? await User.findOne({ userId: session.userId }).lean()
    : null;

  const firstName = user?.name?.split(" ")[0] ?? "Student";

  return (
    <DashboardShell
      title={`Welcome, ${firstName}`}
      description="Your academic command center. Modules below will be built step by step."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          href={ROUTES.syllabus}
          icon={BookOpen}
          title="Syllabus"
          description="Upload documents and manage subjects and topics."
        />
        <FeatureCard
          href={ROUTES.planner}
          icon={CalendarDays}
          title="Study planner"
          description="Set exam dates and generate personalized schedules."
        />
        <FeatureCard
          href={ROUTES.progress}
          icon={LineChart}
          title="Progress"
          description="Track completion, streaks, and analytics."
        />
        <FeatureCard
          href={ROUTES.revisions}
          icon={RotateCcw}
          title="Revisions"
          description="Spaced repetition and revision timelines."
        />
        <FeatureCard
          href={ROUTES.assistant}
          icon={Bot}
          title="AI assistant"
          description="Chat for study guidance and recovery plans."
        />
      </div>
    </DashboardShell>
  );
}
