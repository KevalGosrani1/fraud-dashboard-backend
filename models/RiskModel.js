// models/RiskModel.js
const mongoose = require('mongoose');

const RiskSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  level: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  reportCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Risk', RiskSchema);
