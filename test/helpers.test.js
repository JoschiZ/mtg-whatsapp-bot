const axios = require("axios");

describe("Scryfall Utilities", () => {
  test("should fetch a random card", async () => {
    const res = await axios.get(
      "https://api.scryfall.com/cards/random?q=game:paper+lang:en+-type:basic+-set:unh+-set:ugl+-set:ust+-set:unf"
    );
    expect(res.data).toHaveProperty("name");
    expect(res.data).toHaveProperty("scryfall_uri");
    expect(res.data).toHaveProperty("image_uris");
  });

  test("should match double [[Cardname]]", () => {
    const msg = "Ich liebe [[Forest]] und [[Lightning Bolt]]!";
    const matches = msg.match(/\[\[([^\[\]]+)\]\]/g);
    const cleaned = matches.map((m) =>
      m.replace("[[", "").replace("]]", "").trim()
    );
    expect(cleaned).toEqual(["Forest", "Lightning Bolt"]);
  });

  test("should ignore messages without brackets", () => {
    const msg = "Ich liebe Forest und Lightning Bolt!";
    const matches = msg.match(/\[\[([^\[\]]+)\]\]/g);
    expect(matches).toBeNull();
  });
});
