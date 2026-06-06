import type { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from "@/models/Notification";

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export type NotificationItem = {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionLink: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type NotificationListResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
};
