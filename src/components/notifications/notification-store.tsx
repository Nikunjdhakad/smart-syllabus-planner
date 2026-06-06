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

const POLL_MS = 60_000; // refresh every 60 s

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpenState] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (!res.ok) return;
      const body = await res.json() as { data: { notifications: NotificationItem[]; unreadCount: number } };
      setNotifications(body.data.notifications);
      setUnreadCount(body.data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    void refresh();
    intervalRef.current = setInterval(() => void refresh(), POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setNotifications((p) => p.map((n) => n.notificationId === id ? { ...n, read: true } : n));
    setUnreadCount((p) => Math.max(0, p - 1));
  }, []);

  const markUnread = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: false }),
    });
    setNotifications((p) => p.map((n) => n.notificationId === id ? { ...n, read: false } : n));
    setUnreadCount((p) => p + 1);
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearRead = useCallback(async () => {
    await fetch("/api/notifications/clear", { method: "DELETE" });
    setNotifications((p) => p.filter((n) => !n.read));
  }, []);

  const deleteOne = useCallback(async (id: string) => {
    const n = notifications.find((x) => x.notificationId === id);
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((p) => p.filter((x) => x.notificationId !== id));
    if (n && !n.read) setUnreadCount((p) => Math.max(0, p - 1));
  }, [notifications]);

  const setOpen = useCallback((v: boolean) => setOpenState(v), []);
  const toggle = useCallback(() => setOpenState((p) => !p), []);

  return (
    <Context.Provider value={{
      notifications, unreadCount, loading, open,
      refresh, markRead, markUnread, markAllRead, clearRead, deleteOne,
      setOpen, toggle,
    }}>
      {children}
    </Context.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
