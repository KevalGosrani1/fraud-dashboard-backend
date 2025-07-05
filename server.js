// server.js
const dotenv = require('dotenv');
// ✅ Load .env variables first
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // ✅ Import morgan logger
const exportRoutes = require('./routes/exportRoutes'); // ✅ Import export routes
const { connectProducer } = require('./utils/producer');

// ✅ Validate required environment variables early
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5050;

// ✅ Import routes
const reportRoutes = require('./routes/reportRoutes');
const riskRoutes = require('./routes/riskRoutes');
const authRoutes = require('./routes/authRoutes');
const contractRoutes = require('./routes/contractRoutes');
const walletRoutes = require('./routes/wallet');
const statsRoutes = require('./routes/statsRoutes');
const loginLogRoutes = require('./routes/loginLogRoutes');
const userRoutes = require('./routes/userRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

// ✅ Import middlewares
const auditLogger = require('./middleware/auditLogger');
const authMiddleware = require('./middleware/auth');

// ✅ CORS middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ✅ Logging middleware
app.use(morgan('combined'));

// ✅ JSON body parsing
app.use(express.json());

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Test route without auth - use this to confirm server is up
app.get('/test', (req, res) => {
  console.log("✅ /test route hit");
  res.send("It works!");
});

// ✅ Public routes (no auth)
app.use('/api/auth', authRoutes);
app.use('/api/contract', contractRoutes);
app.use('/api', walletRoutes);

// ✅ Authentication middleware
app.use(authMiddleware);

// ✅ Audit logger middleware (logs all authenticated requests)
app.use(auditLogger);

// ✅ Protected routes (require valid token)
app.use('/api/stats', statsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/reports', exportRoutes);
app.use('/api/login-logs', loginLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', summaryRoutes);

// ✅ MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await connectProducer();

    // ✅ Ensure default admin user exists
    const User = require('./models/User');
    const bcrypt = require('bcrypt');

    const email = process.env.ADMIN_EMAIL || 'keval7114@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ email });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`✅ Default admin created: ${email}`);
    } else {
      console.log(`ℹ️ Admin already exists: ${email}`);
    }

    // ✅ Start server
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
