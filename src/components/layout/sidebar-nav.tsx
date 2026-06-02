"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  CalendarDays,
  LayoutDashboard,
  LineChart,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const sidebarNavItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.syllabus, label: "Syllabus", icon: BookOpen },
  { href: ROUTES.planner, label: "Study Planner", icon: CalendarDays },
  { href: ROUTES.progress, label: "Progress", icon: LineChart },
  { href: ROUTES.revisions, label: "Revisions", icon: RotateCcw },
  { href: ROUTES.recovery, label: "Recovery Center", icon: ShieldAlert },
  { href: ROUTES.assistant, label: "AI Assistant", icon: Bot },
];

export function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Main navigation">
      {sidebarNavItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            {active && (
              <span
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-sm shadow-primary/50"
                aria-hidden
              />
            )}
            <Icon
              className={cn(
                "size-4 shrink-0 transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground",
              )}
            />
            <span className="truncate">{label}</span>
            {label === "AI Assistant" && (
              <span className="ml-auto flex size-1.5 rounded-full bg-primary/60" aria-hidden />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
