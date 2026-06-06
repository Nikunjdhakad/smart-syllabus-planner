import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { CopilotProvider } from "@/components/copilot/copilot-store";
import { FloatingCopilot } from "@/components/copilot/floating-copilot";

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
    <CopilotProvider>
      {children}
      <FloatingCopilot />
    </CopilotProvider>
  );
}
