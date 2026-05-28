import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

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

  return children;
}
