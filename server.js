const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
app.use(express.json());

// Load env vars (must match Render names)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

// webhook route
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
  res.sendStatus(200); // Always reply quickly so Telegram doesn’t retry
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
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content;
}

// Telegram send
async function sendTelegram(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text,
  });
}

// health check
app.get("/rebecca/health", (req, res) => {
  res.json({
    status: "autonomous_active",
    heartbeat: 1,
    uptime: process.uptime(),
  });
});

// cron heartbeat
cron.schedule("* * * * *", () => {
  console.log("Heartbeat:", new Date().toISOString());
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rebecca running on ${PORT}`));
