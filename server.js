import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files for dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RUBE_API_URL = process.env.RUBE_API_URL || "https://api.rube.app";
const RUBE_API_KEY = process.env.RUBE_API_KEY;

// Dashboard statistics storage
let dashboardStats = {
  messageCount: 0,
  startTime: Date.now(),
  activeChats: new Set(),
  lastActivity: Date.now(),
  logs: []
};

// Utility function to add logs
function addLog(level, message) {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString()
  };
  dashboardStats.logs.push(logEntry);
  
  // Keep only the last 1000 logs
  if (dashboardStats.logs.length > 1000) {
    dashboardStats.logs = dashboardStats.logs.slice(-1000);
  }
  
  console.log(`[${level.toUpperCase()}] ${message}`);
}

// Validate required environment variables
if (!TELEGRAM_BOT_TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN environment variable is required");
  process.exit(1);
}

if (!RUBE_API_KEY) {
  console.error("RUBE_API_KEY environment variable is required");
  process.exit(1);
}

// Initialize logging
addLog('info', 'Starting Rebecca Autonomous Bot...');
addLog('info', 'Environment variables validated');
addLog('info', 'Express server configured');

/**
 * Sends a message to rube.app and returns the response
 * @param {string} text - The user's message
 * @returns {Promise<string>} - Rebecca's response
 */
async function askRebecca(text) {
  try {
    const response = await fetch(`${RUBE_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUBE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        assistant: "rebecca"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      addLog('error', `Rube API error ${response.status}: ${errorText}`);
      return "I'm experiencing technical difficulties. Please try again later.";
    }

    const data = await response.json();
    return data?.reply || data?.message || "I'm not sure how to respond to that.";
  } catch (error) {
    addLog('error', `Error communicating with rube.app: ${error.message}`);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Sends a message to a Telegram chat
 * @param {string} chatId - The Telegram chat ID
 * @param {string} text - The message to send
 */
async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      addLog('error', `Telegram API error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    addLog('error', `Error sending Telegram message: ${error.message}`);
  }
}

// Telegram webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    // Ignore non-text messages or missing data
    if (!chatId || !text) {
      return res.sendStatus(200);
    }

    // Update dashboard statistics
    dashboardStats.messageCount++;
    dashboardStats.activeChats.add(chatId);
    dashboardStats.lastActivity = Date.now();

    // Log incoming message
    addLog('info', `Received message from chat ${chatId}: ${text}`);

    // Get response from Rebecca via rube.app
    const reply = await askRebecca(text);

    // Send response back to Telegram
    await sendTelegramMessage(chatId, reply);

    // Log outgoing message
    addLog('info', `Sent reply to chat ${chatId}: ${reply}`);

    res.sendStatus(200);
  } catch (error) {
    addLog('error', `Error processing webhook: ${error.message}`);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "rebecca-autonomous"
  });
});

// Root endpoint - redirect to dashboard
app.get("/", (req, res) => {
  res.redirect('/dashboard');
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    service: "Rebecca Autonomous Telegram Bot",
    status: "running",
    description: "Minimalistic Telegram bot integrating with rube.app",
    endpoints: {
      "/": "Dashboard (redirects to /dashboard)",
      "/dashboard": "Management dashboard",
      "/health": "Health check",
      "/webhook": "Telegram webhook",
      "/api/stats": "Dashboard statistics",
      "/api/logs": "System logs",
      "/api/chat": "Direct chat with bot"
    }
  });
});

// Dashboard API endpoints
app.get("/api/stats", (req, res) => {
  res.json({
    messageCount: dashboardStats.messageCount,
    uptime: Date.now() - dashboardStats.startTime,
    activeChats: dashboardStats.activeChats.size,
    lastActivity: dashboardStats.lastActivity,
    status: "running"
  });
});

app.get("/api/logs", (req, res) => {
  const { level, limit = 100 } = req.query;
  let logs = dashboardStats.logs;
  
  if (level && level !== 'all') {
    logs = logs.filter(log => log.level === level);
  }
  
  // Return the most recent logs
  const recentLogs = logs.slice(-parseInt(limit));
  res.json(recentLogs);
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    addLog('info', `Dashboard chat message: ${message}`);
    
    // Get response from Rebecca via rube.app
    const reply = await askRebecca(message);
    
    addLog('info', `Dashboard chat reply: ${reply}`);
    
    res.json({ reply });
  } catch (error) {
    addLog('error', `Dashboard chat error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dashboard route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  addLog('info', `Rebecca Autonomous Bot running on port ${PORT}`);
  addLog('info', `Health check available at: http://localhost:${PORT}/health`);
  addLog('info', `Webhook endpoint: http://localhost:${PORT}/webhook`);
  addLog('info', `Dashboard available at: http://localhost:${PORT}/dashboard`);
});
