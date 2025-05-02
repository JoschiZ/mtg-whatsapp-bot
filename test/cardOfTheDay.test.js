const axios = require("axios");
const registerCardOfTheDay = require("../cardOfTheDay");

jest.mock("axios");

describe("Card of the Day", () => {
  it("should fetch a card and send a message", async () => {
    // Simuliere die Scryfall-API-Antwort
    axios.get.mockResolvedValue({
      data: {
        name: "Lightning Bolt",
        prices: { eur: "0.50", eur_foil: "2.00" },
        scryfall_uri: "https://scryfall.com/card/example",
        image_uris: { normal: "https://example.com/card.jpg" },
      },
    });

    // Simulierter WhatsApp-Client
    const fakeClient = {
      sendMessage: jest.fn(),
    };

    // Wir rufen die exportierte Funktion manuell auf (bypassen cron)
    const handler = registerCardOfTheDay.__getHandlerForTest(); // Erklärung siehe unten
    await handler(fakeClient);

    // Erwartung prüfen
    expect(fakeClient.sendMessage).toHaveBeenCalledTimes(1);
    const [chatId, media, options] = fakeClient.sendMessage.mock.calls[0];

    expect(chatId).toMatch(/@/);
    expect(media).toHaveProperty("mimetype");
    expect(options.caption).toMatch(/Karte des Tages/i);
  });
});
