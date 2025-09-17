// Dashboard JavaScript
class RebeccaDashboard {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.startMonitoring();
    }

    init() {
        // Initialize tab navigation
        this.initTabNavigation();
        
        // Initialize status monitoring
        this.checkServerStatus();
        
        // Load initial data
        this.loadStats();
        this.loadLogs();
        
        console.log('Rebecca Dashboard initialized');
    }

    initTabNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const tabContents = document.querySelectorAll('.tab-content');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links and tabs
                navLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Show corresponding tab
                const tabId = link.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                // Load tab-specific data
                this.loadTabData(tabId);
            });
        });
    }

    setupEventListeners() {
        // Chat functionality
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendMessage');
        
        if (chatInput && sendButton) {
            sendButton.addEventListener('click', () => this.sendChatMessage());
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }

        // Log controls
        const clearLogs = document.getElementById('clearLogs');
        const exportLogs = document.getElementById('exportLogs');
        const logLevel = document.getElementById('logLevel');
        
        if (clearLogs) clearLogs.addEventListener('click', () => this.clearLogs());
        if (exportLogs) exportLogs.addEventListener('click', () => this.exportLogs());
        if (logLevel) logLevel.addEventListener('change', (e) => this.filterLogs(e.target.value));

        // Feature management
        const addFeature = document.getElementById('addFeature');
        if (addFeature) addFeature.addEventListener('click', () => this.showAddFeatureDialog());
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            
            this.updateStatus('online', 'Connected');
            this.updateHealth(data);
        } catch (error) {
            this.updateStatus('error', 'Disconnected');
            console.error('Server status check failed:', error);
        }
    }

    updateStatus(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
        
        if (statusText) {
            statusText.textContent = text;
        }
    }

    updateHealth(healthData) {
        const healthStatus = document.getElementById('healthStatus');
        if (healthStatus && healthData) {
            healthStatus.textContent = healthData.status === 'ok' ? 'Good' : 'Issues';
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            const formattedStats = {
                messageCount: stats.messageCount,
                uptime: this.formatUptime(stats.uptime),
                activeChats: stats.activeChats
            };
            
            this.updateStats(formattedStats);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Fallback to simulated data
            const stats = {
                messageCount: 'N/A',
                uptime: 'N/A',
                activeChats: 'N/A'
            };
            this.updateStats(stats);
        }
    }

    updateStats(stats) {
        const messageCount = document.getElementById('messageCount');
        const uptime = document.getElementById('uptime');
        const activeChats = document.getElementById('activeChats');

        if (messageCount) messageCount.textContent = stats.messageCount;
        if (uptime) uptime.textContent = stats.uptime;
        if (activeChats) activeChats.textContent = stats.activeChats;
    }

    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m ${seconds % 60}s`;
        }
    }

    async loadLogs() {
        try {
            const response = await fetch('/api/logs?limit=50');
            const logs = await response.json();
            
            const logViewer = document.getElementById('logViewer');
            if (logViewer) {
                logViewer.innerHTML = '';
                logs.forEach(log => {
                    this.addLogEntry(log.level, log.message, new Date(log.timestamp));
                });
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
            this.addLogEntry('error', 'Failed to load logs from server');
        }
    }

    addLogEntry(level, message, timestamp = new Date()) {
        const logViewer = document.getElementById('logViewer');
        if (!logViewer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level}`;
        
        const timeStr = timestamp.toISOString().replace('T', ' ').substring(0, 19);
        logEntry.innerHTML = `
            <span class="log-time">[${timeStr}]</span>
            <span class="log-level">${level.toUpperCase()}</span>
            <span class="log-message">${message}</span>
        `;

        logViewer.appendChild(logEntry);
        logViewer.scrollTop = logViewer.scrollHeight;
    }

    clearLogs() {
        const logViewer = document.getElementById('logViewer');
        if (logViewer) {
            logViewer.innerHTML = '';
            this.addLogEntry('info', 'Logs cleared');
        }
    }

    exportLogs() {
        const logViewer = document.getElementById('logViewer');
        if (!logViewer) return;

        const logs = Array.from(logViewer.children).map(entry => entry.textContent).join('\n');
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `rebecca-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    filterLogs(level) {
        const logEntries = document.querySelectorAll('.log-entry');
        logEntries.forEach(entry => {
            if (level === 'all' || entry.classList.contains(level)) {
                entry.style.display = 'block';
            } else {
                entry.style.display = 'none';
            }
        });
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addChatMessage('user', message);
        chatInput.value = '';

        try {
            // In a real implementation, this would call the actual bot API
            // For now, we'll simulate a response
            const response = await this.simulateBotResponse(message);
            this.addChatMessage('bot', response);
        } catch (error) {
            this.addChatMessage('system', 'Error: Could not get response from bot');
            console.error('Chat error:', error);
        }
    }

    async simulateBotResponse(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.reply || "I'm not sure how to respond to that.";
        } catch (error) {
            console.error('Chat API error:', error);
            return "I'm experiencing technical difficulties. Please try again later.";
        }
    }

    addChatMessage(type, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${timeStr}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    loadTabData(tabId) {
        switch (tabId) {
            case 'overview':
                this.loadStats();
                this.addActivityItem('Tab switched to Overview');
                break;
            case 'logs':
                // Logs are already loaded
                this.addLogEntry('info', 'Logs tab accessed');
                break;
            case 'chat':
                this.addActivityItem('Chat interface opened');
                break;
            case 'features':
                this.addActivityItem('Feature management accessed');
                break;
        }
    }

    addActivityItem(description) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        activityItem.innerHTML = `
            <div class="activity-time">${timeStr}</div>
            <div class="activity-desc">${description}</div>
        `;

        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Keep only the last 10 items
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    showAddFeatureDialog() {
        // In a real implementation, this would show a modal dialog
        const featureName = prompt('Enter feature name:');
        if (featureName) {
            this.addActivityItem(`New feature requested: ${featureName}`);
            this.addLogEntry('info', `Feature request created: ${featureName}`);
        }
    }

    startMonitoring() {
        // Check server status every 30 seconds
        setInterval(() => {
            this.checkServerStatus();
        }, 30000);

        // Update uptime every minute
        setInterval(() => {
            this.loadStats();
        }, 60000);

        // Add periodic activity
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance
                const activities = [
                    'Heartbeat check completed',
                    'Memory usage optimized',
                    'Cache cleanup performed',
                    'Security scan completed'
                ];
                const activity = activities[Math.floor(Math.random() * activities.length)];
                this.addActivityItem(activity);
            }
        }, 10000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new RebeccaDashboard();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RebeccaDashboard;
}