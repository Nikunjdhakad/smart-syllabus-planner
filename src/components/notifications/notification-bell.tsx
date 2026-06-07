"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/components/notifications/notification-store";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { unreadCount, open, toggle } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={toggle}
      className={cn(
        "relative",
        open && "bg-muted text-foreground",
        className,
      )}
    >
      <Bell
        className={cn(
          "size-[1.0625rem] transition-transform duration-200",
          open && "scale-95",
        )}
        strokeWidth={2}
      />

      {unreadCount > 0 && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-0.5 -top-0.5",
            "flex min-w-[1.125rem] items-center justify-center",
            "rounded-full bg-primary px-[3px] py-px",
            "text-[0.5rem] font-bold leading-none text-primary-foreground",
            "ring-2 ring-background",
            "transition-transform duration-200",
            unreadCount > 0 && "animate-in zoom-in-75 duration-200",
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
}
