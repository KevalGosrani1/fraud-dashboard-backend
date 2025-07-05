// routes/stats.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  console.log("=== /api/stats handler START ===");
  try {
    const { startDate, endDate, severity } = req.query;
    console.log("Query params:", { startDate, endDate, severity });

    // Build query filter
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (severity) {
      query.severity = Number(severity);
    }

    console.log("MongoDB query:", query);
    console.log("Starting Promise.all...");

    const [
      totalReports,
      highRiskReports,
      topWalletsAgg,
      dailyBreakdownAgg,
      severityCountsAgg,
      riskLevelCountsAgg
    ] = await Promise.all([
      Report.countDocuments(query),
      Report.countDocuments({ ...query, severity: { $gte: 7 } }),
      Report.aggregate([
        { $match: query },
        { $group: { _id: "$wallet", reportCount: { $sum: 1 } } },
        { $sort: { reportCount: -1 } },
        { $limit: 5 }
      ]),
      Report.aggregate([
        { $match: { ...query, createdAt: { $ne: null } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": -1 } }
      ]),
      Report.aggregate([
        { $match: query },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ]),
      Report.aggregate([
        { $match: query },
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
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    console.log("✅ Promise.all completed.");

    const percentHighRisk = totalReports === 0
      ? 0
      : Math.round((highRiskReports / totalReports) * 100);

    const topWallets = topWalletsAgg.map(item => ({
      wallet: item._id,
      reportCount: item.reportCount
    }));

    const dailyBreakdown = dailyBreakdownAgg.map(item => ({
      date: item._id,
      count: item.count
    }));

    const severityCounts = severityCountsAgg.map(item => ({
      severity: item._id,
      count: item.count
    }));

    const riskLevelCounts = riskLevelCountsAgg.map(item => ({
      riskLevel: item._id,
      count: item.count
    }));

    console.log("✅ Preparing and sending response...");
    res.json({
      totalReports,
      percentHighRisk,
      topWallets,
      dailyBreakdown,
      severityCounts,
      riskLevelCounts
    });

  } catch (error) {
    console.error("❌ Error generating stats:", error);
    res.status(500).json({ error: "Failed to generate stats" });
  }
});

module.exports = router;
