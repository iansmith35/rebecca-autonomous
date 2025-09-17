# Rebecca Autonomous Telegram Bot

A minimalistic, robust Telegram bot that integrates with rube.app to provide autonomous AI assistance. Now also deployable as a static site with a comprehensive dashboard and development tools.

## Features

- **Minimalistic**: Clean, focused codebase with essential functionality only  
- **Robust**: Comprehensive error handling and logging
- **Rube.app Integration**: Direct integration with rube.app API for AI responses
- **Telegram Webhook**: Efficient webhook-based message processing (optional)
- **Health Monitoring**: Built-in health check endpoint for monitoring
- **Static Site Dashboard**: Modern web interface with authentication
- **Live Monitoring**: Real-time logs and system status updates
- **Copilot Chat**: Web-based chat interface powered by Rebecca AI

## New: Static Site Deployment

The project now supports deployment as a static site with a comprehensive dashboard:

### 🔗 Key Endpoints
- `/` - Login page (hardcoded authentication)
- `/dashboard.html` - Main dashboard with all features
- `/dev` - Development dashboard for quick access
- `/health` - System health API endpoint

### 🔐 Authentication
- **Username**: `admin`  
- **Password**: `rebecca2024`
- All dashboard access requires authentication
- Secure token-based session management

### 📊 Dashboard Features
- **Overview**: System stats, uptime, message counts
- **/dev Dashboard**: Live updates and system health monitoring  
- **Live Logs**: Real-time log streaming with auto-scroll
- **Copilot Chat**: Direct chat interface with Rebecca AI
- **Responsive Design**: Works on all devices

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables (optional for static site mode)
4. Start the server:
   ```bash
   npm start
   ```
5. Visit `http://localhost:8080` and login with `admin`/`rebecca2024`

## Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Optional - for Telegram bot functionality
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional - for Rebecca AI chat functionality  
RUBE_API_KEY=your_rube_app_api_key_here
RUBE_API_URL=https://api.rube.app (optional, defaults to https://api.rube.app)

# Server configuration
PORT=8080 (optional, defaults to 8080)
```

**Note**: The static site works without any environment variables. Telegram and AI chat features require the respective API keys.

## Development

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### Web Interface
- `GET /` - Login page for dashboard access
- `GET /dashboard.html` - Main dashboard interface  
- `GET /dev` - Development dashboard page
- `GET /health` - Health check endpoint

### Protected API (requires authentication)
- `POST /api/login` - Authentication endpoint
- `POST /api/chat` - Chat with Rebecca AI
- `GET /api/stats` - System statistics  
- `GET /api/logs/stream` - Live log streaming (SSE)
- `GET /api/live-updates` - Live system updates (SSE)

### Telegram (optional)
- `POST /webhook` - Telegram webhook endpoint (if configured)

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

The application supports multiple deployment modes:

### Static Site Mode (Recommended)
- No environment variables required
- Full dashboard functionality available  
- Perfect for development and monitoring
- Deploy to any Node.js hosting platform

### With Telegram Bot
- Set `TELEGRAM_BOT_TOKEN` environment variable
- Set up webhook: `https://api.telegram.org/bot{TOKEN}/setWebhook`
- Webhook URL: `https://your-domain.com/webhook`

### With AI Chat
- Set `RUBE_API_KEY` environment variable  
- Chat functionality available in dashboard
- Compatible with existing rube.app integration

### Deployment Platforms
- **Heroku**: Works out of the box with `package.json`
- **Vercel/Netlify**: Configure as Node.js application  
- **Docker**: Can be containerized easily
- **VPS**: Run directly with PM2 or systemd
- **Railway/Render**: Compatible with zero configuration

## License

MIT License - feel free to use and modify as needed.