import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jsonError, jsonSuccess } from "@/lib/api";
import User from "@/models/User";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  await connectDB();
  const user = await User.findOne({ userId: session.userId });
  if (!user) {
    return jsonError("User not found", 404);
  }

  return jsonSuccess({
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
    },
  });
}
