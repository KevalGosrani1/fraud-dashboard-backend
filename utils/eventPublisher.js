// utils/eventPublisher.js

const eventQueue = [];

// Simulate publishing to Kafka
function publishHighRiskWalletFlaggedEvent(event) {
  eventQueue.push(event);
  console.log("[EVENT] High-Risk Wallet Flagged:", JSON.stringify(event, null, 2));
}

function getEventQueue() {
  return eventQueue;
}

module.exports = {
  publishHighRiskWalletFlaggedEvent,
  getEventQueue
};
