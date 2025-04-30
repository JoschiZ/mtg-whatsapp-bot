function extractCardName(msg) {
  const match = msg.match(/--mtg\s+([^\n\r.,;!?]+)/i);
  return match ? match[1].trim() : null;
}

test("Extracts card from basic command", () => {
  expect(extractCardName("--mtg ragavan")).toBe("ragavan");
});

test("Extracts card from sentence", () => {
  expect(extractCardName("hey guys --mtg hazoret.")).toBe("hazoret");
});

test("Extracts only first word if followed by text", () => {
  expect(extractCardName("suche --mtg forest... danke")).toBe("forest");
});

test("Returns null if no command", () => {
  expect(extractCardName("no mtg here")).toBeNull();
});
