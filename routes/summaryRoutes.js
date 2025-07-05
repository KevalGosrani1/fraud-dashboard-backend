const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/reports/summary
router.get('/summary', authMiddleware, adminOnly, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Count total reports
    const totalReportsPromise = Report.countDocuments();

    // Count reports created today
    const reportsTodayPromise = Report.countDocuments({
      createdAt: { $gte: todayStart }
    });

    // Count by severity buckets
    const severityBucketsPromise = Report.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ["$severity", 3] }, then: "low" },
                {
                  case: {
                    $and: [
                      { $gte: ["$severity", 4] },
                      { $lte: ["$severity", 6] }
                    ]
                  },
                  then: "medium"
                },
                { case: { $gte: ["$severity", 7] }, then: "high" }
              ],
              default: "unknown"
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Find latest report date
    const latestReportPromise = Report.findOne()
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const [totalReports, reportsToday, severityBuckets, latestReport] = await Promise.all([
      totalReportsPromise,
      reportsTodayPromise,
      severityBucketsPromise,
      latestReportPromise
    ]);

    const counts = { lowRiskCount: 0, mediumRiskCount: 0, highRiskCount: 0 };
    severityBuckets.forEach(b => {
      if (b._id === 'low') counts.lowRiskCount = b.count;
      if (b._id === 'medium') counts.mediumRiskCount = b.count;
      if (b._id === 'high') counts.highRiskCount = b.count;
    });

    res.json({
      totalReports,
      reportsToday,
      ...counts,
      latestReportDate: latestReport?.createdAt || null
    });
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// GET /api/reports/dailyCounts
router.get('/dailyCounts', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { days } = req.query;
    const daysNum = parseInt(days, 10) || 30;

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - daysNum);
    startDate.setUTCHours(0, 0, 0, 0);

    const counts = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(
      counts.map(d => ({
        date: d._id,
        count: d.count
      }))
    );
  } catch (err) {
    console.error('Error generating dailyCounts:', err);
    res.status(500).json({ error: 'Failed to generate daily counts' });
  }
});

// GET /api/reports/topWallets
router.get('/topWallets', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fromDate, toDate, limit } = req.query;
    const limitNum = parseInt(limit, 10) || 5;

    const query = {};
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate && !isNaN(Date.parse(fromDate))) {
        query.createdAt.$gte = new Date(fromDate);
      }
      if (toDate && !isNaN(Date.parse(toDate))) {
        query.createdAt.$lte = new Date(toDate);
      }
    }

    const results = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$wallet",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limitNum }
    ]);

    res.json(
      results.map(r => ({
        wallet: r._id,
        count: r.count
      }))
    );
  } catch (err) {
    console.error('Error generating topWallets:', err);
    res.status(500).json({ error: 'Failed to generate top wallets' });
  }
});

module.exports = router;
