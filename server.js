import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const RUBE_API_URL = process.env.RUBE_API_URL || "https://api.rube.app";
const RUBE_API_KEY = process.env.RUBE_API_KEY;

// Hardcoded login credentials (as requested)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "rebecca2024";

// Simple auth tokens storage (in production, use proper session management)
const authTokens = new Set();
const logHistory = [];
const liveClients = new Set();

// Validate required environment variables for Telegram functionality
// Make them optional for static site deployment
if (TELEGRAM_BOT_TOKEN && !RUBE_API_KEY) {
  console.error("RUBE_API_KEY environment variable is required when TELEGRAM_BOT_TOKEN is set");
  process.exit(1);
}

/**
 * Authentication middleware
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || !authTokens.has(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
}

/**
 * Generate a simple auth token
 */
function generateAuthToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Log message with timestamp
 */
function logMessage(level, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message
  };
  
  logHistory.push(logEntry);
  
  // Keep only last 1000 log entries
  if (logHistory.length > 1000) {
    logHistory.shift();
  }
  
  // Send to live clients
  const data = JSON.stringify(logEntry);
  liveClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      liveClients.delete(client);
    }
  });
  
  console.log(`[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`);
}

/**
 * Sends a message to rube.app and returns the response
 * @param {string} text - The user's message
 * @returns {Promise<string>} - Rebecca's response
 */
async function askRebecca(text) {
  if (!RUBE_API_KEY) {
    return "Rebecca API is not configured. Please check your environment variables.";
  }
  
  try {
    logMessage('info', `Sending message to Rebecca: ${text}`);
    
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
      logMessage('error', `Rube API error ${response.status}: ${errorText}`);
      return "I'm experiencing technical difficulties. Please try again later.";
    }

    const data = await response.json();
    const reply = data?.reply || data?.message || "I'm not sure how to respond to that.";
    logMessage('info', `Rebecca replied: ${reply}`);
    return reply;
  } catch (error) {
    logMessage('error', `Error communicating with rube.app: ${error.message}`);
    return "I'm experiencing technical difficulties. Please try again later.";
  }
}

/**
 * Sends a message to a Telegram chat
 * @param {string} chatId - The Telegram chat ID
 * @param {string} text - The message to send
 */
async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    logMessage('warn', 'Telegram bot token not configured');
    return;
  }
  
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
      logMessage('error', `Telegram API error ${response.status}: ${errorText}`);
    } else {
      logMessage('info', `Message sent to Telegram chat ${chatId}`);
    }
  } catch (error) {
    logMessage('error', `Error sending Telegram message: ${error.message}`);
  }
}

// Authentication endpoints
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateAuthToken();
    authTokens.add(token);
    logMessage('info', `User logged in: ${username}`);
    
    res.json({ 
      success: true, 
      token,
      message: "Login successful" 
    });
  } else {
    logMessage('warn', `Failed login attempt: ${username}`);
    res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
});

// Protected API endpoints
app.post("/api/chat", requireAuth, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  try {
    const reply = await askRebecca(message);
    res.json({ reply });
  } catch (error) {
    logMessage('error', `Chat API error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/stats", requireAuth, (req, res) => {
  const startTime = process.uptime();
  const uptime = formatUptime(startTime);
  
  res.json({
    botStatus: "Running",
    messageCount: logHistory.filter(log => log.message.includes('Received message')).length,
    uptime,
    apiStatus: RUBE_API_KEY ? "Connected" : "Not configured",
    connected: true,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/logs/stream", requireAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send existing logs
  logHistory.forEach(log => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  // Add client to live updates
  liveClients.add(res);

  req.on('close', () => {
    liveClients.delete(res);
  });
});

app.get("/api/live-updates", requireAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send periodic updates
  const interval = setInterval(() => {
    const update = {
      message: `System check - ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString()
    };
    res.write(`data: ${JSON.stringify(update)}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Telegram webhook endpoint
app.post("/webhook", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(404).json({ error: "Telegram webhook not configured" });
  }
  
  try {
    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;

    // Ignore non-text messages or missing data
    if (!chatId || !text) {
      return res.sendStatus(200);
    }

    // Log incoming message
    logMessage('info', `Received message from chat ${chatId}: ${text}`);

    // Get response from Rebecca via rube.app
    const reply = await askRebecca(text);

    // Send response back to Telegram
    await sendTelegramMessage(chatId, reply);

    // Log outgoing message
    logMessage('info', `Sent reply to chat ${chatId}: ${reply}`);

    res.sendStatus(200);
  } catch (error) {
    logMessage('error', `Error processing webhook: ${error.message}`);
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

// Root endpoint - redirect to dashboard if authenticated, otherwise show login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard endpoint
app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Dev dashboard endpoint
app.get("/dev", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dev.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logMessage('info', `Rebecca Autonomous Bot running on port ${PORT}`);
  logMessage('info', `Health check available at: http://localhost:${PORT}/health`);
  logMessage('info', `Dashboard available at: http://localhost:${PORT}/`);
  if (TELEGRAM_BOT_TOKEN) {
    logMessage('info', `Webhook endpoint: http://localhost:${PORT}/webhook`);
  } else {
    logMessage('warn', 'Telegram bot not configured - webhook disabled');
  }
});
