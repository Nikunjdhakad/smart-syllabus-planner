import {
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
} from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 attempts per hour per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`register:${clientIp}`, RATE_LIMITS.REGISTER);
    
    if (!rateLimitResult.success) {
      const minutesUntilReset = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
      return jsonError(
        `Too many registration attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
        429
      );
    }

    const body = registerSchema.parse(await request.json());
    await connectDB();

    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const password = await hashPassword(body.password);
    const user = await User.create({
      name: body.name,
      email: body.email,
      password,
    });

    const token = await createSessionToken({
      userId: user.userId,
      email: user.email,
    });

    const response = jsonSuccess(
      {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
        },
      },
      201,
    );

    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
