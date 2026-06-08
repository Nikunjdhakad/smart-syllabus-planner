"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NotificationItem } from "@/types/notification";

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  open: boolean;
  markingAllRead: boolean;
}

interface NotificationActions {
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markUnread: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearRead: () => Promise<void>;
  deleteOne: (id: string) => Promise<void>;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

type NotificationCtx = NotificationState & NotificationActions;
const Context = createContext<NotificationCtx | null>(null);

const POLL_MS = 60_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpenState] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Keep a ref that always points to the latest notifications so callbacks
  // never close over a stale snapshot.
  const notificationsRef = useRef<NotificationItem[]>([]);
  notificationsRef.current = notifications;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const markingRef = useRef(false); // sync guard for markAllRead

  // ── fetch ────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (!res.ok) return;
      const body = (await res.json()) as {
        data: { notifications: NotificationItem[]; unreadCount: number };
      };
      setNotifications(body.data.notifications);
      setUnreadCount(body.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling. Generation is safe on every call now — the engine
  // deduplicates by (userId, type, UTC day) regardless of read state.
  useEffect(() => {
    void refresh();
    intervalRef.current = setInterval(() => void refresh(), POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  // ── markRead ─────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => {
      const wasUnread = notificationsRef.current.find(
        (n) => n.notificationId === id,
      )?.read === false;
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch {
      // Rollback
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, read: false } : n)),
      );
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // ── markUnread ───────────────────────────────────────────────
  const markUnread = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, read: false } : n)),
    );
    setUnreadCount((prev) => prev + 1);
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: false }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // ── markAllRead ──────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    // Sync guard — prevent double-fire
    if (markingRef.current) return;
    markingRef.current = true;
    setMarkingAllRead(true);

    // Snapshot current state for rollback using the ref (never stale)
    const snapshot = notificationsRef.current;
    const snapshotCount = snapshot.filter((n) => !n.read).length;

    // Optimistic update — mark every notification read immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`read-all failed: ${res.status} ${text}`);
      }
      // Success — state is already correct, no further action needed
    } catch (err) {
      console.error("[markAllRead]", err);
      // Rollback to exact snapshot
      setNotifications(snapshot);
      setUnreadCount(snapshotCount);
    } finally {
      markingRef.current = false;
      setMarkingAllRead(false);
    }
  }, []); // no deps — uses ref + functional setters

  // ── clearRead ────────────────────────────────────────────────
  const clearRead = useCallback(async () => {
    const snapshot = notificationsRef.current;
    // Remove all read notifications from UI immediately
    const hasRead = snapshot.some((n) => n.read);
    if (!hasRead) return;

    setNotifications((prev) => prev.filter((n) => !n.read));

    try {
      const res = await fetch("/api/notifications/clear", { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE /clear failed");
    } catch (err) {
      console.error("[clearRead]", err);
      setNotifications(snapshot);
    }
  }, []);

  // ── deleteOne (soft-delete: marks dismissed in DB, removes from UI) ─────
  const deleteOne = useCallback(async (id: string) => {
    const snapshot = notificationsRef.current;
    const target = snapshot.find((n) => n.notificationId === id);

    // Immediately remove from UI
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      // DELETE now soft-deletes (marks read + dismissed) to preserve dedup sentinel
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("DELETE failed");
    } catch (err) {
      console.error("[deleteOne]", err);
      // Rollback UI only — restore the item
      if (target) {
        setNotifications(snapshot);
        if (!target.read) setUnreadCount((prev) => prev + 1);
      }
    }
  }, []); // no deps — uses ref

  // ── panel open/close ─────────────────────────────────────────
  const setOpen = useCallback((v: boolean) => setOpenState(v), []);
  const toggle = useCallback(() => setOpenState((prev) => !prev), []);

  return (
    <Context.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        open,
        markingAllRead,
        refresh,
        markRead,
        markUnread,
        markAllRead,
        clearRead,
        deleteOne,
        setOpen,
        toggle,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
