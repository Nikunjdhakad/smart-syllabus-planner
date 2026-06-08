"use client";

/**
 * NotificationTrigger
 *
 * Renders the bell button. The panel renders itself into a portal
 * at document.body level via NotificationPanel, so no wrapper div
 * positioning is needed here — which was causing the outside-click
 * handler to fire immediately on bell click.
 */

import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationPanel } from "@/components/notifications/notification-panel";

export function NotificationTrigger({ className }: { className?: string }) {
  return (
    <>
      <NotificationBell className={className} />
      <NotificationPanel />
    </>
  );
}
