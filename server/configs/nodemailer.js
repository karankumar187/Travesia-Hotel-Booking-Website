import nodemailer from 'nodemailer'

// Auto-detect SMTP provider from email domain if not set explicitly
let smtpProvider = process.env.SMTP_PROVIDER;
if (!smtpProvider && process.env.SMTP_USER) {
  const email = process.env.SMTP_USER.toLowerCase();
  if (email.includes('@gmail.')) {
    smtpProvider = 'gmail';
  } else if (
    email.includes('@outlook.') || email.includes('@hotmail.') ||
    email.includes('@live.') || email.includes('@msn.')
  ) {
    smtpProvider = 'outlook';
  }
}
smtpProvider = smtpProvider || 'gmail';

let smtpConfig = {};

if (smtpProvider === 'gmail') {
  smtpConfig = {
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
  console.log("📧 Using Gmail SMTP");

} else if (smtpProvider === 'outlook') {
  // Use STARTTLS on port 587 — SSLv3 ciphers are rejected by modern Node.js
  smtpConfig = {
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
  console.log("📧 Using Outlook SMTP");

} else {
  smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
  console.log(`📧 Using Custom SMTP: ${smtpConfig.host}`);
}

const hasCredentials = process.env.SMTP_USER && process.env.SMTP_PASS;

if (!hasCredentials) {
  console.warn("⚠️  SMTP_USER or SMTP_PASS not set — emails will be skipped.");
}

let transporter = null;

if (hasCredentials) {
  try {
    transporter = nodemailer.createTransport(smtpConfig);

    // IMPORTANT: Non-blocking verify — must NOT crash the server on SSL errors.
    // Using .then/.catch instead of callback to prevent uncaught promise rejection.
    transporter.verify()
      .then(() => {
        console.log(`✅ SMTP (${smtpProvider}) ready — ${process.env.SENDER_EMAIL || process.env.SMTP_USER}`);
      })
      .catch((err) => {
        console.warn(`⚠️  SMTP verify warning (emails may not send): ${err.message}`);
        // Do NOT throw — this must not affect HTTP request handling
      });

  } catch (err) {
    console.warn(`⚠️  Failed to initialize SMTP transporter: ${err.message}`);
    transporter = null;
  }
}

export default transporter;