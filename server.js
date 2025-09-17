import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

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
        { role: "system", content: "You are Rebecca, the assistant." },
        { role: "user", content: text }
      ]
    })
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "No reply";
}

app.post("/telegram/webhook", async (req, res) => {
  const msg = req.body?.message;
  const chatId = msg?.chat?.id;
  const text = msg?.text;

  if (!chatId || !text) return res.sendStatus(200);

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

// health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
