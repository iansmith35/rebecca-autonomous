// server.js
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY; // or Rube key if proxied
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Telegram webhook
app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg || !msg.text) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = aiResponse.data.choices[0].message.content;
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply
    });
  } catch (err) {
    console.error("Telegram handler failed:", err.message);
  }

  res.sendStatus(200);
});

// WebApp chat endpoint (Mini-App UI posts here)
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "No message received." });

  try {
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = aiResponse.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("WebApp handler failed:", err.message);
    res.json({ reply: "⚠️ Something went wrong talking to AI." });
  }
});

// Render requires this PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rebecca running on port ${PORT}`);
});
