// server.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// === Environment Variables ===
// Set these in Render → Environment
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = "https://rebecca-autonomous.onrender.com/webhook"; // change if different

// --- Set webhook automatically on startup ---
async function setWebhook() {
  try {
    const res = await axios.get(
      `${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`
    );
    console.log("Webhook setup:", res.data);
  } catch (err) {
    console.error("Failed to set webhook:", err.response?.data || err.message);
  }
}

// --- OpenAI call ---
async function callOpenAI(prompt) {
  try {
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
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    return "⚠️ I couldn’t reach my brain just now. Try again.";
  }
}

// --- Telegram webhook route ---
app.post("/webhook", async (req, res) => {
  if (req.body.message) {
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    try {
      const aiReply = await callOpenAI(text);
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: aiReply,
      });
    } catch (err) {
      console.error("sendMessage error:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Rebecca running on port ${PORT}`);
  await setWebhook();
});
