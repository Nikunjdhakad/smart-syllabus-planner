"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bot,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  RotateCcw,
} from "lucide-react";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.syllabus, label: "Syllabus", icon: BookOpen },
  { href: ROUTES.planner, label: "Study Planner", icon: CalendarDays },
  { href: ROUTES.progress, label: "Progress", icon: LineChart },
  { href: ROUTES.revisions, label: "Revisions", icon: RotateCcw },
  { href: ROUTES.assistant, label: "AI Assistant", icon: Bot },
];

export function AppSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = ROUTES.login;
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-5">
        <GraduationCap className="size-6 text-sidebar-primary" />
        <div>
          <p className="text-sm font-semibold leading-none">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Academic planner</p>
        </div>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => void handleLogout()}
        >
          Log out
        </Button>
      </div>
    </aside>
  );
}
