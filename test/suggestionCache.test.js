const { get, set, delete: deleteEntry } = require("../suggestionCache");

describe("suggestionCache", () => {
  const mockChatId = "test-chat";
  const fakeCards = ["Lightning Bolt", "Lightning Helix"];
  const fakeReplyToId = "msg12345";

  beforeEach(() => {
    deleteEntry(mockChatId);
  });

  test("should store and retrieve a suggestion entry", () => {
    set(mockChatId, fakeCards, fakeReplyToId);
    const entry = get(mockChatId);
    expect(entry).not.toBeNull();
    expect(entry.cards).toEqual(fakeCards);
    expect(entry.replyToId).toBe(fakeReplyToId);
  });

  test("should expire entries after configured duration", async () => {
    set(mockChatId, fakeCards, fakeReplyToId);

    // simulate time passing by mocking Date.now
    const originalNow = Date.now;
    const tooLate = originalNow() + 3 * 60 * 1000; // 3 minutes later

    global.Date.now = () => tooLate;

    const expiredEntry = get(mockChatId);
    expect(expiredEntry).toBeNull();

    global.Date.now = originalNow; // reset Date.now
  });

  test("should delete an entry manually", () => {
    set(mockChatId, fakeCards, fakeReplyToId);
    deleteEntry(mockChatId);
    const entry = get(mockChatId);
    expect(entry).toBeNull();
  });
});
