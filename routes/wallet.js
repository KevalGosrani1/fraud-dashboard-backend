const express = require('express');
const router = express.Router();
const { flagWallet, getOnChainReportCount } = require('../services/contractService');
const Transaction = require('../models/Transaction');

const { getEventQueue, publishHighRiskWalletFlaggedEvent } = require('../utils/eventPublisher');
const { logAlert } = require('../utils/logger');

router.get('/events', (req, res) => {
  res.json(getEventQueue());
});

router.post('/flag', async (req, res) => {
  const { walletAddress } = req.body;
  const txResult = await flagWallet(walletAddress);

  if (txResult.success) {
    // Store transaction
    await Transaction.create({
      walletAddress,
      txHash: txResult.txHash,
      status: 'Success',
    });

    // Simulate Kafka event and log alert
    const event = {
      wallet: walletAddress.toLowerCase(),
      flaggedAt: new Date().toISOString(),
      txHash: txResult.txHash,
      riskLevel: "HIGH"
    };

    publishHighRiskWalletFlaggedEvent(event);
    logAlert("High-Risk Wallet Flagged", event);

    res.json({
      success: true,
      message: txResult.confirmationMessage,
      txHash: txResult.txHash
    });
  } else {
    await Transaction.create({
      walletAddress,
      txHash: null,
      status: 'Failed: ' + txResult.error,
    });
    res.status(500).json({
      success: false,
      error: txResult.error
    });
  }
});

router.get('/report-count/:address', async (req, res) => {
  const result = await getOnChainReportCount(req.params.address);
  if (result.success) {
    res.json({ count: result.count });
  } else {
    res.status(500).json({ error: result.error });
  }
});

module.exports = router;
