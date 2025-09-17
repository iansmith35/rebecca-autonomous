# Rebecca Autonomous Telegram Bot

A minimalistic, robust Telegram bot that integrates with rube.app to provide autonomous AI assistance.

## Features

- **Minimalistic**: Clean, focused codebase with essential functionality only
- **Robust**: Comprehensive error handling and logging
- **Rube.app Integration**: Direct integration with rube.app API for AI responses
- **Telegram Webhook**: Efficient webhook-based message processing
- **Health Monitoring**: Built-in health check endpoint for monitoring

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

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `POST /webhook` - Telegram webhook endpoint

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