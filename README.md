# Rebecca Autonomous Telegram Bot

A minimal Telegram bot optimized for rube.app integration, providing AI-powered responses through OpenAI's GPT-4.

## Features

- **Telegram Integration**: Receives and responds to messages via webhook
- **AI Responses**: Uses OpenAI GPT-4 for intelligent conversation
- **Health Monitoring**: Built-in health check endpoint
- **Error Handling**: Robust error handling for API failures
- **Minimal Footprint**: Optimized for Telegram-only functionality

## Endpoints

- `POST /telegram/RebeccaRubeBot/webhook` - Telegram webhook for receiving messages
- `GET /RebeccaRubeBot/health` - Health check endpoint

## Environment Variables

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (defaults to 8080)

## Installation

```bash
npm install
npm start
```

## rube.app Integration

This bot is specifically designed for rube.app integration with:
- Structured webhook endpoints using the RebeccaRubeBot naming convention
- Health check endpoint for monitoring
- Optimized for cloud deployment and scaling

## Architecture

The bot follows a simple, efficient architecture:
1. Express server receives Telegram webhooks
2. Messages are processed by the `askRebecca` function
3. OpenAI API generates intelligent responses
4. Responses are sent back to Telegram users

No HTML, web interfaces, or additional functionality - purely optimized for Telegram messaging.