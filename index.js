require("dotenv").config();
const os = require("os");
const config = require("./config.json");

const puppeteerPath =
  os.platform() === "linux"
    ? config.puppeteerExecutablePath.linux
    : config.puppeteerExecutablePath.windows;

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const {
  registerCardOfTheDay,
  __testOnly_sendCardOfTheDay,
} = require("./cardOfTheDay");

const suggestionCache = require("./suggestionCache");

const allowedChatId = process.env.WHATSAPP_ALLOWED_CHAT_ID;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: puppeteerPath || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot ist bereit!");
  client.sendMessage(allowedChatId, "🤖 MTG Bot ist gestartet und bereit!");
  registerCardOfTheDay(client, allowedChatId, config.schedule);
});

client.on("message", async (message) => {
  console.log("📩 Nachricht erhalten:", message.body);
  console.log("📩 Nachricht von:", message.from);

  if (message.from !== allowedChatId) return;

  const msg = message.body.trim().toLowerCase();

  // 🧪 Test-Trigger für Card of the Day
  if (msg === config.prefixes.testCron) {
    console.log("🧪 Test: Karte des Tages wird manuell ausgelöst.");
    await __testOnly_sendCardOfTheDay(client, allowedChatId);
    return;
  }

  // 🔢 Auswahlantwort auf Vorschlagsnachricht
  if (/^\d+$/.test(msg)) {
    const entry = suggestionCache.get(message.from);

    if (!entry) return;
    if (!message.hasQuotedMsg) return;

    const quoted = await message.getQuotedMessage();
    if (quoted.id._serialized !== entry.replyToId) return;

    const index = parseInt(msg, 10) - 1;
    if (!entry.cards[index]) {
      await message.reply("❌ Ungültige Auswahl.");
      return;
    }

    const cardName = entry.cards[index];
    suggestionCache.delete(message.from);
    console.log("🔄 Auswahl gewählt:", cardName);

    const cardData = await getCardFromScryfall(cardName);
    if (!cardData) {
      await message.reply("❌ Karte konnte nicht geladen werden.");
      return;
    }

    await sendCardImage(message, cardData);
    return;
  }

  // 💬 MTG-Kartensuche
  const match = message.body.match(
    new RegExp(`${config.prefixes.getCard}\\s*([^\\n\\r.,;!?]+)`, "i")
  );
  if (!match) return;

  const cardName = match[1].trim();
  if (!cardName) return;

  console.log("🔍 Suche Karte:", cardName);

  const cardData = await getCardFromScryfall(cardName);

  if (!cardData || cardData.suggestions) {
    if (cardData?.suggestions) {
      const suggestionsArray = cardData.suggestions
        .split("\n")
        .map((line) => line.replace("- ", ""))
        .slice(0, suggestionCache.maxSuggestions);

      const formatted = suggestionsArray
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n");

      const sent = await message.reply(
        `❌ Karte nicht gefunden. Meintest du:\n${formatted}\n\nAntwort mit einer Zahl (1–${suggestionsArray.length}), **als Antwort auf diese Nachricht**.`
      );

      suggestionCache.set(message.from, suggestionsArray, sent.id._serialized);
    } else {
      await message.reply("❌ Karte nicht gefunden.");
    }
    return;
  }

  await sendCardImage(message, cardData);
});

async function getCardFromScryfall(cardName) {
  try {
    const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
      cardName
    )}`;
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      const searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
        cardName
      )}`;
      const res = await axios.get(searchUrl);
      const suggestions = res.data.data
        ?.map((card) => `- ${card.name}`)
        .join("\n");
      return { suggestions };
    }

    console.error("❌ Scryfall-Fehler:", err.message);
    return null;
  }
}

async function sendCardImage(message, cardData) {
  const prices = [];
  if (cardData.prices.eur) prices.push(`💶 €${cardData.prices.eur}`);
  if (cardData.prices.eur_foil)
    prices.push(`✨ Foil: €${cardData.prices.eur_foil}`);
  const caption = `${prices.join(" / ")}\n\n🔗 ${cardData.scryfall_uri}`;

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
}

client.initialize();
