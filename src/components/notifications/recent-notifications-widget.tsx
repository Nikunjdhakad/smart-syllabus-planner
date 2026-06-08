"use client";

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
} from "lucide-react";
import { useNotifications } from "@/components/notifications/notification-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationType } from "@/types/notification";

/* ─── Icon + colour map ──────────────────────────────────────── */

const TYPE_ICONS: Record<NotificationType, React.FC<{ className?: string }>> = {
  study_reminder:    ({ className }) => <Clock className={className} />,
  deadline_alert:    ({ className }) => <CalendarClock className={className} />,
  revision_reminder: ({ className }) => <RotateCcw className={className} />,
  missed_task:       ({ className }) => <AlertCircle className={className} />,
  exam_readiness:    ({ className }) => <BookOpen className={className} />,
  recovery_alert:    ({ className }) => <ShieldAlert className={className} />,
};

const TYPE_COLORS: Record<NotificationType, { bg: string; fg: string }> = {
  study_reminder:    { bg: "bg-primary/10",             fg: "text-primary" },
  deadline_alert:    { bg: "bg-amber-500/10",           fg: "text-amber-600 dark:text-amber-400" },
  revision_reminder: { bg: "bg-cyan-500/10",            fg: "text-cyan-600 dark:text-cyan-400" },
  missed_task:       { bg: "bg-rose-500/10",            fg: "text-rose-600 dark:text-rose-400" },
  exam_readiness:    { bg: "bg-emerald-500/10",         fg: "text-emerald-600 dark:text-emerald-400" },
  recovery_alert:    { bg: "bg-rose-500/10",            fg: "text-rose-600 dark:text-rose-400" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Row ────────────────────────────────────────────────────── */

function WidgetRow({ n }: { n: NotificationItem }) {
  const { markRead, setOpen } = useNotifications();
  const Icon = TYPE_ICONS[n.type] ?? TYPE_ICONS.study_reminder;
  const colors = TYPE_COLORS[n.type] ?? TYPE_COLORS.study_reminder;

  function handleClick() {
    if (!n.read) void markRead(n.notificationId);
    if (n.actionLink) setOpen(false);
  }

  const inner = (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "group flex items-start gap-3 px-5 py-3.5 transition-all duration-150",
        "hover:bg-muted/50 active:bg-muted/70 cursor-pointer",
        !n.read && "bg-primary/[0.03] dark:bg-primary/[0.06] hover:bg-primary/[0.05]",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px]",
          colors.bg,
        )}
      >
        <Icon className={cn("size-3.5", colors.fg)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[0.8125rem] leading-snug",
            n.read ? "font-normal text-foreground/75" : "font-semibold text-foreground",
          )}
        >
          {n.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {n.message}
        </p>
      </div>

      {/* Right: time + unread dot */}
      <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
        <span className="text-[0.625rem] font-medium text-muted-foreground/60">
          {relativeTime(n.createdAt)}
        </span>
        {!n.read && (
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
        )}
      </div>
    </div>
  );

  if (n.actionLink) {
    return (
      <li>
        <Link href={n.actionLink} className="block focus:outline-none" tabIndex={-1}>
          {inner}
        </Link>
      </li>
    );
  }
  return <li>{inner}</li>;
}

/* ─── Widget ─────────────────────────────────────────────────── */

export function RecentNotificationsWidget() {
  const { notifications, unreadCount, loading, markAllRead, markingAllRead, setOpen } =
    useNotifications();

  const recent = notifications.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="size-3.5 text-primary" />
          </div>
          <h2 className="text-[0.9375rem] font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-primary">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="h-7 gap-1 text-[0.75rem] text-muted-foreground hover:text-foreground"
              onClick={() => void markAllRead()}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckCheck className="size-3" />
              )}
              Mark all read
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[0.75rem] font-medium text-primary transition-colors hover:text-primary/80 hover:underline focus:outline-none"
          >
            View all →
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && recent.length === 0 ? (
        <div className="space-y-px px-3 py-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-3">
              <div className="skeleton size-8 shrink-0 rounded-[10px]" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-2/3 rounded" />
                <div className="skeleton h-2.5 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
            <Bell className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              We'll alert you when something needs attention.
            </p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {recent.map((n) => (
            <WidgetRow key={n.notificationId} n={n} />
          ))}
        </ul>
      )}

      {/* Footer — show if there are more than 5 */}
      {notifications.length > 5 && (
        <div className="border-t border-border/60 bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            +{notifications.length - 5} more notification{notifications.length - 5 !== 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
}
