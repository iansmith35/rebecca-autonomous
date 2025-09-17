// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('rebecca_auth_token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Initialize dashboard
    initializeNavigation();
    initializeLogout();
    initializeChat();
    initializeLogs();
    initializeStats();
    initializeLiveUpdates();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update navigation
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            // Update sections
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function initializeLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('rebecca_auth_token');
        window.location.href = '/';
    });
}

function initializeChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        appendMessage('user', message);
        chatInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('rebecca_auth_token')}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (response.ok) {
                appendMessage('assistant', data.reply);
            } else {
                appendMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            }
        } catch (error) {
            console.error('Chat error:', error);
            appendMessage('assistant', 'Connection error. Please try again.');
        }
    }

    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function initializeLogs() {
    const logsOutput = document.getElementById('logs-output');
    const clearLogsBtn = document.getElementById('clearLogs');
    const autoScrollCheckbox = document.getElementById('autoScroll');

    clearLogsBtn.addEventListener('click', function() {
        logsOutput.innerHTML = '';
    });

    // Connect to logs stream
    connectToLogStream();

    function connectToLogStream() {
        const eventSource = new EventSource('/api/logs/stream');
        
        eventSource.onmessage = function(event) {
            const logData = JSON.parse(event.data);
            appendLogEntry(logData);
        };

        eventSource.onerror = function(error) {
            console.error('Log stream error:', error);
            appendLogEntry({
                timestamp: new Date().toISOString(),
                level: 'error',
                message: 'Log stream disconnected. Attempting to reconnect...'
            });
            
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                eventSource.close();
                connectToLogStream();
            }, 5000);
        };
    }

    function appendLogEntry(logData) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timestamp = new Date(logData.timestamp).toLocaleTimeString();
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-level-${logData.level}">[${logData.level.toUpperCase()}]</span>
            ${logData.message}
        `;
        
        logsOutput.appendChild(logEntry);
        
        // Auto-scroll if enabled
        if (autoScrollCheckbox.checked) {
            logsOutput.scrollTop = logsOutput.scrollHeight;
        }
        
        // Limit log entries to prevent memory issues
        const entries = logsOutput.children;
        if (entries.length > 1000) {
            logsOutput.removeChild(entries[0]);
        }
    }
}

function initializeStats() {
    // Update stats periodically
    updateStats();
    setInterval(updateStats, 30000); // Update every 30 seconds

    async function updateStats() {
        try {
            const response = await fetch('/api/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('rebecca_auth_token')}`
                }
            });
            
            if (response.ok) {
                const stats = await response.json();
                updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('Stats update error:', error);
        }
    }

    function updateStatsDisplay(stats) {
        document.getElementById('bot-status').textContent = stats.botStatus || 'Running';
        document.getElementById('message-count').textContent = stats.messageCount || '0';
        document.getElementById('uptime').textContent = stats.uptime || '--';
        document.getElementById('api-status').textContent = stats.apiStatus || 'Connected';
        
        // Update connection indicator
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (stats.connected) {
            indicator.className = 'status-indicator';
            statusText.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            statusText.textContent = 'Disconnected';
        }
    }
}

function initializeLiveUpdates() {
    const liveUpdatesContainer = document.getElementById('live-updates');
    
    // Connect to live updates stream
    const eventSource = new EventSource('/api/live-updates');
    
    eventSource.onmessage = function(event) {
        const updateData = JSON.parse(event.data);
        appendLiveUpdate(updateData);
    };

    function appendLiveUpdate(updateData) {
        const updateEntry = document.createElement('p');
        updateEntry.textContent = `${new Date().toLocaleTimeString()}: ${updateData.message}`;
        
        // Insert at the beginning
        liveUpdatesContainer.insertBefore(updateEntry, liveUpdatesContainer.firstChild);
        
        // Limit to 10 updates
        const updates = liveUpdatesContainer.children;
        if (updates.length > 10) {
            liveUpdatesContainer.removeChild(updates[updates.length - 1]);
        }
    }
}