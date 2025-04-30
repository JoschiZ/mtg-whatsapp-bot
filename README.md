# MTG WhatsApp Bot

A lightweight WhatsApp bot that responds to `--mtg [card name]` commands with Magic: The Gathering card information using the [Scryfall API](https://scryfall.com/docs/api).

## ✨ Features

- Command-based card lookup: `--mtg Card Name`
- Returns:
  - 💶 Euro prices (normal + foil)
  - 🖼️ Card image (front/back supported)
  - 🔗 Direct link to the card on Scryfall
- Intelligent fuzzy search suggestions for typos

## 🚀 Requirements

- Node.js v16 or later
- A WhatsApp account (linked once via QR code)

## ⚙️ Installation

```bash
git clone https://github.com/your-username/mtg-whatsapp-bot.git
cd mtg-whatsapp-bot
npm install
node index.js
```

After starting, scan the QR code with your WhatsApp app to link the bot.

## 💬 Usage

Send a message in any chat or group:

```
--mtg ragavan
```

The bot will respond with:

- Euro price
- Card image
- Scryfall link

If the card isn't found, it will suggest up to 5 close matches.

## 🔐 Privacy

Authentication sessions are stored locally in `.wwebjs_auth/` and are excluded from version control via `.gitignore`.

## 📄 License & Disclaimer

MIT License  
© Karl v. Bonin | CodeLax IT GmbH

This bot is provided as-is for private or non-commercial use. It is not affiliated with or endorsed by Wizards of the Coast or Scryfall.

#### TODOS:

- Add this to a rapsberry PI with its own number
- Can sync with the local store cardmarket/storage and tell if the card is available
- Test
