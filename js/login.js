const API_BASE = '../../php/api';

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email');
        const password = document.getElementById('password');
        let isValid = true;

        document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
        document.querySelectorAll('input').forEach(inp => inp.parentElement.classList.remove('error'));

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim()) {
            showError(email, 'email-error', 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(email.value)) {
            showError(email, 'email-error', 'Please enter a valid email');
            isValid = false;
        }

        if (!password.value.trim()) {
            showError(password, 'password-error', 'Password is required');
            isValid = false;
        } else if (password.value.length < 8) {
            showError(password, 'password-error', 'Password must be at least 8 characters');
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
