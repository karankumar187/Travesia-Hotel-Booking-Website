import transporter from "../configs/nodemailer.js";

// Test email endpoint
// POST /api/test-email
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required"
      });
    }

    // Check if transporter is available
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: "Email transporter not configured",
        error: "Please configure SMTP_USER and SMTP_PASS in your .env file",
        instructions: {
          gmail: "1. Set SMTP_USER=your-email@gmail.com\n2. Set SMTP_PASS=your-app-password\n3. Set SENDER_EMAIL=your-email@gmail.com",
          outlook: "1. Set SMTP_PROVIDER=outlook\n2. Set SMTP_USER=your-email@outlook.com\n3. Set SMTP_PASS=your-password\n4. Set SENDER_EMAIL=your-email@outlook.com"
        }
      });
    }

    const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;

    if (!senderEmail) {
      return res.status(500).json({
        success: false,
        message: "Sender email not configured",
        error: "Please set SENDER_EMAIL or SMTP_USER in your .env file"
      });
    }

    console.log(`📤 Sending test email from: ${senderEmail} to: ${email}`);

    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: "Test Email - Hotel Booking System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3399cc;">✅ Test Email Successful!</h2>
          <p>This is a test email from your Hotel Booking System.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Test email sent successfully to ${email}`);
    console.log("Email Response:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
      email: email,
      messageId: info.messageId
    });

  } catch (error) {
    console.error("❌ Failed to send test email");
    console.error("Error Details:", {
      message: error.message,
      code: error.code,
      response: error.response
    });

    let errorMessage = "Failed to send test email";
    let errorDetails = {};

    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed - Check your SMTP credentials";
      errorDetails = {
        issue: "Invalid SMTP_USER or SMTP_PASS",
        solution: "For Gmail: Use App Password (not regular password). Generate at: https://myaccount.google.com/apppasswords"
      };
    } else if (error.code === 'EENVELOPE') {
      errorMessage = "Invalid email address";
      errorDetails = {
        issue: "The recipient email address is invalid",
        solution: "Check the email address format"
      };
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = "Connection error";
      errorDetails = {
        issue: "Cannot connect to SMTP server",
        solution: "Check your internet connection and SMTP settings"
      };
    } else {
      errorDetails = {
        message: error.message,
        code: error.code
      };
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorDetails
    });
  }
};

