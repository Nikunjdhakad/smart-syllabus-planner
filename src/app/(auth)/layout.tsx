import { GraduationCap } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="size-6" />
        {APP_NAME}
      </div>
      {children}
    </div>
  );
}
