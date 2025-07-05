
require('dotenv').config();

// Environment variables with validation
const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Validate required environment variables
if (!RPC_URL) {
  throw new Error('RPC_URL environment variable is required');
}
if (!CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS environment variable is required');
}

// 1. Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 2. Wallet (only needed if sending transactions)
const signer = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// 3. Contract ABI
const contractABI = [
  // Replace with your actual contract ABI
  "function flagWallet(address wallet) public returns (bool)",
  "function getReportCount(address wallet) view returns (uint256)"
];
// 5. Expose contract + functions
async function flagWallet(walletAddress) {
  const tx = await contract.flagWallet(walletAddress);
  console.log("🚀 Sent tx:", tx.hash);
  await tx.wait();
  return tx;
}

async function getReportCount(walletAddress) {
  const count = await contract.getReportCount(walletAddress);
  return count.toString();
}

module.exports = {
  contract,
  flagWallet,
  getReportCount,
};
