import { NextResponse } from "next/server";
import { sendEmail, validateEmailConfig } from "@/lib/email/send-email";

/**
 * Test email endpoint - DEVELOPMENT ONLY
 * Send a test email to verify SMTP configuration
 * 
 * POST /api/debug/test-email
 * Body: { "to": "recipient@example.com" }
 */
export async function POST(request: Request) {
  // Only allow in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { to } = body;

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'to' email address" },
        { status: 400 }
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("🧪 EMAIL TEST STARTED");
    console.log("=".repeat(60));

    // Validate configuration first
    console.log("\n📋 Step 1: Validating SMTP Configuration...");
    const configValidation = await validateEmailConfig();
    console.log(`  Configured: ${configValidation.configured}`);
    console.log(`  Valid: ${configValidation.valid}`);
    if (configValidation.error) {
      console.log(`  Error: ${configValidation.error}`);
    }

    // Check environment variables
    console.log("\n🔧 Step 2: Environment Variables:");
    console.log(`  SMTP_USER: ${process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : "NOT SET"}`);
    console.log(`  SMTP_PASS: ${process.env.SMTP_PASS ? "***SET***" : "NOT SET"}`);
    console.log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || "NOT SET (using default)"}`);

    // Send test email
    console.log(`\n📧 Step 3: Sending test email to: ${to}...`);
    const result = await sendEmail({
      to,
      subject: "Test Email from Smart Syllabus Planner",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 20px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #10B981; margin-top: 0;">✅ Email Test Successful!</h1>
    <p>This is a test email from your Smart Syllabus Planner application.</p>
    <p><strong>Configuration:</strong></p>
    <ul>
      <li>SMTP Provider: Gmail</li>
      <li>Sender: ${process.env.SMTP_USER}</li>
      <li>Timestamp: ${new Date().toISOString()}</li>
    </ul>
    <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      If you received this email, your email configuration is working correctly! 🎉
    </p>
  </div>
</body>
</html>`,
    });

    console.log("\n" + "=".repeat(60));
    console.log("🧪 EMAIL TEST COMPLETED");
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      provider: result.provider,
      config: {
        smtp_user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***@${process.env.SMTP_USER.split('@')[1]}` : "NOT SET",
        smtp_pass_set: !!process.env.SMTP_PASS,
        app_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000 (default)",
        node_env: process.env.NODE_ENV,
      },
      validation: configValidation,
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check email configuration without sending
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  const validation = await validateEmailConfig();

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    smtp_configured: validation.configured,
    smtp_valid: validation.valid,
    smtp_user: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***@${process.env.SMTP_USER.split('@')[1]}` : "NOT SET",
    smtp_pass_set: !!process.env.SMTP_PASS,
    app_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000 (default)",
    error: validation.error,
    instructions: {
      test_email: "POST /api/debug/test-email with { \"to\": \"your@email.com\" }",
      check_logs: "Check server console for detailed logging",
      gmail_setup: "Generate App Password at https://myaccount.google.com/apppasswords",
    },
  });
}
