const index = require("../index");


function extractCardName(msg) {

  const match = msg.match(/--mtg\s+([^\n\r.,;!?]+)/i);
  return match ? match[1].trim() : null;
}

test("Extracts card from basic command", () => {
  const command = index.getCommandsFromMessage("[[ragavan]]").values().next().value;
  expect(command).toBe("ragavan");
});

test("Extracts card from sentence", () => {
  const command = index.getCommandsFromMessage("hey guys --mtg [[hazoret]].").values().next().value
  expect(command).toBe("hazoret");
});

test("Returns empty set if no command", () => {
  const commands = index.getCommandsFromMessage("nothing here {{[[]")
  expect(commands.size).toBe(0);
});

test("expect commands to be unique per message", () => {
  const commands = index.getCommandsFromMessage("hey guys [[hazoret]]. [[Hazoret]]")
  expect(commands.size).toBe(1);
});
