import { createHash, randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";

const RESET_TOKEN_EXPIRY_MINUTES = 30;

/** Generate a crypto-secure reset token and its hash for storage. */
function generateResetToken(): { rawToken: string; hashedToken: string } {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
}

/** Hash a raw token for comparison (same algo used during generation). */
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a password reset token for the given email.
 * Returns the raw token (to be sent in the link) or null if email not found.
 * IMPORTANT: Caller must not reveal whether the email exists.
 */
export async function createPasswordResetToken(
  email: string,
): Promise<string | null> {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;

  const { rawToken, hashedToken } = generateResetToken();
  const expires = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
  );

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = expires;
  await user.save();

  return rawToken;
}

/**
 * Validate a reset token and set a new password.
 * Returns true on success, throws on invalid/expired token.
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  await connectDB();

  const hashedToken = hashToken(rawToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires +password");

  if (!user) {
    throw new Error(
      "Invalid or expired reset link. Please request a new password reset.",
    );
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = undefined as unknown as string;
  user.resetPasswordExpires = undefined as unknown as Date;
  await user.save();
}

/**
 * Send a password reset email via Nodemailer (Gmail SMTP).
 * Falls back to console logging when SMTP_USER/SMTP_PASS are not configured.
 * 
 * @throws Error if email sending fails (in production mode)
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const { sendEmail } = await import("@/lib/email/send-email");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  console.log(`[Password Reset] 🔑 Sending reset email to: ${email}`);
  console.log(`[Password Reset] Reset URL: ${resetUrl}`);

  const result = await sendEmail({
    to: email,
    subject: "Reset your Smart Syllabus Planner password",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a24;border-radius:16px;border:1px solid #2a2a3a;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <div style="display:inline-block;background:rgba(124,58,237,0.15);border-radius:12px;padding:12px;">
            <span style="font-size:24px;">🔐</span>
          </div>
          <h1 style="color:#f5f5f7;font-size:22px;margin:16px 0 8px;">Password Reset</h1>
          <p style="color:#8b8b9e;font-size:14px;margin:0;line-height:1.5;">
            We received a request to reset your password for your Smart Syllabus Planner account.
          </p>
        </td></tr>
        <!-- Button -->
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                Reset my password
              </a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Info -->
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#12121a;border-radius:10px;padding:16px;border:1px solid #2a2a3a;">
            <p style="color:#8b8b9e;font-size:13px;margin:0 0 8px;">⏱ This link expires in <strong style="color:#f5f5f7;">${RESET_TOKEN_EXPIRY_MINUTES} minutes</strong></p>
            <p style="color:#8b8b9e;font-size:13px;margin:0;">🔒 If you didn't request this, ignore this email.</p>
          </div>
        </td></tr>
        <!-- Fallback URL -->
        <tr><td style="padding:0 32px 24px;">
          <p style="color:#5a5a6e;font-size:12px;margin:0;word-break:break-all;">
            If the button doesn't work, copy this link:<br/>
            <a href="${resetUrl}" style="color:#7c3aed;text-decoration:none;">${resetUrl}</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #2a2a3a;text-align:center;">
          <p style="color:#4a4a5e;font-size:12px;margin:0;">Smart Syllabus Planner — Study smarter, not harder.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  if (!result.success) {
    console.error(`[Password Reset] ❌ Failed to send email to: ${email}`);
    console.error(`[Password Reset] Error: ${result.error}`);
    
    // In development, show the reset link in console
    if (process.env.NODE_ENV !== "production") {
      console.log("\n" + "=".repeat(60));
      console.log("🔑 PASSWORD RESET LINK (email sending failed - development fallback)");
      console.log("=".repeat(60));
      console.log(`Email: ${email}`);
      console.log(`Link:  ${resetUrl}`);
      console.log(`Expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes`);
      console.log("=".repeat(60) + "\n");
    }
    
    return {
      success: false,
      error: result.error,
    };
  }

  console.log(`[Password Reset] ✅ Reset email sent successfully to: ${email}`);
  console.log(`[Password Reset] Message ID: ${result.messageId}`);

  return {
    success: true,
    messageId: result.messageId,
  };
}

