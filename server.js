import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RUBE_API_URL = process.env.RUBE_API_URL || "https://api.rube.app";
const RUBE_API_KEY = process.env.RUBE_API_KEY;

// Validate required environment variables
if (!TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN environment variable is required");
  process.exit(1);
}

if (!RUBE_API_KEY) {
  console.error("RUBE_API_KEY environment variable is required");
  process.exit(1);
}

/**
 * Sends a message to rube.app and returns the response
 * @param {string} text - The user's message
 * @returns {Promise<string>} - Rebecca's response
 */
async function askRebecca(text) {
  try {
    const response = await fetch(`${RUBE_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUBE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        assistant: "rebecca"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Rube API error ${response.status}: ${errorText}`);
      return "I'm experiencing technical difficulties. Please try again later.";
    }

    const data = await response.json();
    return data?.reply || data?.message || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Error communicating with rube.app:", error);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Sends a message to a Telegram chat
 * @param {string} chatId - The Telegram chat ID
 * @param {string} text - The message to send
 */
async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram API error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

// Telegram webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    // Ignore non-text messages or missing data
    if (!chatId || !text) {
      return res.sendStatus(200);
    }

    // Log incoming message
    console.log(`Received message from chat ${chatId}: ${text}`);

    // Get response from Rebecca via rube.app
    const reply = await askRebecca(text);

    // Send response back to Telegram
    await sendTelegramMessage(chatId, reply);

    // Log outgoing message
    console.log(`Sent reply to chat ${chatId}: ${reply}`);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "rebecca-autonomous"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Rebecca Autonomous Telegram Bot",
    status: "running",
    description: "Minimalistic Telegram bot integrating with rube.app"
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Rebecca Autonomous Bot running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});
