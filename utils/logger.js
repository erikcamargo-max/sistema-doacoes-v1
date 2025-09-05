// utils/logger.js
function logInfo(message) {
  console.log("ℹ️  INFO:", message);
}

function logError(message) {
  console.error("❌ ERROR:", message);
}

function logSuccess(message) {
  console.log("✅ SUCCESS:", message);
}

module.exports = {
  logInfo,
  logError,
  logSuccess,
};
