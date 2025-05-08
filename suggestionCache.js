const config = require("./config.json");

const cache = new Map(); // Map<chatId, { cards: string[], timestamp: number, replyToId: string }>
const EXPIRY_DURATION = config.cardSearch.validForSeconds * 1000;

function set(chatId, cards, replyToId) {
  cache.set(chatId, {
    cards,
    replyToId,
    timestamp: Date.now(),
  });
}

function get(chatId) {
  const entry = cache.get(chatId);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > EXPIRY_DURATION;
  if (isExpired) {
    cache.delete(chatId);
    return null;
  }

  return entry;
}

function deleteEntry(chatId) {
  cache.delete(chatId);
}

function cleanup() {
  const now = Date.now();
  for (const [chatId, entry] of cache.entries()) {
    if (now - entry.timestamp > EXPIRY_DURATION) {
      console.log(`🧹 Entferne abgelaufene Vorschläge für Chat ${chatId}`);
      cache.delete(chatId);
    }
  }
}

// Starte Cleanup alle 10 Minuten
setInterval(cleanup, 10 * 60 * 1000);

module.exports = {
  set,
  get,
  delete: deleteEntry,
  maxSuggestions: config.cardSearch.maxSuggestions,
};
