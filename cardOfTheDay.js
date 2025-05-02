const axios = require("axios");
const cron = require("node-cron");
const { MessageMedia } = require("whatsapp-web.js");

// 🧠 Hauptfunktion: sendet die Karte
async function sendCardOfTheDay(client) {
  console.log("🕒 Sende tägliche Karte...");

  try {
    const res = await axios.get(
      "https://api.scryfall.com/cards/random?q=game:paper+lang:en+-type:basic+-set:unh+-set:ugl+-set:ust+-set:unf"
    );
    const card = res.data;

    const prices = [];
    if (card.prices.eur) prices.push(`💶 €${card.prices.eur}`);
    if (card.prices.eur_foil) prices.push(`✨ Foil: €${card.prices.eur_foil}`);

    const caption = `🃏 Karte des Tages: ${card.name}\n${prices.join(
      " / "
    )}\n\n🔗 ${card.scryfall_uri}`;

    const image =
      card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal;

    const media = await MessageMedia.fromUrl(image);
    const chatId = "DEINE_CHAT_ID@g.us"; // <-- Ersetze mit echter Gruppen-ID

    await client.sendMessage(chatId, media, { caption });
  } catch (err) {
    console.error("Fehler bei 'Card of the Day':", err.message);
  }
}

// ⏰ Zeitplan-Wrapper
function registerCardOfTheDay(client) {
  cron.schedule("15 17 * * *", () => sendCardOfTheDay(client));
}

module.exports = registerCardOfTheDay;
module.exports.__getHandlerForTest = () => sendCardOfTheDay;
