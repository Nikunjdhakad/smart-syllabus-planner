import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { CopilotProvider } from "@/components/copilot/copilot-store";
import { FloatingCopilot } from "@/components/copilot/floating-copilot";
import { NotificationProvider } from "@/components/notifications/notification-store";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(ROUTES.login);
  }

  return (
    <NotificationProvider>
      <CopilotProvider>
        {children}
        <FloatingCopilot />
      </CopilotProvider>
    </NotificationProvider>
  );
}
