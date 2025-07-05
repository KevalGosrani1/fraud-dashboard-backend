const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  wallet: String,
  reason: String,
  severity: Number,
  sentAt: Date,
  method: [String], // ['email', 'webhook']
});

module.exports = mongoose.model('AlertLog', alertLogSchema);
