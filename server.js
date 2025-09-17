const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Load environment variables
const APP_MODE = process.env.APP_MODE || "miniapp";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Mini-app route (frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Telegram webhook route (separate logic in telegram.js)
const telegramHandler = require("./telegram");
app.post("/webhook", telegramHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Rebecca running on port ${PORT}`);
  console.log(`Mode: ${APP_MODE}`);
});
