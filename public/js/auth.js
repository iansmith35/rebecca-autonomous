// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('rebecca_auth_token')) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store the auth token
                localStorage.setItem('rebecca_auth_token', data.token);
                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                showError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            showError('Connection error. Please try again.');
            console.error('Login error:', error);
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
});