const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Simple in-memory store for conversations per room
const history = {
  general: [],
  mail: [],
  calendar: [],
  tasks: [],
  projects: []
};

// === ROUTES ===

// POST /message → receive a user message and send to Roop
app.post("/message", async (req, res) => {
  try {
    const { room, text } = req.body;
    if (!room || !text) {
      return res.status(400).json({ error: "Room and text required" });
    }

    // Save user message to history
    history[room] = history[room] || [];
    history[room].push({ sender: "user", text });

    // Forward to Roop (replace with your real Roop endpoint)
    let replyText = "Default AI response (Roop not connected yet)";
    try {
      const response = await axios.post("https://rube.app/api/message", {
        room,
        text
      });
      if (response.data && response.data.reply) {
        replyText = response.data.reply;
      }
    } catch (err) {
      console.error("Roop error:", err.message);
      replyText = "⚠️ Could not reach Roop backend. Please try again later.";
    }

    // Save AI reply to history
    history[room].push({ sender: "ai", text: replyText });

    res.json({ reply: replyText });
  } catch (err) {
    console.error("Message error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /history → return chat history for a room
app.get("/history", (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).json({ error: "Room required" });
  res.json(history[room] || []);
});

// Start server
app.listen(PORT, () => {
  console.log("Rebecca running on port", PORT);
  console.log("==> Your service is live 🚀");
  console.log("==> Available at your primary URL");
});
