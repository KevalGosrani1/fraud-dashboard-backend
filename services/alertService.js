// services/alertService.js
const axios = require('axios');
const { Kafka } = require('kafkajs');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const Log = require('../models/Log');

// Brevo Email Setup
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

// Kafka Setup
const kafkaEnabled = process.env.KAFKA_ENABLED === 'true';
let producer = null;
let consumer = null;
const inMemoryQueue = [];

if (kafkaEnabled) {
  const kafka = new Kafka({
    clientId: 'fraud-dashboard',
    brokers: ['localhost:9092'],
  });

  producer = kafka.producer();
  consumer = kafka.consumer({ groupId: 'fraud-dashboard-group' });

  (async () => {
    try {
      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({ topic: 'high-risk-alerts', fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(`💬 [Kafka Consumer] Received: ${message.value.toString()}`);
        },
      });

      console.log('✅ Kafka consumer connected');
    } catch (err) {
      console.error('❌ Kafka error:', err.message);
    }
  })();
} else {
  console.warn('⚠️ Kafka disabled — using in-memory fallback.');
}

// Core pipeline function
async function alertPipeline(walletAddress, reportId) {
  const payload = {
    walletAddress,
    reportId,
    triggeredAt: new Date().toISOString(),
  };

  try {
    await Promise.all([
      sendWebhook(payload),
      sendBrevoEmail(walletAddress, reportId),
      Log.create({ type: 'high-risk-trigger', payload, createdAt: new Date() }),
    ]);

    if (kafkaEnabled && producer) {
      await producer.send({
        topic: 'high-risk-alerts',
        messages: [{ value: JSON.stringify(payload) }],
      });
      console.log('📤 [Kafka] Alert published');
    } else {
      inMemoryQueue.push(payload);
      console.log(`📥 [In-Memory] Alert queued. Queue length: ${inMemoryQueue.length}`);
    }

    console.log(`[✅ AlertPipeline] Processed for wallet ${walletAddress}`);
  } catch (err) {
    console.error('❌ [AlertPipeline] Failed:', err.message);
  }
}

// Simulated consumer for in-memory queue (only in dev)
setInterval(() => {
  if (!kafkaEnabled && inMemoryQueue.length > 0) {
    const payload = inMemoryQueue.shift();
    console.log('💬 [In-Memory Consumer] Processed message:', payload);
  }
}, 5000);

// Webhook alert
async function sendWebhook(payload) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return console.warn('[Webhook] Skipped: No WEBHOOK_URL set.');

  try {
    await axios.post(webhookUrl, payload);
    console.log('[Webhook] Sent.');
  } catch (err) {
    console.error('[Webhook] Failed:', err.message);
  }
}

// Brevo Email alert
async function sendBrevoEmail(walletAddress, reportId) {
  if (!process.env.ALERT_RECIPIENT_EMAIL || !process.env.ALERT_SENDER_EMAIL) {
    return console.warn('[Brevo] Missing sender/recipient email in .env');
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const email = {
    to: [{ email: process.env.ALERT_RECIPIENT_EMAIL }],
    sender: { email: process.env.ALERT_SENDER_EMAIL, name: 'Fraud Dashboard' },
    subject: '🚨 High-Risk Wallet Alert',
    htmlContent: `
      <h2>High-Risk Wallet Detected</h2>
      <p><strong>Wallet:</strong> ${walletAddress}</p>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(email);
    console.log('[Brevo] Email sent');
  } catch (err) {
    console.error('[Brevo] Failed to send email:', err.message);
  }
}

module.exports = { alertPipeline };
