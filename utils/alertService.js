// utils/alertService.js
const nodemailer = require('nodemailer');
const axios = require('axios');

// Email transporter config (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASSWORD,
  },
});

// Send email alert
const sendEmailAlert = async (wallet, riskScore) => {
  const mailOptions = {
    from: process.env.ALERT_EMAIL,
    to: process.env.ALERT_RECEIVER,
    subject: '🚨 High-Risk Wallet Detected',
    text: `Wallet ${wallet} flagged with risk score ${riskScore}. Immediate attention needed.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Email alert sent.');
  } catch (err) {
    console.error('❌ Email alert failed:', err.message);
  }
};

// Send webhook alert (e.g., Discord, Slack)
const sendWebhookAlert = async (wallet, riskScore) => {
  const payload = {
    content: `🚨 High-Risk Wallet: \`${wallet}\` with score \`${riskScore}\``
  };

  try {
    await axios.post(process.env.ALERT_WEBHOOK_URL, payload);
    console.log('🌐 Webhook alert sent.');
  } catch (err) {
    console.error('❌ Webhook alert failed:', err.message);
  }
};

// Combined alert sender
const sendCombinedAlerts = async (wallet, riskScore) => {
  await Promise.all([
    sendEmailAlert(wallet, riskScore),
    sendWebhookAlert(wallet, riskScore)
  ]);
};

module.exports = {
  sendEmailAlert,
  sendWebhookAlert,
  sendCombinedAlerts
};
