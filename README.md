# Rebecca Autonomous Bot - rube.app Integration

A sophisticated Telegram bot designed to seamlessly integrate with rube.app's workflow automation platform. Rebecca provides intelligent AI-powered responses and serves as a bridge between Telegram users and rube.app workflows.

## 🚀 Features

- **AI-Powered Responses**: Utilizes OpenAI's GPT-4 for intelligent conversation
- **rube.app Integration**: Native webhook support for workflow automation
- **Enhanced Error Handling**: Comprehensive error management and logging
- **Contextual Awareness**: Maintains context for workflow-related conversations
- **Markdown Support**: Rich text formatting for better user experience
- **Health Monitoring**: Built-in health checks and status endpoints
- **Graceful Shutdown**: Proper cleanup on server termination

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │    Rebecca      │    │    OpenAI       │
│   Messages      │───▶│   Autonomous    │───▶│      API        │
│                 │    │      Bot        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    rube.app     │
                       │   Workflows     │
                       │                 │
                       └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Telegram Bot Token
- rube.app account (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iansmith35/rebecca-autonomous.git
   cd rebecca-autonomous
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   PORT=8080
   RUBE_WEBHOOK_SECRET=optional_webhook_secret
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🔗 API Endpoints

### Telegram Webhook
```
POST /telegram/RebeccaRubeBot/webhook
```
Main endpoint for receiving Telegram messages and generating AI responses.

### rube.app Integration
```
POST /rube/webhook
```
Handles workflow automation triggers from rube.app:
- `workflow_completed`: Notifies when workflows finish
- `task_created`: Announces new task creation
- `notification`: General notifications

### Health & Status
```
GET /RebeccaRubeBot/health  # Health check
GET /status                 # Detailed status info
```

## 🤖 rube.app Integration Guide

### Setting up Webhooks

1. **Configure Telegram Webhook**
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
   -H "Content-Type: application/json" \
   -d '{
     "url": "https://your-domain.com/telegram/RebeccaRubeBot/webhook",
     "max_connections": 100,
     "allowed_updates": ["message"]
   }'
   ```

2. **Configure rube.app Webhook**
   In your rube.app workflow, add a webhook action pointing to:
   ```
   https://your-domain.com/rube/webhook
   ```

### Workflow Integration Examples

#### Workflow Completion Notification
```json
{
  "action": "workflow_completed",
  "data": {
    "workflow_name": "Data Processing Pipeline",
    "status": "completed",
    "duration": "5m 23s"
  },
  "target_chat_id": "123456789"
}
```

#### Task Creation Alert
```json
{
  "action": "task_created", 
  "data": {
    "title": "Review quarterly reports",
    "priority": "high",
    "assigned_to": "john@company.com"
  },
  "target_chat_id": "123456789"
}
```

## 💡 Usage Examples

### Basic Chat Interaction
User: "What's the weather like today?"
Rebecca: "I'm Rebecca, your autonomous assistant! I can help with workflow automation and general questions, but I don't have access to real-time weather data. You might want to check your local weather service or ask me to help set up a weather workflow in rube.app!"

### Workflow Context Awareness
When integrated with rube.app workflows, Rebecca maintains context about:
- Current workflow states
- Task assignments
- User preferences
- Historical interactions

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API authentication | - |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token | - |
| `PORT` | No | Server port | 8080 |
| `RUBE_WEBHOOK_SECRET` | No | Webhook validation secret | - |

### Advanced Configuration

```javascript
// server.js - Customize AI behavior
const systemPrompt = `You are Rebecca, an autonomous assistant integrated with rube.app. 
You help users with workflow automation, task management, and intelligent responses.
Context: ${JSON.stringify(context)}`;
```

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check webhook configuration
   - Verify environment variables
   - Check server logs for errors

2. **OpenAI API errors**
   - Validate API key
   - Check API quota and billing
   - Monitor rate limits

3. **rube.app integration issues**
   - Verify webhook URLs
   - Check payload formats
   - Validate authentication

### Debugging

Enable detailed logging:
```bash
DEBUG=* npm start
```

Check health endpoint:
```bash
curl https://your-domain.com/RebeccaRubeBot/health
```

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl -X GET https://your-domain.com/RebeccaRubeBot/health

# Test rube.app webhook
curl -X POST https://your-domain.com/rube/webhook \
-H "Content-Type: application/json" \
-d '{
  "action": "notification",
  "data": {"message": "Test notification"},
  "target_chat_id": "YOUR_CHAT_ID"
}'
```

### Telegram Testing
1. Send `/start` to your bot
2. Send any message to test AI responses
3. Check server logs for processing details

## 🚀 Deployment

### Production Considerations

1. **Security**
   - Use HTTPS for all webhooks
   - Implement webhook secret validation
   - Regular security updates

2. **Monitoring**
   - Set up health check monitoring
   - Implement error alerting
   - Monitor API usage quotas

3. **Scaling**
   - Consider horizontal scaling for high load
   - Implement rate limiting
   - Use connection pooling

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 📝 Changelog

### Version 2.0.0
- Complete rebuild for rube.app integration
- Enhanced error handling and logging
- Improved AI context awareness
- Added rube.app webhook endpoints
- Comprehensive documentation
- Graceful shutdown handling

### Version 1.0.0
- Initial Telegram bot implementation
- Basic OpenAI integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Rebecca Autonomous** - Bridging AI and workflow automation through intelligent conversation.