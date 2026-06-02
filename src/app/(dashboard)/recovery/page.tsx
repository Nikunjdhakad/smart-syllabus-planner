import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getRecoveryDashboardData } from "@/lib/recovery/dashboard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RecoveryCenter } from "@/components/recovery/recovery-center";

export const metadata: Metadata = {
  title: "Recovery Center",
};

export const dynamic = "force-dynamic";

export default async function RecoveryPage() {
  const session = await getSession();
  await connectDB();

  const data = session
    ? await getRecoveryDashboardData(session.userId)
    : { overdueCount: 0, overdueTasks: [], latestRecovery: null, plansWithOverdue: [] };

  return (
    <DashboardShell
      title="Recovery Center"
      description="Identify missed tasks, generate a recovery plan, and get back on track."
    >
      <div className="page-enter">
        <RecoveryCenter initial={data} />
      </div>
    </DashboardShell>
  );
}
