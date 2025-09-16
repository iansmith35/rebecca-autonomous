const express = require("express");
const axios = require("axios");
const cron = require("node-cron");

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// health check
app.get("/rebecca/health", (req, res) => {
  res.json({
    status: "autonomous_active",
    heartbeat: 1,
    uptime: process.uptime()
  });
});

// telegram webhook
app.post("/webhook/telegram", async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text;

  try {
    const reply = await callOpenAI(userText);
    await sendTelegram(chatId, reply);
  } catch (err) {
    console.error("Error:", err.message);
    await sendTelegram(chatId, "Something went wrong.");
  }

  res.sendStatus(200);
});

// call OpenAI
async function callOpenAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data.choices[0].message.content;
}

// send message to telegram
async function sendTelegram(chatId, text) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: chatId,
    text
  });
}

// run heartbeat every minute
cron.schedule("* * * * *", () => {
  console.log("Heartbeat:", new Date().toISOString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rebecca running on ${PORT}`));
