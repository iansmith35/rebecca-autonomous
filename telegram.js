const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // make sure you set this in Render Environment
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = `${process.env.RENDER_EXTERNAL_URL}/webhook/${TELEGRAM_TOKEN}`;

// Create router so it can be mounted in server.js
const router = express.Router();
router.use(bodyParser.json());

// Store chat history in memory
const telegramHistory = {};

// Webhook endpoint
router.post(`/webhook/${TELEGRAM_TOKEN}`, async (req, res) => {
  try {
    const message = req.body.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const userText = message.text;

    // Save history
    telegramHistory[chatId] = telegramHistory[chatId] || [];
    telegramHistory[chatId].push({ sender: "user", text: userText });

    // For now: simple echo + tag (later can route to Rube)
    const replyText = `Rebecca (Telegram) heard you: "${userText}"`;

    telegramHistory[chatId].push({ sender: "ai", text: replyText });

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: replyText
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err.message);
    res.sendStatus(500);
  }
});

// Helper to set webhook on startup
async function setWebhook() {
  try {
    await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: WEBHOOK_URL
    });
    console.log("✅ Telegram webhook set:", WEBHOOK_URL);
  } catch (err) {
    console.error("Failed to set Telegram webhook:", err.message);
  }
}

// Initialise on load
setWebhook();

// Export router so server.js can use it
module.exports = router;
