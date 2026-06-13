import { handleApiError, jsonSuccess, jsonError } from "@/lib/api";
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/auth/password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 attempts per hour per IP
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`forgot-password:${clientIp}`, RATE_LIMITS.PASSWORD_RESET);
    
    if (!rateLimitResult.success) {
      const minutesUntilReset = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
      return jsonError(
        `Too many password reset attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
        429
      );
    }

    const body = forgotPasswordSchema.parse(await request.json());

    const token = await createPasswordResetToken(body.email);

    // If token exists, send the email. Otherwise do nothing — don't reveal
    // whether the email exists in our system.
    if (token) {
      await sendPasswordResetEmail(body.email, token);
    }

    // Always return the same response regardless of whether the email exists
    return jsonSuccess({
      message:
        "If an account with that email exists, we've sent a password reset link. Check your inbox.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
