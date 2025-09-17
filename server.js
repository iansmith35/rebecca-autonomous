const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// In-memory history (per-room)
const history = {
  general: [],
  mail: [],
  calendar: [],
  tasks: [],
  projects: []
};

// Mini-App API routes
app.post("/message", async (req, res) => {
  try {
    const { room, text } = req.body;
    if (!room || !text) return res.status(400).json({ error: "Room and text required" });

    history[room] = history[room] || [];
    history[room].push({ sender: "user", text });

    // Default response until hooked into Roop
    const replyText = `Rebecca (MiniApp) heard you in ${room}: "${text}"`;

    history[room].push({ sender: "ai", text: replyText });
    res.json({ reply: replyText });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/history", (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).json({ error: "Room required" });
  res.json(history[room] || []);
});

// Root → serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔗 Import Telegram bot (lives separately)
require("./telegram");

// Start server
app.listen(PORT, () => {
  console.log(`Rebecca MiniApp running on http://localhost:${PORT}`);
});
