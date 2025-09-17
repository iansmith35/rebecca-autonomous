# Rebecca Autonomous Telegram Bot

A minimalistic, robust Telegram bot that integrates with rube.app to provide autonomous AI assistance, now featuring a comprehensive management dashboard.

## Features

- **Minimalistic**: Clean, focused codebase with essential functionality only
- **Robust**: Comprehensive error handling and logging
- **Rube.app Integration**: Direct integration with rube.app API for AI responses
- **Telegram Webhook**: Efficient webhook-based message processing
- **Health Monitoring**: Built-in health check endpoint for monitoring
- **📊 Management Dashboard**: Real-time monitoring and control interface
- **💬 Direct Chat Interface**: Test and interact with the bot directly
- **📋 Feature Logs**: Real-time log viewing and management
- **🔧 Feature Management**: Control and configure bot features

## Prerequisites

- Node.js 18+ 
- A Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- A rube.app API key

## Environment Variables

Create a `.env` file or set the following environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
RUBE_API_KEY=your_rube_app_api_key_here
RUBE_API_URL=https://api.rube.app (optional, defaults to https://api.rube.app)
PORT=8080 (optional, defaults to 8080)
```

## Installation

### Quick Deploy
Use the included deployment script for easy setup:

```bash
# Make the script executable
chmod +x deploy.sh

# Run full deployment preparation
./deploy.sh

# Or start in development mode
./deploy.sh dev
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables
4. Start the server:
   ```bash
   npm start
   ```

## Development

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

- `GET /` - Redirects to dashboard
- `GET /dashboard` - Management dashboard interface
- `GET /health` - Health check endpoint
- `POST /webhook` - Telegram webhook endpoint
- `GET /api/stats` - Dashboard statistics (JSON)
- `GET /api/logs` - System logs (JSON)
- `POST /api/chat` - Direct chat with bot (JSON)

## Dashboard Features

The Rebecca Autonomous Bot now includes a comprehensive management dashboard accessible at `/dashboard`:

### 📊 Overview Tab
- Real-time statistics (messages processed, uptime, active chats)
- Health status monitoring
- Recent activity feed
- System status indicators

### 📋 Feature Logs Tab
- Real-time log viewing with filtering
- Log level filtering (Info, Warning, Error)
- Export logs functionality
- Clear logs option

### 💬 Copilot Chat Tab
- Direct chat interface with the bot
- Test bot responses in real-time
- Chat history within the session
- System message notifications

### 🔧 Feature Management Tab
- Monitor all bot features and their status
- Quick access to configuration options
- Feature-specific controls and settings
- Add new feature requests

## Setting up the Telegram Webhook

Once your server is running and accessible from the internet, set up the webhook:

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/webhook"}'
```

## Architecture

The bot follows a simple, efficient architecture:

1. **Webhook Reception**: Receives updates from Telegram via webhook
2. **Message Processing**: Extracts and validates message content
3. **AI Integration**: Forwards messages to rube.app for processing
4. **Response Delivery**: Sends AI responses back to Telegram users

## Error Handling

The bot includes comprehensive error handling:

- API failures are logged and graceful error messages are sent to users
- Invalid requests are handled silently to prevent spam
- Health checks ensure the service is monitored

## Deployment

The bot is designed to be deployed on any Node.js hosting platform:

- **Heroku**: Use the included `package.json` with proper start script
- **Docker**: Can be containerized easily
- **VPS**: Run directly with PM2 or systemd
- **Serverless**: Compatible with serverless platforms

## License

MIT License - feel free to use and modify as needed.