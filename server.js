const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const path = require("path");

const app = express();
app.use(express.json());

// Load env vars
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Root route (loads index.html automatically)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Webhook route for Telegram
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;

    try {
      const reply = await callOpenAI(text);
      await sendTelegram(chatId, reply);
    } catch (err) {
      console.error("Error:", err.message);
      await sendTelegram(chatId, "⚠️ Something went wrong.");
    }
  }
  res.sendStatus(200);
});

// OpenAI call
async function callOpenAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content;
}

// Telegram sender
async function sendTelegram(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text: text,
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
