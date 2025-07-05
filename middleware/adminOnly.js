// middleware/adminOnly.js
module.exports = (req, res, next) => {
  console.log("=== ADMIN ONLY CHECK ===");
  if (!req.user || req.user.role !== "admin") {
    console.log("❌ Admin access denied");
    return res.status(403).json({ error: "Admin access required" });
  }
  console.log("✅ Admin access granted");
  next();
};
