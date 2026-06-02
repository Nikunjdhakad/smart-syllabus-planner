"use client";

import { LogOut } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = ROUTES.login;
  }

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <BrandLogo href={ROUTES.dashboard} showTagline />
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        <SidebarNav />
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-muted-foreground hover:text-foreground"
          onClick={() => void handleLogout()}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
