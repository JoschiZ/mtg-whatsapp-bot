const axios = require("axios");
const { __testOnly_sendCardOfTheDay } = require("../cardOfTheDay");

jest.mock("axios");

jest.mock("whatsapp-web.js", () => ({
  MessageMedia: {
    fromUrl: jest.fn().mockResolvedValue({
      mimetype: "image/jpeg",
      data: "mock-image-data",
      filename: "mock.jpg",
    }),
  },
}));

describe("Card of the Day", () => {
  it("should fetch a card and send a message", async () => {
    // Simuliere API-Antwort
    axios.get.mockResolvedValue({
      data: {
        name: "Lightning Bolt",
        prices: {
          eur: "0.50",
          eur_foil: "1.00",
        },
        scryfall_uri: "https://scryfall.com/card/test",
        image_uris: {
          normal: "https://images.test/bolt.jpg",
        },
      },
    });

    const fakeClient = {
      sendMessage: jest.fn(),
    };

    await __testOnly_sendCardOfTheDay(fakeClient, "test-chat-id");

    expect(fakeClient.sendMessage).toHaveBeenCalledTimes(1);

    const [chatId, media, options] = fakeClient.sendMessage.mock.calls[0];
    expect(chatId).toBe("test-chat-id");
    expect(media).toHaveProperty("mimetype", "image/jpeg");
    expect(options.caption).toMatch(/Karte des Tages: Lightning Bolt/);
    expect(options.caption).toMatch(/https:\/\/scryfall.com\/card\/test/);
  });
});
