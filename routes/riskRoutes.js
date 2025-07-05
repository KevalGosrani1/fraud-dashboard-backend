const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

router.get('/:wallet', auth, async (req, res) => {
  const { wallet } = req.params;
  const reports = await Report.find({ wallet });

  const totalSeverity = reports.reduce((acc, r) => acc + r.severity, 0);
  const riskLevel = totalSeverity > 15 ? 'High' : totalSeverity > 5 ? 'Medium' : 'Low';

  res.json({ wallet, riskLevel, totalReports: reports.length });
});

module.exports = router;

const RiskModel = require('../models/RiskModel');

router.get('/:wallet', async (req, res) => {
  try {
    const risk = await RiskModel.findOne({ wallet: req.params.wallet.toLowerCase() });
    if (!risk) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ wallet: risk.wallet, riskScore: risk.riskScore, flagged: risk.flagged });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
