const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { sendEmailAlert } = require('../utils/emailAlert');
const { alertServices } = require('../utils/alertService');
const { sendMessage } = require('../utils/producer');

router.post('/', async (req, res) => {
  const payload = req.body;
  console.log('🚨 /api/reports HIT');
  console.log('📦 Payload:', JSON.stringify(payload));

  try {
    if (Array.isArray(payload)) {
      console.log('📝 Inserting multiple reports...');
      const savedReports = await Report.insertMany(payload);
      console.log(`✅ Inserted ${savedReports.length} reports`);

      // Fire-and-forget parallel post-processing
      for (const report of savedReports) {
        (async () => {
          try {
            console.log(`📡 Publishing Kafka for report ${report._id}`);
            await sendMessage('fraud-reports', {
              wallet: report.wallet,
              reason: report.reason,
              severity: report.severity,
              reportId: report._id,
              createdAt: report.createdAt
            });

            if (report.severity >= 4) {
              console.log(`✉️ Sending email alert for severity ${report.severity}`);
              await sendEmailAlert({
                to: process.env.ALERT_EMAIL,
                subject: 'High Severity Fraud Report',
                text: `High severity report submitted:\nWallet: ${report.wallet}\nReason: ${report.reason}`
              });
            }

            if (report.riskLevel === 'high') {
              console.log(`🚨 Triggering alert service for report ${report._id}`);
              await alertServices(report.wallet, report._id);
            }
          } catch (err) {
            console.error(`❌ Error in post-processing for report ${report._id}:`, err);
          }
        })();
      }

      res.status(201).json({
        message: 'Reports created successfully',
        reports: savedReports
      });
    } else {
      console.log('📝 Inserting single report...');
      const report = new Report(payload);
      await report.save();
      console.log(`✅ Report ${report._id} saved`);

      // Fire-and-forget post-processing
      (async () => {
        try {
          console.log(`📡 Publishing Kafka for report ${report._id}`);
          await sendMessage('fraud-reports', {
            wallet: report.wallet,
            reason: report.reason,
            severity: report.severity,
            reportId: report._id,
            createdAt: report.createdAt
          });

          if (report.severity >= 4) {
            console.log(`✉️ Sending email alert for severity ${report.severity}`);
            await sendEmailAlert({
              to: process.env.ALERT_EMAIL,
              subject: 'High Severity Fraud Report',
              text: `High severity report submitted:\nWallet: ${report.wallet}\nReason: ${report.reason}`
            });
          }

          if (report.riskLevel === 'high') {
            console.log(`🚨 Triggering alert service for report ${report._id}`);
            await alertServices(report.wallet, report._id);
          }
        } catch (err) {
          console.error(`❌ Error in post-processing for report ${report._id}:`, err);
        }
      })();

      res.status(201).json({
        message: 'Report created successfully',
        report
      });
    }
  } catch (error) {
    console.error('❌ Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

module.exports = router;
