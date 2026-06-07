import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import Notification from "@/models/Notification";

type RouteContext = { params: Promise<{ notificationId: string }> };

/** PATCH /api/notifications/[id] — toggle read state */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { notificationId } = await context.params;
    const body = await request.json() as { read?: boolean };
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { notificationId, userId: session.userId },
      { read: body.read ?? true },
      { new: true },
    ).lean() as Record<string, unknown> | null;

    if (!notification) return jsonError("Notification not found", 404);

    return jsonSuccess({ notification });
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/notifications/[id] — soft-delete: mark as read rather than destroy,
 *  so the daily dedup window in generate.ts is preserved and the notification
 *  is not recreated on the next page load while the underlying condition persists. */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { notificationId } = await context.params;
    await connectDB();

    // Soft-delete: mark read=true and set a dismissed flag so the UI hides it
    // but the document remains as a dedup sentinel until tomorrow.
    await Notification.updateOne(
      { notificationId, userId: session.userId },
      { read: true, "metadata.dismissed": true },
    );

    return jsonSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
