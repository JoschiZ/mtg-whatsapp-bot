const axios = require("axios");
const cron = require("node-cron");
const { MessageMedia } = require("whatsapp-web.js");

async function sendCardOfTheDay(client, chatId) {
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
    await client.sendMessage(chatId, media, { caption });
  } catch (err) {
    console.error("❌ Fehler bei 'Card of the Day':", err.message);
  }
}

function registerCardOfTheDay(client, chatId, cronExpr) {
  cron.schedule(cronExpr, () => sendCardOfTheDay(client, chatId));
}

module.exports = {
  registerCardOfTheDay,
  __testOnly_sendCardOfTheDay: sendCardOfTheDay,
};
