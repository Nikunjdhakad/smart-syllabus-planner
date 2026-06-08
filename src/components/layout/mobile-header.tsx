"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NotificationTrigger } from "@/components/notifications/notification-trigger";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants";

export function MobileHeader({ title, onLogout }: { title: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border" showCloseButton>
          <SheetHeader className="h-14 flex items-center justify-start border-b border-sidebar-border px-5">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <BrandLogo href={ROUTES.dashboard} showTagline />
          </SheetHeader>
          <div className="flex flex-1 flex-col p-3">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <div className="space-y-2 border-t border-sidebar-border p-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => { setOpen(false); onLogout(); }}
            >
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <p className="truncate text-sm font-semibold">{title}</p>
      {/* Right side: notification bell + theme toggle */}
      <div className="flex items-center gap-1">
        <NotificationTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
}
