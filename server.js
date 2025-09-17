const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Rebecca Autonomous System" });
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Import Telegram bot logic if available
try {
  require("./telegram")(app);
} catch (err) {
  console.log("⚠️ Telegram module not loaded:", err.message);
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Rebecca server running on port ${PORT}`);
});
