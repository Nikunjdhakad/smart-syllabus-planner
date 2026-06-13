import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const APP_NAME = "Smart Syllabus Planner";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: "gmail" | "none";
}

/**
 * Create a Nodemailer transporter.
 * Uses Gmail SMTP when SMTP_USER + SMTP_PASS are set, otherwise returns null.
 */
function createTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    console.warn("[Email] SMTP_USER or SMTP_PASS not configured");
    return null;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user)) {
    console.error(`[Email] Invalid SMTP_USER email format: ${user}`);
    return null;
  }

  console.log(`[Email] Creating Gmail SMTP transporter for: ${user}`);

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Send an email with proper error handling and logging.
 * Returns detailed result object for debugging.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[Email] ❌ No SMTP provider configured — email not sent");
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    return {
      success: false,
      error: "No SMTP provider configured",
      provider: "none",
    };
  }

  try {
    console.log(`[Email] 📧 Attempting to send email to: ${options.to}`);
    console.log(`[Email] Subject: ${options.subject}`);

    const info: SMTPTransport.SentMessageInfo = await transporter.sendMail({
      from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] ✅ Email sent successfully`);
    console.log(`[Email] Message ID: ${info.messageId}`);
    console.log(`[Email] Response: ${info.response}`);

    return {
      success: true,
      messageId: info.messageId,
      provider: "gmail",
    };
  } catch (error) {
    console.error(`[Email] ❌ Failed to send email to: ${options.to}`);
    
    if (error instanceof Error) {
      console.error(`[Email] Error: ${error.message}`);
      
      // Check for common Gmail SMTP errors
      if (error.message.includes("Invalid login")) {
        console.error("[Email] ⚠️  Gmail authentication failed. Check SMTP_USER and SMTP_PASS");
        console.error("[Email] ⚠️  Make sure you're using an App Password, not your regular Gmail password");
        console.error("[Email] ⚠️  Generate one at: https://myaccount.google.com/apppasswords");
      } else if (error.message.includes("550")) {
        console.error("[Email] ⚠️  Recipient email rejected by Gmail");
      } else if (error.message.includes("Daily sending quota")) {
        console.error("[Email] ⚠️  Gmail daily sending limit exceeded");
      } else if (error.message.includes("ECONNECTION") || error.message.includes("ETIMEDOUT")) {
        console.error("[Email] ⚠️  Network connection issue - check internet or firewall");
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      provider: "gmail",
    };
  }
}

/**
 * Validate SMTP configuration on startup
 */
export async function validateEmailConfig(): Promise<{
  configured: boolean;
  valid: boolean;
  error?: string;
}> {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return {
      configured: false,
      valid: false,
      error: "SMTP_USER or SMTP_PASS not set",
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      configured: true,
      valid: false,
      error: "Failed to create SMTP transporter",
    };
  }

  try {
    await transporter.verify();
    console.log("[Email] ✅ SMTP configuration validated successfully");
    return { configured: true, valid: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Email] ❌ SMTP configuration validation failed: ${errorMsg}`);
    return {
      configured: true,
      valid: false,
      error: errorMsg,
    };
  }
}
