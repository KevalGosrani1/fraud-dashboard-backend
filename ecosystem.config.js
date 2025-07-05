module.exports = {
  apps: [
    {
      name: "fraud-dashboard-api",
      script: "./server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5050,
        MONGO_URI: "mongodb://localhost:27017/fraudDB", // replace in production
        BREVO_USER: "you@yourverifieddomain.com",
        BREVO_PASS: "zWR0XAMf4NbL9I3Y",
        BREVO_API_KEY: "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",
        ALERT_RECIPIENTS: "aryangupta3103@gmail.com",
        WEBHOOK_URL: "https://webhook.site/ac6befe4-6367-4bb2-8ae6-5eb2241f3e65"
      }
    }
  ]
};
