"use client";

import { useState, useEffect } from "react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = ROUTES.login;
  }

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        {collapsed ? (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            SP
          </div>
        ) : (
          <BrandLogo href={ROUTES.dashboard} showTagline />
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        <SidebarNav collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t border-sidebar-border p-3">
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "w-full gap-2.5 text-muted-foreground hover:text-foreground",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span className="transition-opacity duration-300">Collapse</span>
            </>
          )}
        </Button>

        {/* Theme Toggle */}
        {collapsed ? (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground transition-opacity duration-300">
              Theme
            </span>
            <ThemeToggle />
          </div>
        )}

        {/* Logout */}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "w-full gap-2.5 text-muted-foreground hover:text-foreground",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => void handleLogout()}
          title="Log out"
        >
          <LogOut className="size-4" />
          {!collapsed && <span className="transition-opacity duration-300">Log out</span>}
        </Button>
      </div>
    </aside>
  );
}
