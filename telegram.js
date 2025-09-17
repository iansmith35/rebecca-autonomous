const axios = require("axios");

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const OPENAI_KEY = process.env.OPENAI_KEY;

// send message back to Telegram user
async function sendMessage(chatId, text) {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
    });
  } catch (err) {
    console.error("Error sending Telegram message:", err.message);
  }
}

// process incoming Telegram update
async function handleUpdate(update) {
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const userText = update.message.text;

  try {
    // call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Rebecca, an AI assistant." },
          { role: "user", content: userText }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    await sendMessage(chatId, reply);

  } catch (err) {
    console.error("Error with OpenAI:", err.message);
    await sendMessage(chatId, "⚠️ Sorry, I hit an error. Try again.");
  }
}

module.exports = { handleUpdate };
