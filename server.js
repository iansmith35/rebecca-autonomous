// server.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// === HARD-CODE YOUR TOKEN HERE ===
const TELEGRAM_TOKEN = "8250011002:AAGZl0TRh9ZuAceAbJzzjnJrtSxiZB_0GaY";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = "https://rebecca-autonomous.onrender.com/webhook"; // replace with your Render URL

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

// --- Webhook route ---
app.post("/webhook", async (req, res) => {
  console.log("Incoming update:", JSON.stringify(req.body));

  if (req.body.message) {
    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `You said: ${text}`,
      });
    } catch (err) {
      console.error(
        "sendMessage error:",
        err.response?.data || err.message
      );
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
