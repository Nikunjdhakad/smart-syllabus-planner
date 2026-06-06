import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import Notification from "@/models/Notification";

/** POST /api/notifications/read-all — mark all as read */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    await connectDB();
    const result = await Notification.updateMany(
      { userId: session.userId, read: false },
      { read: true },
    );

    return jsonSuccess({ modifiedCount: result.modifiedCount });
  } catch (error) {
    return handleApiError(error);
  }
}
