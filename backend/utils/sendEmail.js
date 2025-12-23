import nodemailer from "nodemailer";

// ============ EMAIL CONFIGURATION ============
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log(`\n📧 Email Configuration:`);
    console.log(`   User: ${process.env.EMAIL_USER || "noreply@aurie.com"}`);
    console.log(`   Password configured: ${!!process.env.EMAIL_PASS}`);
    console.log(`   Service: Gmail SMTP\n`);

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "noreply@aurie.com",
        pass: process.env.EMAIL_PASS || "demo-password",
      },
    });

    // Verify transporter connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email service verification failed:", error.message);
        console.error("⚠️  Email sending may not work until credentials are fixed");
        console.log("📖 Fix: See EMAIL_FIX_GUIDE.md for instructions");
      } else {
        console.log("✅ Email service ready to send emails");
      }
    });
  }
  return transporter;
};

// ============ SEND EMAIL ============
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = getTransporter();
    
    console.log(`\n📧 [EMAIL] Sending to: ${to}`);
    console.log(`📧 [EMAIL] Subject: ${subject}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@aurie.com",
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL] Sent successfully!");
    console.log("✅ [EMAIL] Response:", result.response);
    console.log("✅ [EMAIL] Message ID:", result.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (err) {
    console.error("\n❌ [EMAIL] Sending failed!");
    console.error("❌ [EMAIL] Error:", err.message);
    console.error("❌ [EMAIL] Code:", err.code);
    
    if (err.message.includes("Username and Password not accepted")) {
      console.error("❌ [EMAIL] Gmail credentials invalid - check .env EMAIL_USER and EMAIL_PASS");
      console.error("📖 Fix: See EMAIL_FIX_GUIDE.md for instructions");
    }
    
    if (err.response) {
      console.error("❌ [EMAIL] SMTP Response:", err.response);
    }
    
    return { 
      success: false, 
      message: `Email delivery failed: ${err.message}`,
      error: err.message 
    };
  }
};

// ============ SEND OTP EMAIL ============
export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Welcome to Aurie Candles!</h2>
      <p>Your email verification code is:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #d97706; margin: 0; letter-spacing: 2px;">${otp}</h1>
      </div>
      <p style="color: #666;">This code will expire in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  console.log(`\n📧 [OTP] Generating email for: ${email}`);
  console.log(`📧 [OTP] Code: ${otp}`);
  
  return sendEmail(email, "Aurie Candles - Email Verification", html);
};
