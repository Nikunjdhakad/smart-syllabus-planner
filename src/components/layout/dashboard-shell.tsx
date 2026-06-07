"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ROUTES } from "@/lib/constants";

export function DashboardShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = ROUTES.login;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <MobileHeader title={title} onLogout={() => void handleLogout()} />

        {/* Desktop page header */}
        <header className="hidden shrink-0 border-b border-border bg-background/95 px-8 py-5 backdrop-blur-xl lg:block shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </header>

        {/* Main content */}
        <main className="relative flex-1 overflow-y-auto bg-background">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            aria-hidden
          />
          <div className="relative p-6 sm:p-8">
            <div className="page-enter">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
