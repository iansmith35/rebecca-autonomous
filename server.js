const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 10000;

// simple healthcheck
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// webhook endpoint for Telegram
app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  require("./telegram").handleUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Rebecca running on port ${PORT}`);
  console.log(`Primary URL: ${process.env.RENDER_EXTERNAL_URL || "http://localhost:" + PORT}`);
});
