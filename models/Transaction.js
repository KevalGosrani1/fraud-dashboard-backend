const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  walletAddress: String,
  txHash: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
