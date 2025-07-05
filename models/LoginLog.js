const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loginTime: { type: Date, default: Date.now },
  ip: String,
  userAgent: String
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
