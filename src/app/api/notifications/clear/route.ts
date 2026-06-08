import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import Notification from "@/models/Notification";

/** DELETE /api/notifications/clear
 *
 * Marks all unread notifications as read (dismissed), and hard-deletes read
 * notifications that are older than today. Today's read documents are kept as
 * dedup sentinels so the generation engine does not recreate them on the next
 * page load while the underlying conditions still exist.
 */
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Hard-delete only read notifications from previous days
    const result = await Notification.deleteMany({
      userId: session.userId,
      read: true,
      createdAt: { $lt: todayStart },
    });

    // Mark today's unread as dismissed (soft-delete) so they vanish from UI
    // but remain as dedup sentinels
    await Notification.updateMany(
      {
        userId: session.userId,
        read: false,
        createdAt: { $gte: todayStart },
      },
      { read: true, "metadata.dismissed": true },
    );

    return jsonSuccess({ deletedCount: result.deletedCount });
  } catch (error) {
    return handleApiError(error);
  }
}
