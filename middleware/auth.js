// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("=== AUTH DEBUG ===");
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.log("❌ Missing header");
    return res.status(403).send("No authorization header");
  }

  const [scheme, token] = authHeader.split(" ");
  console.log("Scheme:", scheme);
  console.log("Token:", token);

  if (scheme !== "Bearer" || !token) {
    console.log("❌ Invalid scheme or missing token");
    return res.status(403).send("Invalid authorization format");
  }

  if (token !== process.env.ADMIN_TOKEN) {
    console.log("❌ Invalid token");
    return res.status(403).send("Invalid token");
  }

  console.log("✅ Auth passed: admin user");
  req.user = {
    email: process.env.ADMIN_EMAIL,
    role: "admin"
  };

  next();
};
