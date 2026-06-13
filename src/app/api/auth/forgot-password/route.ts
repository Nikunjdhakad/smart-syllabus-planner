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
    const email = body.email.toLowerCase().trim();

    console.log(`[API] Password reset requested for email: ${email}`);

    const token = await createPasswordResetToken(email);

    // If token exists, send the email
    if (token) {
      console.log(`[API] ✅ User found, sending reset email to: ${email}`);
      
      const emailResult = await sendPasswordResetEmail(email, token);
      
      if (!emailResult.success) {
        console.error(`[API] ❌ Failed to send reset email to: ${email}`);
        console.error(`[API] Error: ${emailResult.error}`);
        
        // In production, we still return success to avoid email enumeration
        // But log the failure for debugging
        if (process.env.NODE_ENV === "production") {
          console.error(`[API] ⚠️  Email sending failed in production - user won't receive reset link`);
        } else {
          // In development, we can be more helpful
          return jsonError(
            `Failed to send reset email: ${emailResult.error}. Check server logs for details.`,
            500
          );
        }
      } else {
        console.log(`[API] ✅ Reset email sent successfully to: ${email}`);
        console.log(`[API] Message ID: ${emailResult.messageId}`);
      }
    } else {
      console.log(`[API] ⚠️  No user found with email: ${email} (not revealing to client)`);
    }

    // Always return the same response regardless of whether the email exists
    // or whether email sending succeeded (security best practice)
    return jsonSuccess({
      message:
        "If an account with that email exists, we've sent a password reset link. Check your inbox.",
    });
  } catch (error) {
    console.error("[API] ❌ Forgot password error:", error);
    return handleApiError(error);
  }
}
