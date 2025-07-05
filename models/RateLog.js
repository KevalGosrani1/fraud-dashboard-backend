// models/RateLog.js
const mongoose = require('mongoose');

const rateLogSchema = new mongoose.Schema({
  token: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  }  
});

module.exports = mongoose.model('RateLog', rateLogSchema);
