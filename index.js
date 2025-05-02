const axios = require("axios");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const registerCardOfTheDay = require("./cardOfTheDay");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot ist bereit!");
  registerCardOfTheDay(client);
});

client.on("message", async (message) => {
  const match = message.body.match(/--mtg\s+([^\n\r.,;!?]+)/i);
  if (!match) return;

  const cardName = match[1].trim();
  if (!cardName) return;

  console.log("🔍 Suche Karte:", cardName);

  const cardData = await getCardFromScryfall(cardName);

  if (!cardData || (cardData && cardData.suggestions)) {
    if (cardData && cardData.suggestions) {
      await message.reply(
        `❌ Karte nicht gefunden. Meintest du vielleicht:\n${cardData.suggestions}`
      );
    } else {
      await message.reply("❌ Karte nicht gefunden.");
    }
    return;
  }

  // 💶 MKM Prices + Scryfall-Link
  const prices = [];
  if (cardData.prices.eur) prices.push(`💶 €${cardData.prices.eur}`);
  if (cardData.prices.eur_foil)
    prices.push(`✨ Foil: €${cardData.prices.eur_foil}`);

  const caption = `${prices.join(" / ")}\n\n🔗 ${cardData.scryfall_uri}`;

  // 🖼️ Bild senden (auch bei doppelseitigen Karten)
  if (cardData.image_uris) {
    const media = await MessageMedia.fromUrl(cardData.image_uris.normal);
    await message.reply(media, message.from, { caption });
  } else if (cardData.card_faces) {
    for (const face of cardData.card_faces) {
      const media = await MessageMedia.fromUrl(face.image_uris.normal);
      await message.reply(media, message.from, { caption: "" });
    }
    await message.reply(caption);
  } else {
    await message.reply("⚠️ Bild konnte nicht geladen werden.");
  }
});

async function getCardFromScryfall(cardName) {
  try {
    const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
      cardName
    )}`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    // IF ERROR
    if (err.response && err.response.status === 404) {
      console.log(
        "🔎 Fuzzy-Treffer nicht eindeutig – Vorschläge werden gesucht..."
      );

      try {
        const searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          cardName
        )}`;
        const res = await axios.get(searchUrl);

        if (res.data.data && res.data.data.length > 0) {
          const suggestions = res.data.data
            .slice(0, 5)
            .map((card) => `- ${card.name}`)
            .join("\n");

          return { suggestions };
        }
      } catch (searchErr) {
        console.error("Fehler bei Scryfall-Suche:", searchErr.message);
      }
    }

    console.error("❌ Scryfall-Fehler:", err.message);
    return null;
  }
}

client.initialize();
