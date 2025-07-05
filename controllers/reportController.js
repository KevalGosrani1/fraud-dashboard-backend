const Report = require('../models/Report');
const { sendMessage } = require('../utils/producer');

exports.submitReport = async (req, res) => {
  try {
    const { wallet, reason, severity } = req.body;
    const report = new Report({ wallet, reason, severity });
    await report.save();

    // ✅ Kafka publish
    await sendMessage('fraud-reports', {
      wallet: report.wallet,
      reason: report.reason,
      severity: report.severity,
      reportId: report._id,
      createdAt: report.createdAt
    });

    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.getWalletRisk = async (req, res) => {
  const { wallet } = req.params;
  try {
    const reports = await Report.find({ wallet });
    let riskLevel = 'low';
    if (reports.length > 5) {
      riskLevel = 'high';
    } else if (reports.length > 2) {
      riskLevel = 'medium';
    }
    res.json({ wallet, riskLevel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assess risk' });
  }
};
