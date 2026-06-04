import nodemailer from "nodemailer";

const APP_NAME = "Smart Syllabus Planner";

/**
 * Create a Nodemailer transporter.
 * Uses Gmail SMTP when SMTP_USER + SMTP_PASS are set, otherwise returns null.
 */
function createTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Send an email. Returns true on success, false if no provider is configured.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[Email] No SMTP provider configured — email not sent.");
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    return false;
  }

  await transporter.sendMail({
    from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return true;
}
