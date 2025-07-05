// utils/emailAlert.js
const axios = require('axios');
const nodemailer = require('nodemailer');
const AlertLog = require('../models/AlertLog'); // optional Mongo logging

const brevoSMTP = {
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER, // e.g. verified sender email
    pass: process.env.BREVO_PASS,
  },
};

// Set up transporter
const transporter = nodemailer.createTransport(brevoSMTP);

/**
 * Send email + webhook alert
 */
async function sendEmailAlert({ wallet, reason, severity }) {
  const subject = `[ALERT] High-Risk Wallet Reported: ${wallet}`;
  const message = `
🚨 **New High Severity Report**
Wallet: ${wallet}
Reason: ${reason}
Severity: ${severity}
Timestamp: ${new Date().toISOString()}
  `;

  // 1. Send email to multiple recipients
  const mailOptions = {
    from: `"Fraud Monitor" <${process.env.BREVO_USER}>`,
    to: process.env.ALERT_RECIPIENTS, // comma-separated: admin1@example.com,admin2@org.com
    subject,
    text: message,
  };

  // 2. Optional: webhook
  const webhookPayload = {
    type: 'fraud_alert',
    wallet,
    reason,
    severity,
    timestamp: new Date().toISOString(),
  };

  try {
    // Email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email alert sent');

    // Webhook
    if (process.env.ALERT_WEBHOOK_URL) {
      await axios.post(process.env.ALERT_WEBHOOK_URL, webhookPayload);
      console.log('✅ Webhook triggered');
    }

    // Optional DB logging
    await AlertLog.create({
      wallet,
      reason,
      severity,
      sentAt: new Date(),
      method: ['email', 'webhook'],
    });

  } catch (err) {
    console.error('❌ Alert failed:', err.message);
  }
}

module.exports = { sendEmailAlert };
