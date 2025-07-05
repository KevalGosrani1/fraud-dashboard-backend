// utils/logger.js

function logAlert(message, payload = {}) {
  console.log(`[ALERT] ${message}`, JSON.stringify(payload, null, 2));
}

module.exports = {
  logAlert
};
