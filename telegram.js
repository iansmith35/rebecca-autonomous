const axios = require("axios");

module.exports = function (app) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const OPENAI_KEY = process.env.OPENAI_KEY;

  if (!TELEGRAM_TOKEN) {
    console.log("⚠️ No TELEGRAM_BOT_TOKEN set, skipping Telegram bot init.");
    return;
  }

  const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  // Webhook endpoint for Telegram
  app.post(`/webhook/${TELEGRAM_TOKEN}`, express.json(), async (req, res) => {
    const update = req.body;

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userMessage = update.message.text;

      console.log(`📩 Message from Telegram: ${userMessage}`);

      try {
        // Send message to OpenAI
        const aiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are Rebecca, Ian’s assistant." },
              { role: "user", content: userMessage },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const reply =
          aiResponse.data.choices[0].message.content ||
          "⚠️ Sorry, I couldn’t generate a reply.";

        // Send back to Telegram
        await axios.post(`${TELEGRAM_URL}/sendMessage`, {
          chat_id: chatId,
          text: reply,
        });
      } catch (err) {
        console.error("❌ Telegram handler error:", err.message);
      }
    }

    res.sendStatus(200);
  });

  console.log("✅ Telegram bot handler ready.");
};
