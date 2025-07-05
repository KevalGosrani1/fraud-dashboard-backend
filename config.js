require('dotenv').config();

module.exports = {
  providerUrl: process.env.PROVIDER_URL,
  contractAddress: process.env.CONTRACT_ADDRESS,
  contractABI: require('./contractABI.json'), // place ABI JSON here
};
