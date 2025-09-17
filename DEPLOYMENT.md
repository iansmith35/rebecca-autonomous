# Rebecca Autonomous Bot - Deployment Guide

This guide covers deployment options for the Rebecca Autonomous Bot with rube.app integration.

## 🚀 Quick Deployment Options

### 1. Heroku Deployment

**Prerequisites:**
- Heroku CLI installed
- Git repository setup

**Steps:**
```bash
# Login to Heroku
heroku login

# Create new app
heroku create rebecca-autonomous-bot

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key_here
heroku config:set TELEGRAM_BOT_TOKEN=your_token_here

# Deploy
git push heroku main

# Set webhook
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{"url": "https://rebecca-autonomous-bot.herokuapp.com/telegram/RebeccaRubeBot/webhook"}'
```

### 2. Railway Deployment

**Steps:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard
# Configure webhook URL
```

### 3. Render Deployment

**Steps:**
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic HTTPS
4. Configure webhook with your Render URL

### 4. DigitalOcean App Platform

**Steps:**
1. Fork/clone repository
2. Connect to DigitalOcean App Platform
3. Configure environment variables
4. Set auto-deploy from main branch
5. Configure webhook with app URL

## 🔧 Environment Variables Setup

All platforms require these environment variables:

```env
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
PORT=8080
RUBE_WEBHOOK_SECRET=optional_secret
```

## 🔗 Webhook Configuration

### Set Telegram Webhook
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
-H "Content-Type: application/json" \
-d '{
  "url": "https://your-domain.com/telegram/RebeccaRubeBot/webhook",
  "max_connections": 100,
  "allowed_updates": ["message"]
}'
```

### Verify Webhook
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### Delete Webhook (if needed)
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S rebecca -u 1001

USER rebecca

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/RebeccaRubeBot/health || exit 1

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  rebecca-bot:
    build: .
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - PORT=8080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/RebeccaRubeBot/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run
```bash
# Build image
docker build -t rebecca-autonomous .

# Run container
docker run -d \
  --name rebecca-bot \
  -p 8080:8080 \
  -e OPENAI_API_KEY=your_key \
  -e TELEGRAM_BOT_TOKEN=your_token \
  rebecca-autonomous

# Using docker-compose
docker-compose up -d
```

## ☁️ Cloud-Specific Configurations

### AWS Lambda (Serverless)

1. Install Serverless Framework
```bash
npm install -g serverless
```

2. Create `serverless.yml`:
```yaml
service: rebecca-autonomous

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}
    TELEGRAM_BOT_TOKEN: ${env:TELEGRAM_BOT_TOKEN}

functions:
  webhook:
    handler: lambda.handler
    events:
      - http:
          path: telegram/RebeccaRubeBot/webhook
          method: post
      - http:
          path: rube/webhook
          method: post
      - http:
          path: RebeccaRubeBot/health
          method: get
```

3. Create `lambda.js` wrapper:
```javascript
import serverless from 'serverless-http';
import app from './server.js';

export const handler = serverless(app);
```

### Google Cloud Run

1. Create `cloudbuild.yaml`:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/rebecca-autonomous', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/rebecca-autonomous']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'rebecca-autonomous'
      - '--image'
      - 'gcr.io/$PROJECT_ID/rebecca-autonomous'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

2. Deploy:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🔍 Monitoring & Logging

### Health Check Monitoring
Set up monitoring for:
- `GET /RebeccaRubeBot/health` - Should return 200
- `GET /status` - Should return bot information
- Response time < 5 seconds
- Memory usage
- Error rates

### Logging Configuration
```javascript
// Add to server.js for production logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS for all webhooks
- [ ] Implement rate limiting
- [ ] Validate webhook signatures
- [ ] Set secure headers
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

### Express Security Middleware
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Add security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

## 📊 Performance Optimization

### Production Optimizations
- Enable gzip compression
- Implement caching for frequent requests
- Use connection pooling
- Monitor memory usage
- Set up horizontal scaling

### Example Optimizations
```javascript
import compression from 'compression';

// Enable gzip compression
app.use(compression());

// Set cache headers for static responses
app.use('/status', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Environment Variables Not Set**
   ```bash
   # Check variables are set
   echo $OPENAI_API_KEY
   echo $TELEGRAM_BOT_TOKEN
   ```

2. **Webhook Not Working**
   ```bash
   # Test webhook manually
   curl -X POST https://your-domain.com/telegram/RebeccaRubeBot/webhook \
   -H "Content-Type: application/json" \
   -d '{"message":{"chat":{"id":123},"text":"test"}}'
   ```

3. **Health Check Failing**
   ```bash
   # Test health endpoint
   curl https://your-domain.com/RebeccaRubeBot/health
   ```

### Debugging Commands
```bash
# Check logs (platform-specific)
heroku logs --tail --app your-app-name
docker logs rebecca-bot
kubectl logs deployment/rebecca-autonomous

# Test locally
npm start
curl http://localhost:8080/RebeccaRubeBot/health
```

---

For additional support, check the main README.md or create an issue on GitHub.