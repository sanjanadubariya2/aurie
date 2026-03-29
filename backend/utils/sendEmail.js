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
      // ⏱️ TIMEOUT & CONNECTION FIXES
      connectionTimeout: 10000,  // 10 seconds to connect
      socketTimeout: 10000,      // 10 seconds for socket operations
      pool: {
        maxConnections: 5,       // Reuse connections
        maxMessages: 100,        // Send 100 emails per connection
        rateDelta: 1000,         // 1 second between emails
        rateLimit: 5,            // 5 emails per second max
      },
      logger: false,
      debug: false,
    });

    // Verify transporter connection (non-blocking)
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

// ============ RETRY LOGIC ============
const sendWithRetry = async (mailOptions, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 [EMAIL] Attempt ${attempt}/${maxRetries}: Sending to ${mailOptions.to}...`);
      const transporter = getTransporter();
      const result = await transporter.sendMail(mailOptions);
      return { success: true, result, attempt };
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
      
      if (attempt < maxRetries) {
        const delay = delayMs * attempt; // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// ============ SEND EMAIL ============
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@aurie.com",
      to,
      subject,
      html,
    };

    const { success, result, attempt } = await sendWithRetry(mailOptions);
    
    console.log(`✅ [EMAIL] Sent successfully on attempt ${attempt}!`);
    console.log(`✅ [EMAIL] Response: ${result.response}`);
    console.log(`✅ [EMAIL] Message ID: ${result.messageId}`);
    
    return { success: true, message: "Email sent successfully" };
  } catch (err) {
    console.error("\n❌ [EMAIL] Sending failed after retries!");
    console.error("❌ [EMAIL] Error:", err.message);
    console.error("❌ [EMAIL] Code:", err.code);
    
    if (err.message.includes("Username and Password not accepted")) {
      console.error("❌ [EMAIL] Gmail credentials invalid - check .env EMAIL_USER and EMAIL_PASS");
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

// ============ SEND ORDER PLACED NOTIFICATION TO ADMIN ============
export const sendOrderPlacedNotificationToAdmin = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurie.com";
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 10px;">🎉 New Order Placed!</h2>
      
      <p style="font-size: 16px; margin: 20px 0;"><strong>Order ID:</strong> ${order.id || 'N/A'}</p>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Customer Details</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Phone:</strong> ${order.customerPhone}</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Shipping Address</h3>
        <p><strong>${order.shippingAddress.fullName}</strong></p>
        <p>${order.shippingAddress.address}</p>
        <p>${order.shippingAddress.pincode} | ${order.shippingAddress.phone}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #1f2937;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Order Summary</h3>
        <p style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>₹${order.subtotal}</span></p>
        <p style="display: flex; justify-content: space-between;"><span>Discount:</span> <span>-₹${order.discount}</span></p>
        <p style="display: flex; justify-content: space-between;"><span>Shipping:</span> <span>₹${order.shipping}</span></p>
        <p style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #d97706; padding-top: 10px; margin-top: 10px;">
          <span>Total:</span> <span style="color: #d97706;">₹${order.total}</span>
        </p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
        <p style="margin: 0;"><strong>⏳ Status:</strong> <span style="color: #92400e; font-weight: bold;">Order Placed - Awaiting Confirmation</span></p>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">Please confirm this order in your admin dashboard</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://admin.aurie.com'}/orders" style="background-color: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          View in Admin Dashboard
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center;">Payment Method: ${order.paymentMethod}</p>
      <p style="color: #999; font-size: 12px; text-align: center;">Payment Status: ${order.paymentStatus.toUpperCase()}</p>
    </div>
  `;

  console.log(`\n📧 [ORDER] Sending order placed notification to admin: ${adminEmail}`);
  return sendEmail(adminEmail, `🎉 New Order Placed - ${order.customerName}`, html);
};

// ============ SEND ORDER CONFIRMATION TO CUSTOMER ============
export const sendOrderConfirmationToCustomer = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">x${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 10px;">✅ Your Order is Confirmed!</h2>
      
      <p style="font-size: 16px; margin: 20px 0;">Hi ${order.customerName},</p>
      <p style="font-size: 14px; line-height: 1.6;">Thank you for your order! Your order has been confirmed and we're now preparing it for shipment.</p>
      
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <p style="margin: 0;"><strong>✅ Order Confirmed</strong></p>
        <p style="margin: 5px 0 0 0; color: #166534; font-size: 14px;">Order ID: <strong>${order.id || 'N/A'}</strong></p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Delivery Address</h3>
        <p><strong>${order.shippingAddress.fullName}</strong></p>
        <p>${order.shippingAddress.address}</p>
        <p>${order.shippingAddress.pincode} | ${order.shippingAddress.phone}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #1f2937;">Your Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Order Summary</h3>
        <p style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>₹${order.subtotal}</span></p>
        <p style="display: flex; justify-content: space-between;"><span>Discount:</span> <span>-₹${order.discount}</span></p>
        <p style="display: flex; justify-content: space-between;"><span>Shipping:</span> <span>₹${order.shipping}</span></p>
        <p style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #d97706; padding-top: 10px; margin-top: 10px;">
          <span>Total:</span> <span style="color: #d97706;">₹${order.total}</span>
        </p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
        <p style="margin: 0;"><strong>📦 Next Steps:</strong></p>
        <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">We'll prepare your order and send you a tracking number soon. You'll receive an email update when your order ships.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <a href="${process.env.CUSTOMER_DASHBOARD_URL || 'https://aurie.com'}/account" style="background-color: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Your Order
        </a>
      </div>
      
      <p style="color: #666; font-size: 13px; line-height: 1.6;">If you have any questions about your order, please don't hesitate to contact us.</p>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">Thank you for shopping with Aurie Candles!</p>
    </div>
  `;

  console.log(`\n📧 [ORDER] Sending order confirmation to customer: ${order.customerEmail}`);
  return sendEmail(order.customerEmail, `✅ Your Order is Confirmed! - Order #${(order.id || 'N/A').slice(-6).toUpperCase()}`, html);
};

