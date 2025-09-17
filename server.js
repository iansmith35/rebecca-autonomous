import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// ✅ Load environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; 
const OPENAI_KEY = process.env.OPENAI_KEY; 

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const WEBHOOK_PATH = `/webhook/${TELEGRAM_TOKEN}`;

// ---- Serve Mini-App UI ----
app.use("/miniapp", express.static(path.join(__dirname, "public")));

// ---- Telegram Webhook ----
app.post(WEBHOOK_PATH, async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text;

  try {
    // Forward message to OpenAI (Rube’s brain)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Rebecca, Ian’s witty, flirty, but professional AI assistant." },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "Sorry, I hit a snag.";

    // Send AI reply back to Telegram
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: aiReply })
    });
  } catch (err) {
    console.error("Error:", err);
  }

  res.sendStatus(200);
});

// ---- Health check ----
app.get("/", (req, res) => {
  res.send("Rebecca is online 🚀");
});

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
