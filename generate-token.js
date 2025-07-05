const jwt = require("jsonwebtoken");

const secret = process.env.SUPABASE_JWT_SECRET || "my-very-secret-key";

const token = jwt.sign(
  {
    userId: "test-user",
    email: "test@example.com"
  },
  secret,
  { expiresIn: "1h" }
);

console.log(token);
