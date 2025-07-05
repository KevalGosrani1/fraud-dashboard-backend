const Report = require('../models/Report');

exports.getRiskLevel = async (req, res) => {
  try {
    const { wallet } = req.params;
    const reports = await Report.find({ wallet });

    if (reports.length === 0) {
      return res.json({ wallet, riskLevel: "None", totalReports: 0 });
    }

    const totalSeverity = reports.reduce((sum, r) => sum + r.severity, 0);

    let riskLevel = "Low";
    if (totalSeverity > 10 || reports.length >= 3) {
      riskLevel = "High";
    } else if (totalSeverity >= 5) {
      riskLevel = "Medium";
    }

    res.json({ wallet, riskLevel, totalReports: reports.length, totalSeverity });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate risk" });
  }
};
