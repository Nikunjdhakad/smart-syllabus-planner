"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Clock,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications } from "@/components/notifications/notification-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationType } from "@/types/notification";

/* ─── Type → icon / colour map ───────────────────────────────── */

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.FC<{ className?: string }>; bg: string; fg: string }
> = {
  study_reminder: {
    Icon: ({ className }) => <Clock className={className} />,
    bg: "bg-primary/12 dark:bg-primary/20",
    fg: "text-primary",
  },
  deadline_alert: {
    Icon: ({ className }) => <CalendarClock className={className} />,
    bg: "bg-amber-500/12 dark:bg-amber-500/20",
    fg: "text-amber-600 dark:text-amber-400",
  },
  revision_reminder: {
    Icon: ({ className }) => <RotateCcw className={className} />,
    bg: "bg-cyan-500/12 dark:bg-cyan-500/20",
    fg: "text-cyan-600 dark:text-cyan-400",
  },
  missed_task: {
    Icon: ({ className }) => <AlertCircle className={className} />,
    bg: "bg-rose-500/12 dark:bg-rose-500/20",
    fg: "text-rose-600 dark:text-rose-400",
  },
  exam_readiness: {
    Icon: ({ className }) => <BookOpen className={className} />,
    bg: "bg-emerald-500/12 dark:bg-emerald-500/20",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  recovery_alert: {
    Icon: ({ className }) => <ShieldAlert className={className} />,
    bg: "bg-rose-500/12 dark:bg-rose-500/20",
    fg: "text-rose-600 dark:text-rose-400",
  },
};

/* ─── Relative timestamp ─────────────────────────────────────── */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Single notification row ────────────────────────────────── */

function NotificationRow({ n }: { n: NotificationItem }) {
  const { markRead, deleteOne, setOpen } = useNotifications();
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.study_reminder;

  function handleRowClick() {
    if (!n.read) void markRead(n.notificationId);
    if (n.actionLink) setOpen(false);
  }

  const rowContent = (
    <div
      className={cn(
        "group relative flex gap-3.5 rounded-xl px-3 py-3 transition-all duration-150",
        "hover:bg-muted/60 active:bg-muted/80 cursor-pointer",
        !n.read
          ? "bg-primary/[0.04] dark:bg-primary/[0.08] hover:bg-primary/[0.07] dark:hover:bg-primary/[0.12]"
          : "bg-transparent",
      )}
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => e.key === "Enter" && handleRowClick()}
    >
      {/* Unread indicator */}
      {!n.read && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
        />
      )}

      {/* Icon badge */}
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          cfg.bg,
        )}
      >
        <cfg.Icon className={cn("size-[1.0625rem]", cfg.fg)} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 pr-1">
        <p
          className={cn(
            "text-[0.8125rem] leading-snug",
            n.read
              ? "font-normal text-foreground/75"
              : "font-semibold text-foreground",
          )}
        >
          {n.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {n.message}
        </p>
        <p className="mt-1.5 text-[0.6875rem] font-medium text-muted-foreground/60">
          {relativeTime(n.createdAt)}
        </p>
      </div>

      {/* Dismiss */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.stopPropagation();
          void deleteOne(n.notificationId);
        }}
        className={cn(
          "mt-0.5 shrink-0 self-start rounded-lg p-1",
          "text-muted-foreground/40 transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );

  if (n.actionLink) {
    return (
      <li className="px-3">
        <Link href={n.actionLink} className="block focus:outline-none" tabIndex={-1}>
          {rowContent}
        </Link>
      </li>
    );
  }

  return <li className="px-3">{rowContent}</li>;
}

/* ─── Empty state ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Bell className="size-7 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">All caught up</p>
        <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
          No notifications right now. We'll alert you when something needs attention.
        </p>
      </div>
    </div>
  );
}

/* ─── Skeleton rows ──────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <div className="space-y-1 px-3 py-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3.5 rounded-xl px-3 py-3">
          <div className="skeleton mt-0.5 size-9 shrink-0 rounded-[10px]" />
          <div className="flex-1 space-y-2 py-0.5">
            <div className="skeleton h-3 w-2/3 rounded-md" />
            <div className="skeleton h-2.5 w-full rounded-md" />
            <div className="skeleton h-2.5 w-1/2 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main drawer panel ──────────────────────────────────────── */

export function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    loading,
    open,
    markingAllRead,
    setOpen,
    markAllRead,
    clearRead,
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);
  // Guard: only render portal after client hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Close on outside click — only after the open animation starts */
  useEffect(() => {
    if (!open) return;
    const tid = setTimeout(() => {
      function handler(e: MouseEvent) {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, 50);
    return () => clearTimeout(tid);
  }, [open, setOpen]);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  /* Lock body scroll on mobile when open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Don't render portal until after hydration
  if (!mounted) return null;

  const hasRead = notifications.some((n) => n.read);
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className={cn(
          /* Position — right-side fixed drawer */
          "fixed right-0 top-0 z-[70] flex h-full flex-col",
          "w-full sm:w-[420px]",
          /* Appearance */
          "border-l border-border bg-background shadow-2xl",
          /* Slide animation */
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <Bell className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[0.9375rem] font-semibold leading-none">Notifications</h2>
              {unreadCount > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => void markAllRead()}
                disabled={markingAllRead}
                aria-label="Mark all as read"
              >
                {markingAllRead ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5" />
                )}
                Mark all read
              </Button>
            )}
            {hasRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => void clearRead()}
                aria-label="Clear read notifications"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
              className="ml-1"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <SkeletonRows />
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-2">
              {/* Unread section */}
              {unreadNotifications.length > 0 && (
                <section>
                  <p className="px-6 pb-1.5 pt-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    Unread
                  </p>
                  <ul className="space-y-0.5">
                    {unreadNotifications.map((n) => (
                      <NotificationRow key={n.notificationId} n={n} />
                    ))}
                  </ul>
                </section>
              )}

              {/* Read section */}
              {readNotifications.length > 0 && (
                <section className={unreadNotifications.length > 0 ? "mt-4" : ""}>
                  {unreadNotifications.length > 0 && (
                    <p className="px-6 pb-1.5 pt-3 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      Earlier
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {readNotifications.map((n) => (
                      <NotificationRow key={n.notificationId} n={n} />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div className="shrink-0 border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-center text-xs text-muted-foreground">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              {unreadCount > 0 && (
                <span className="text-primary font-medium"> · {unreadCount} unread</span>
              )}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(panelContent, document.body);
}
