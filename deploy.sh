#!/bin/bash

# Rebecca Autonomous Bot Deployment Script
# This script helps deploy the bot to various platforms

set -e

echo "🤖 Rebecca Autonomous Bot Deployment Script"
echo "============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed successfully"
}

# Function to run build
run_build() {
    echo "🏗️  Running build process..."
    npm run build
    echo "✅ Build completed successfully"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    npm test
    echo "✅ Tests completed"
}

# Function to check environment variables
check_env_vars() {
    echo "🔍 Checking environment variables..."
    
    if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
        echo "⚠️  TELEGRAM_BOT_TOKEN is not set"
        ENV_MISSING=true
    fi
    
    if [ -z "$RUBE_API_KEY" ]; then
        echo "⚠️  RUBE_API_KEY is not set"
        ENV_MISSING=true
    fi
    
    if [ "$ENV_MISSING" = true ]; then
        echo "❌ Missing required environment variables"
        echo "Please set the required environment variables before deployment:"
        echo "  - TELEGRAM_BOT_TOKEN: Your Telegram bot token"
        echo "  - RUBE_API_KEY: Your Rube.app API key"
        echo "  - RUBE_API_URL: Rube.app API URL (optional, defaults to https://api.rube.app)"
        echo "  - PORT: Server port (optional, defaults to 8080)"
        exit 1
    fi
    
    echo "✅ Environment variables are properly configured"
}

# Function to start the server
start_server() {
    echo "🚀 Starting Rebecca Autonomous Bot..."
    npm start
}

# Function to start in development mode
start_dev() {
    echo "🔧 Starting in development mode..."
    npm run dev
}

# Main deployment function
deploy() {
    echo "Starting deployment process..."
    
    install_dependencies
    run_build
    check_env_vars
    
    echo ""
    echo "✅ Deployment preparation complete!"
    echo ""
    echo "🌟 Your Rebecca Autonomous Bot is ready to deploy!"
    echo ""
    echo "Available endpoints after deployment:"
    echo "  📊 Dashboard: http://your-domain.com/dashboard"
    echo "  🏥 Health Check: http://your-domain.com/health"
    echo "  🤖 Webhook: http://your-domain.com/webhook"
    echo "  📈 API Stats: http://your-domain.com/api/stats"
    echo "  📋 API Logs: http://your-domain.com/api/logs"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to your hosting platform"
    echo "2. Set up the Telegram webhook with your deployed URL"
    echo "3. Access the dashboard to monitor your bot"
    echo ""
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "start")
        check_env_vars
        start_server
        ;;
    "dev")
        start_dev
        ;;
    "install")
        install_dependencies
        ;;
    "build")
        run_build
        ;;
    "test")
        run_tests
        ;;
    "check")
        check_env_vars
        ;;
    *)
        echo "Usage: $0 [deploy|start|dev|install|build|test|check]"
        echo ""
        echo "Commands:"
        echo "  deploy  - Full deployment preparation (default)"
        echo "  start   - Start the production server"
        echo "  dev     - Start in development mode"
        echo "  install - Install dependencies only"
        echo "  build   - Run build process only"
        echo "  test    - Run tests only"
        echo "  check   - Check environment variables only"
        exit 1
        ;;
esac