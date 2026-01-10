const { sendNotificationEmail } = require('./src/services/emailService');
require('dotenv').config();

async function testEmail() {
    const user = process.env.SMTP_USER;
    if (!user) {
        console.error("❌ ERROR: SMTP_USER is not defined in .env");
        return;
    }

    console.log(`📧 Attempting to send test email from ${user} to ${user}...`);

    const result = await sendNotificationEmail(
        user,
        "Orbix Test Email",
        "This is a test email to verify your SMTP configuration is working."
    );

    if (result.success) {
        console.log("✅ SUCCESS: Test email sent!");
        console.log("Check your inbox (and spam folder).");
    } else {
        console.error("❌ FAILED: Could not send email.");
        console.error("Error details:", result.error);
        console.log("\nTroubleshooting Tips:");
        console.log("1. Check if SMTP_USER and SMTP_PASS are correct in .env");
        console.log("2. Ensure you are using an APP PASSWORD, not your login password.");
        console.log("3. Make sure 2-Step Verification is enabled on your Google Account to generate App Passwords.");
    }
}

testEmail();
