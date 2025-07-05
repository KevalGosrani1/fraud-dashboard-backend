const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { Parser } = require('json2csv');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/reports/export?format=csv|json&...
router.get('/export', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      wallet,
      severity,
      fromDate,
      toDate,
      status,
      riskLevel,
      format = 'csv'
    } = req.query;

    const query = {};

    if (wallet) query.wallet = wallet;
    if (severity) query.severity = Number(severity);
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // ✅ Fetch reports from database
    const reports = await Report.find(query).sort({ createdAt: -1 }).lean();

    if (reports.length === 0) {
      return res.status(404).json({ error: 'No reports found to export.' });
    }

    // ✅ Cleaned reports with defaults to prevent blank cells
    const cleanedReports = reports.map(r => ({
      _id: r._id,
      wallet: r.wallet || "N/A",
      severity: r.severity ?? "N/A",
      riskLevel: r.riskLevel || "N/A",
      status: r.status || "N/A",
      reason: r.reason || "N/A",
      createdAt: r.createdAt ? r.createdAt.toISOString() : "N/A"
    }));

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json(cleanedReports);
    }

    // ✅ Define CSV fields
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Wallet', value: 'wallet' },
      { label: 'Severity', value: 'severity' },
      { label: 'Risk Level', value: 'riskLevel' },
      { label: 'Status', value: 'status' },
      { label: 'Reason', value: 'reason' },
      { label: 'Created At', value: 'createdAt' }
    ];

    // ✅ Parse reports to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(cleanedReports);

    res.header('Content-Type', 'text/csv');
    res.attachment(`fraud_reports_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('❌ Export error:', err);
    res.status(500).json({ error: 'Failed to export reports' });
  }
});

module.exports = router;
