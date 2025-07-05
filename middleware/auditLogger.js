// middleware/auditLogger.js

module.exports = function auditLogger(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const path = req.originalUrl;

  console.log(`[AUDIT] ${new Date().toISOString()} - ${ip} - ${method} ${path}`);

  next();
};
