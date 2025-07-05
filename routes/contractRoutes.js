// routes/contractRoutes.js
const express = require("express");
const router = express.Router();
const blockchain = require("../utils/customBlockchain");

// GET /api/contract/metadata/:contractAddress
router.get("/metadata/:contractAddress", async (req, res) => {
  const { contractAddress } = req.params;
  if (!contractAddress) {
    return res.status(400).json({ error: "contractAddress is required." });
  }

  try {
    const metadata = await blockchain.getContractMetadata(contractAddress);
    res.json(metadata);
  } catch (err) {
    console.error("Metadata error:", err.message);
    res.status(500).json({ error: "Failed to fetch contract metadata." });
  }
});

// GET /api/contract/supply/:contractAddress
router.get("/supply/:contractAddress", async (req, res) => {
  const { contractAddress } = req.params;
  if (!contractAddress) {
    return res.status(400).json({ error: "contractAddress is required." });
  }

  try {
    const supply = await blockchain.getContractSupply(contractAddress);
    res.json({ supply });
  } catch (err) {
    console.error("Supply error:", err.message);
    res.status(500).json({ error: "Failed to fetch contract supply." });
  }
});

// GET /api/contract/report-count/:contractAddress
router.get("/report-count/:contractAddress", async (req, res) => {
  const { contractAddress } = req.params;
  const { wallet } = req.query;
  if (!contractAddress || !wallet) {
    return res.status(400).json({ error: "contractAddress and wallet are required." });
  }

  try {
    const count = await blockchain.getReportCount(contractAddress, wallet);
    res.json(count);
  } catch (err) {
    console.error("Report count error:", err.message);
    res.status(500).json({ error: "Failed to fetch report count." });
  }
});

// POST /api/contract/flag
router.post("/flag", async (req, res) => {
  const { contractAddress, wallet, reasonCode } = req.body;
  if (!contractAddress || !wallet) {
    return res.status(400).json({ error: "contractAddress and wallet are required." });
  }

  try {
    const result = await blockchain.flagWallet(contractAddress, wallet, reasonCode);
    res.json(result);
  } catch (err) {
    console.error("Flag error:", err.message);
    res.status(500).json({ error: "Failed to flag wallet." });
  }
});

module.exports = router;
