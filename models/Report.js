const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model('Report', reportSchema);
