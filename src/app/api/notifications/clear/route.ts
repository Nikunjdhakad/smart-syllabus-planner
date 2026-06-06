import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import Notification from "@/models/Notification";

/** DELETE /api/notifications/clear — delete all read notifications */
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    const result = await Notification.deleteMany({ userId: session.userId, read: true });
    return jsonSuccess({ deletedCount: result.deletedCount });
  } catch (error) {
    return handleApiError(error);
  }
}
