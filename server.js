import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const { PORT, OPENAI_API_KEY, TELEGRAM_BOT_TOKEN } = process.env;

async function askRebecca(text) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Rebecca, a helpful assistant." },
        { role: "user", content: text }
      ]
    })
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No reply";
}

// Telegram webhook
app.post("/telegram/webhook", async (req, res) => {
  const msg = req.body?.message;
  const chatId = msg?.chat?.id;
  const text = msg?.text;

  if (!chatId || !text) {
    return res.sendStatus(200);
  }

  try {
    const reply = await askRebecca(text);
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply })
    });
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// Mini app endpoint
app.post("/chat", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });
  try {
    const reply = await askRebecca(text);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
