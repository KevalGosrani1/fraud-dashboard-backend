// utils/customBlockchain.js
const axios = require("axios");

const RPC_URL = process.env.RPC_URL || "http://localhost:8080";

async function getContractMetadata(contractAddress) {
  const res = await axios.get(`${RPC_URL}/contracts/${contractAddress}/metadata`);
  return res.data;
}

async function getContractSupply(contractAddress) {
  const res = await axios.get(`${RPC_URL}/contracts/${contractAddress}/supply`);
  return res.data;
}

async function getReportCount(contractAddress, wallet) {
  const res = await axios.get(`${RPC_URL}/contracts/${contractAddress}/report-count`, {
    params: { wallet }
  });
  return res.data;
}

async function flagWallet(contractAddress, wallet, reasonCode) {
  const res = await axios.post(`${RPC_URL}/contracts/${contractAddress}/flag-wallet`, {
    wallet,
    reason: reasonCode
  });
  return res.data;
}

module.exports = {
  getContractMetadata,
  getContractSupply,
  getReportCount,
  flagWallet
};
