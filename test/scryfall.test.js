const axios = require("axios");

async function getCard(cardName) {
  const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
    cardName
  )}`;
  const res = await axios.get(url);
  return res.data;
}

test("Scryfall fetches known card", async () => {
  const card = await getCard("Lightning Bolt");
  expect(card.name).toMatch(/Lightning Bolt/i);
  expect(card.prices.eur).not.toBeNull();
});

test("Scryfall returns error on unknown card", async () => {
  try {
    await getCard("asdfghjklasdf");
  } catch (err) {
    expect(err.response.status).toBe(404);
  }
});
