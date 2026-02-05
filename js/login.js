const API_BASE = 'mimaria/php/api';

// Shared validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Backend only requires minimum 8 characters - align frontend validation
const PASSWORD_MIN_LENGTH = 8;

// Check if user is already authenticated
window.addEventListener('load', async function() {
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.user?.user_type) {
                // User already logged in - redirect based on user_type
                const userType = data.data.user.user_type;
                let target = '../clientinterface.html';
                if (userType === 'architect') {
                    target = '../architect-interface.html';
                } else if (userType === 'agency') {
                    target = '../agency-interface.html';
                }
                window.location.href = target;
            }
        }
    } catch (err) {
        // Not logged in or error - allow login form to show
    }
});

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email');
        const password = document.getElementById('password');
        let isValid = true;

        document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
        document.querySelectorAll('input').forEach(inp => inp.parentElement.classList.remove('error'));

        if (!email.value.trim()) {
            showError(email, 'email-error', 'Email is required');
            isValid = false;
        } else if (!EMAIL_REGEX.test(email.value.trim())) {
            showError(email, 'email-error', 'Please enter a valid email');
            isValid = false;
        }

        if (!password.value.trim()) {
            showError(password, 'password-error', 'Password is required');
            isValid = false;
        } else if (password.value.length < PASSWORD_MIN_LENGTH) {
            showError(
                password,
                'password-error',
                'Password must be at least 8 characters'
            );
            isValid = false;
        }

        if (!isValid) return;

        try {
            const res = await fetch(`${API_BASE}/auth/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                showError(password, 'password-error', data.message || 'Login failed');
                return;
            }

            // Redirect based on user_type returned by API
            let target = '../clientinterface.html';
            if (data.data?.user_type === 'architect') {
                target = '../architect-interface.html';
            } else if (data.data?.user_type === 'agency') {
                target = '../agency-interface.html';
            }

            window.location.href = target;
        } catch (err) {
            showError(password, 'password-error', 'Network error. Please try again.');
        }
    });
}

function showError(input, errorId, message) {
    input.parentElement.classList.add('error');
    document.getElementById(errorId).textContent = message;
}
