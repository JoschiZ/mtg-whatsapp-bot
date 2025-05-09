# 📦 MTG WhatsApp Bot

A WhatsApp bot for Magic: The Gathering – just send `[[CardName]]` in your chat and get images and card info using the Scryfall API.

> 🛠 Developed by **Karl v. Bonin | CodeLax IT GmbH**

---

## ⚙️ Features

- 📷 Automatic image replies for `[[CardName]]`
- 💶 Prices in EUR via Cardmarket
- 🧪 `[[test]]` → triggers the current "Card of the Day"
- 🎲 `[[random]]` → sends a truly random MTG card
- ❌ Fuzzy suggestions on typos – reply with numbers to select
- ⏱ Daily scheduled post (e.g. every day at 9:30 AM)
- 🖥️ Works on Windows, Linux, Raspberry Pi

---

## 💬 Chat Usage

### 🔎 Get cards:

```
[[Lightning Bolt]]
I love [[Forest]] and [[Lightning Helix]]
```

### 🧪 Test triggers:

```
[[test]]      → manually trigger "Card of the Day"
[[random]]    → get a random MTG card
```

### ❌ Suggestions for typos:

```
[[Lightnig Boltt]] → Bot replies:

1. Lightning Bolt
2. Lightning Strike
...

Just reply with 1, 2 or 3 – **as a reply to the bot's message!**
```

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

```env
WHATSAPP_ALLOWED_CHAT_ID=1234567890-123456@g.us
```

> This is the group or individual chat ID – find it via logging when sending a message.

---

### 3. Configure `config.json`

```json
{
  "schedule": "30 9 * * *",
  "puppeteerExecutablePath": {
    "windows": null,
    "linux": "/usr/bin/chromium-browser"
  },
  "cardSearch": {
    "maxSuggestions": 5,
    "validForSeconds": 120
  }
}
```

---

### 4. Start the bot

```bash
node index.js
```

Or permanently via PM2:

```bash
npm install -g pm2
pm2 start index.js --name mtgbot
pm2 save
pm2 startup
```

---

## 🧪 Run tests

```bash
npm install --save-dev jest
npm test
```

> Tests are in `/test` – covering caching, Scryfall lookup & syntax parsing.

---

## 📁 Project Structure

```
/mtg-whatsapp-bot
├── index.js
├── cardOfTheDay.js
├── suggestionCache.js
├── config.json
├── .env
└── test/
```

---

## 🔒 Security

- The bot is limited to a single allowed chat (`.env`)
- No external access
- No message content logging (unless you explicitly add it)

---

## 🤝 License & Author

> Developed by **Karl v. Bonin**  
> © CodeLax IT GmbH – 2025  
> Free for personal / community use. No commercial redistribution.

This project is licensed under the  
**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license.

[View full license ➜](https://creativecommons.org/licenses/by-nc-sa/4.0/)
