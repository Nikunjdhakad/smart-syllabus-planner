import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { generateSmartNotifications } from "@/lib/notifications/generate";
import Notification from "@/models/Notification";
import type { NotificationItem } from "@/types/notification";

function serialize(doc: Record<string, unknown>): NotificationItem {
  return {
    notificationId: doc.notificationId as string,
    userId: doc.userId as string,
    title: doc.title as string,
    message: doc.message as string,
    type: doc.type as NotificationItem["type"],
    priority: doc.priority as NotificationItem["priority"],
    read: doc.read as boolean,
    actionLink: (doc.actionLink as string | null) ?? null,
    metadata: (doc.metadata as Record<string, unknown>) ?? {},
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  };
}

/** GET /api/notifications — list with optional ?unreadOnly=true */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

    await connectDB();

    // Auto-generate smart notifications on each fetch (deduplicated internally)
    await generateSmartNotifications(session.userId).catch(() => {});

    const query: Record<string, unknown> = { userId: session.userId };
    if (unreadOnly) query.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean() as Promise<Record<string, unknown>[]>,
      Notification.countDocuments({ userId: session.userId, read: false }),
    ]);

    return jsonSuccess({
      notifications: notifications.map(serialize),
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
