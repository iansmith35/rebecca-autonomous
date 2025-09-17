/**
 * Rebecca Autonomous Bot - Telegram Integration with rube.app
 * 
 * This server provides a Telegram bot interface that integrates seamlessly with rube.app.
 * The bot receives messages via webhooks and responds using OpenAI's API, optimized
 * for rube.app's workflow automation needs.
 * 
 * @author Rebecca Autonomous Team
 * @version 2.0.0
 */

import express from "express";
import fetch from "node-fetch";

// Initialize Express application with JSON parsing middleware
const app = express();
app.use(express.json({ limit: '10mb' })); // Increased limit for rube.app payloads

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Validate and load environment variables required for rube.app integration
 */
const validateEnvironment = () => {
  const required = ['OPENAI_API_KEY', 'TELEGRAM_BOT_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✓ Environment variables validated');
};

// Validate environment on startup
validateEnvironment();

// Environment variables with descriptive comments for rube.app integration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;           // OpenAI API key for AI responses
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;   // Telegram bot token for messaging
const PORT = process.env.PORT || 8080;                      // Server port (rube.app compatible)
const RUBE_WEBHOOK_SECRET = process.env.RUBE_WEBHOOK_SECRET; // Optional webhook validation

// =============================================================================
// CORE AI FUNCTIONALITY
// =============================================================================

/**
 * Communicates with OpenAI API to generate intelligent responses
 * Optimized for rube.app workflow contexts and automation scenarios
 * 
 * @param {string} text - User input text to process
 * @param {Object} context - Optional context from rube.app workflows
 * @returns {Promise<string>} - Generated response from Rebecca
 */
async function askRebecca(text, context = {}) {
  try {
    // Enhanced system prompt for rube.app integration
    const systemPrompt = `You are Rebecca, an autonomous assistant integrated with rube.app. 
    You help users with workflow automation, task management, and intelligent responses. 
    You can understand workflow contexts and provide actionable insights.
    
    Context: ${JSON.stringify(context)}`;

    console.log(`🤖 Processing request: "${text.substring(0, 50)}..."`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "Rebecca-Autonomous-Bot/2.0.0 (rube.app integration)"
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview", // Updated to latest stable model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API Error (${response.status}): ${errorText}`);
      return "I'm experiencing technical difficulties. Please try again later.";
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    
    if (!reply) {
      console.error("❌ No response content from OpenAI");
      return "I couldn't generate a response. Please rephrase your question.";
    }

    console.log(`✅ Generated response: ${reply.substring(0, 50)}...`);
    return reply;

  } catch (error) {
    console.error("❌ Error in askRebecca:", error.message);
    return "I encountered an error processing your request. Please try again.";
  }
}

// =============================================================================
// TELEGRAM API UTILITIES
// =============================================================================

/**
 * Sends a message to Telegram chat with enhanced error handling
 * Optimized for rube.app notification workflows
 * 
 * @param {string} chatId - Telegram chat ID
 * @param {string} text - Message text to send
 * @param {Object} options - Additional Telegram message options
 * @returns {Promise<boolean>} - Success status
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown', // Enable markdown for rube.app formatting
      disable_web_page_preview: true,
      ...options
    };

    console.log(`📤 Sending message to chat ${chatId}`);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "Rebecca-Autonomous-Bot/2.0.0"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Telegram API Error:`, errorData);
      return false;
    }

    console.log(`✅ Message sent successfully to chat ${chatId}`);
    return true;

  } catch (error) {
    console.error(`❌ Error sending Telegram message:`, error.message);
    return false;
  }
}

// =============================================================================
// WEBHOOK ENDPOINTS
// =============================================================================

/**
 * Main Telegram webhook endpoint for rube.app integration
 * Processes incoming messages and generates intelligent responses
 */
app.post("/telegram/RebeccaRubeBot/webhook", async (req, res) => {
  try {
    console.log(`📨 Webhook received:`, JSON.stringify(req.body, null, 2));

    // Extract message data with comprehensive validation
    const update = req.body;
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text;
    const userId = message?.from?.id;
    const username = message?.from?.username;

    // Skip non-text messages or missing data
    if (!chatId || !text) {
      console.log(`⚠️  Skipping update - missing chatId or text`);
      return res.status(200).json({ status: 'ignored' });
    }

    // Skip bot messages to prevent loops
    if (message?.from?.is_bot) {
      console.log(`⚠️  Skipping bot message`);
      return res.status(200).json({ status: 'ignored_bot' });
    }

    // Enhanced context for rube.app workflows
    const context = {
      userId,
      username,
      chatId,
      timestamp: new Date().toISOString(),
      platform: 'telegram',
      integration: 'rube.app'
    };

    console.log(`🎯 Processing message from @${username} (${userId}): "${text}"`);

    // Generate AI response with context
    const reply = await askRebecca(text, context);

    // Send response with enhanced formatting
    const success = await sendTelegramMessage(chatId, reply, {
      reply_to_message_id: message.message_id
    });

    // Respond to webhook with detailed status
    res.status(200).json({ 
      status: 'processed',
      success,
      chatId,
      messageLength: reply.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ Webhook processing error:`, error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * rube.app integration webhook endpoint
 * Handles workflow automation triggers and notifications
 */
app.post("/rube/webhook", async (req, res) => {
  try {
    console.log(`🔗 rube.app webhook received:`, JSON.stringify(req.body, null, 2));

    const { action, data, target_chat_id } = req.body;

    if (!action || !target_chat_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process different rube.app actions
    let message = '';
    switch (action) {
      case 'workflow_completed':
        message = `✅ *Workflow Completed*\nWorkflow: ${data.workflow_name}\nStatus: ${data.status}`;
        break;
      case 'task_created':
        message = `📋 *New Task Created*\nTitle: ${data.title}\nPriority: ${data.priority}`;
        break;
      case 'notification':
        message = data.message || 'Notification from rube.app';
        break;
      default:
        message = `🔔 rube.app notification: ${action}`;
    }

    const success = await sendTelegramMessage(target_chat_id, message);

    res.status(200).json({ 
      status: 'processed',
      success,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ rube.app webhook error:`, error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// HEALTH AND STATUS ENDPOINTS
// =============================================================================

/**
 * Health check endpoint for rube.app monitoring
 */
app.get("/RebeccaRubeBot/health", (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    integration: 'rube.app',
    services: {
      openai: !!OPENAI_API_KEY,
      telegram: !!TELEGRAM_BOT_TOKEN,
      server: true
    }
  };

  console.log(`💚 Health check requested`);
  res.status(200).json(healthCheck);
});

/**
 * Status endpoint with detailed bot information
 */
app.get("/status", (req, res) => {
  res.status(200).json({
    bot: 'Rebecca Autonomous',
    version: '2.0.0',
    platform: 'Telegram',
    integration: 'rube.app',
    features: [
      'AI-powered responses',
      'Workflow automation',
      'rube.app integration',
      'Enhanced error handling',
      'Contextual awareness'
    ],
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

/**
 * Start the server with comprehensive logging
 */
const server = app.listen(PORT, () => {
  console.log(`
🚀 Rebecca Autonomous Bot Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🤖 Bot: RebeccaRubeBot
🔗 Integration: rube.app
📅 Started: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoints:
  POST /telegram/RebeccaRubeBot/webhook
  POST /rube/webhook  
  GET  /RebeccaRubeBot/health
  GET  /status
  `);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
