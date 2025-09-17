import fetch from 'node-fetch';
import 'dotenv/config';

const { TELEGRAM_BOT_TOKEN } = process.env;

const setWebhook = async () => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://YOUR-RENDER-APP.onrender.com/telegram/webhook" })
  });
  console.log(await resp.json());
};

setWebhook();
