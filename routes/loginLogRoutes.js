const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/login-logs
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Pagination defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Date range filters
    const { startDate, endDate } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.loginTime = {};
      if (startDate) query.loginTime.$gte = new Date(startDate);
      if (endDate) query.loginTime.$lte = new Date(endDate);
    }

    // Count total matching logs
    const totalLogs = await LoginLog.countDocuments(query);

    // Fetch paginated logs
    const logs = await LoginLog.find(query)
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email role');

    // Build clean response
    const results = logs.map(log => ({
      id: log._id,
      user: {
        id: log.userId?._id,
        email: log.userId?.email,
        role: log.userId?.role
      },
      loginTime: log.loginTime,
      ip: log.ip,
      userAgent: log.userAgent
    }));

    res.json({
      page,
      limit,
      totalLogs,
      totalPages: Math.ceil(totalLogs / limit),
      logs: results
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

module.exports = router;
