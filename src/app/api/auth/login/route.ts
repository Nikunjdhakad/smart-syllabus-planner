import {
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    await connectDB();

    const user = await User.findOne({ email: body.email }).select("+password");
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const valid = await verifyPassword(body.password, user.password);
    if (!valid) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await createSessionToken({
      userId: user.userId,
      email: user.email,
    });

    const response = jsonSuccess({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
