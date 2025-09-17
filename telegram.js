const axios = require("axios");

module.exports = async function (req, res) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const OPENAI_KEY = process.env.OPENAI_KEY;

    if (!req.body.message) {
      return res.sendStatus(200);
    }

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    // Call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data.choices?.[0]?.message?.content ||
      "Sorry, I didn’t understand that.";

    // Send reply to Telegram
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply,
      }
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("Telegram handler error:", err.message);
    return res.sendStatus(500);
  }
};
