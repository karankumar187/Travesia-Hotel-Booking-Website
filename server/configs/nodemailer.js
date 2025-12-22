import nodemailer from 'nodemailer'

// Support multiple SMTP providers (Gmail, Outlook, custom SMTP)
// Set SMTP_PROVIDER in .env: 'gmail', 'outlook', or 'custom'
// Auto-detect based on email domain
let smtpProvider = process.env.SMTP_PROVIDER;
if (!smtpProvider && process.env.SMTP_USER) {
  const email = process.env.SMTP_USER.toLowerCase();
  if (email.includes('@gmail.')) {
    smtpProvider = 'gmail';
  } else if (email.includes('@outlook.') || email.includes('@hotmail.') || 
      email.includes('@live.') || email.includes('@msn.')) {
    smtpProvider = 'outlook';
  }
}
smtpProvider = smtpProvider || 'gmail'; // Default to Gmail

let smtpConfig = {};

if (smtpProvider === 'gmail') {
  // Gmail SMTP Configuration
  smtpConfig = {
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Gmail App Password (not regular password)
    },
  };
  console.log("📧 Using Gmail SMTP");
} else if (smtpProvider === 'outlook') {
  // Outlook/Hotmail SMTP Configuration
  smtpConfig = {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER, // Your Outlook email (e.g., yourname@outlook.com)
      pass: process.env.SMTP_PASS, // Your Outlook password
    },
    tls: {
      ciphers: 'SSLv3'
    }
  };
  console.log("📧 Using Outlook SMTP");
} else {
  // Custom SMTP Configuration
  smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
  console.log(`📧 Using Custom SMTP: ${smtpConfig.host}`);
}

// Check if credentials are provided before creating transporter
const hasCredentials = process.env.SMTP_USER && process.env.SMTP_PASS;

if (!hasCredentials) {
  console.error("\n❌ EMAIL CONFIGURATION MISSING!");
  console.error("==========================================");
  console.error("SMTP_USER:", process.env.SMTP_USER ? "✅ Set" : "❌ NOT SET");
  console.error("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Set" : "❌ NOT SET");
  console.error("\n💡 To enable email sending, add these to your .env file:");
  console.error("\nFor Gmail:");
  console.error("  SMTP_USER=your-email@gmail.com");
  console.error("  SMTP_PASS=your-16-char-app-password");
  console.error("  SENDER_EMAIL=your-email@gmail.com");
  console.error("\nFor Outlook:");
  console.error("  SMTP_PROVIDER=outlook");
  console.error("  SMTP_USER=your-email@outlook.com");
  console.error("  SMTP_PASS=your-password");
  console.error("  SENDER_EMAIL=your-email@outlook.com");
  console.error("\n📖 Gmail App Password Guide:");
  console.error("   https://myaccount.google.com/apppasswords");
  console.error("==========================================\n");
}

const transporter = hasCredentials ? nodemailer.createTransport(smtpConfig) : null;

// Verify transporter configuration
if (transporter) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("\n❌ SMTP Configuration Error:", error.message);
      console.error("\n💡 Setup Instructions:");
      if (smtpProvider === 'gmail') {
        console.error("For Gmail:");
        console.error("1. Enable 2-Step Verification in your Google Account");
        console.error("2. Generate an App Password: https://myaccount.google.com/apppasswords");
        console.error("3. Use the App Password (16 characters) as SMTP_PASS");
        console.error("4. Set SMTP_USER to your Gmail address");
        console.error("\nCurrent Config:");
        console.error(`SMTP_PROVIDER: ${process.env.SMTP_PROVIDER || 'auto-detected as gmail'}`);
        console.error(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
        console.error(`SMTP_PASS: ${process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET'}`);
      } else if (smtpProvider === 'outlook') {
        console.error("For Outlook:");
        console.error("1. Set SMTP_PROVIDER=outlook in .env (or it will auto-detect from your email)");
        console.error("2. Set SMTP_USER to your Outlook email (e.g., yourname@outlook.com)");
        console.error("3. Set SMTP_PASS to your Outlook account password");
        console.error("4. Set SENDER_EMAIL to your Outlook email");
        console.error("\nNote: If you have 2FA enabled, you may need to use an App Password");
        console.error("Get App Password: https://account.microsoft.com/security");
        console.error("\nCurrent Config:");
        console.error(`SMTP_PROVIDER: ${process.env.SMTP_PROVIDER || 'auto-detected as outlook'}`);
        console.error(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
        console.error(`SMTP_PASS: ${process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET'}`);
      } else {
        console.error("For Custom SMTP:");
        console.error("1. Set SMTP_PROVIDER=custom in .env");
        console.error("2. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
      }
    } else {
      console.log(`\n✅ SMTP Server (${smtpProvider}) is ready to send emails`);
      console.log(`📧 Using: ${smtpProvider === 'gmail' ? 'Gmail' : smtpProvider === 'outlook' ? 'Outlook' : 'Custom'} SMTP`);
      console.log(`📤 Sender Email: ${process.env.SENDER_EMAIL || process.env.SMTP_USER}\n`);
    }
  });
} else {
  console.warn("⚠️  Email transporter not created - emails will not be sent until SMTP credentials are configured\n");
}

export default transporter