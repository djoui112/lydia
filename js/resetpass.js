const resetForm = document.getElementById('reset-form');
const stepEmail = document.getElementById('step-email');
const stepCode = document.getElementById('step-code');
const emailInput = document.getElementById('reset-email');
const emailError = document.getElementById('reset-email-error');
const codeInput = document.getElementById('reset-code');
const codeError = document.getElementById('reset-code-error');
const newPasswordInput = document.getElementById('new-password');
const newPasswordError = document.getElementById('new-password-error');
const confirmPasswordInput = document.getElementById('confirm-password');
const confirmPasswordError = document.getElementById('confirm-password-error');
const submitEmailBtn = document.getElementById('submit-email');
const submitNewPasswordBtn = document.getElementById('submit-new-password');

const API_BASE = '../php/api/auth';

function clearFieldError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    inputEl.parentElement?.classList.remove('error');
    errorEl.textContent = '';
}

function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    inputEl.parentElement?.classList.add('error');
    errorEl.textContent = message;
}

submitEmailBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    clearFieldError(emailInput, emailError);

    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        setFieldError(emailInput, emailError, 'Email is required');
        return;
    }

    if (!emailRegex.test(email)) {
        setFieldError(emailInput, emailError, 'Please enter a valid email');
        return;
    }

    submitEmailBtn.disabled = true;
    submitEmailBtn.textContent = 'Sending...';

    try {
        const res = await fetch(`${API_BASE}/forgot_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
            setFieldError(emailInput, emailError, data.message || 'Failed to send code');
            submitEmailBtn.disabled = false;
            submitEmailBtn.textContent = 'Send Code';
            return;
        }

        // Move to code step
        if (stepEmail && stepCode) {
            stepEmail.style.display = 'none';
            stepCode.style.display = 'block';
        }
    } catch (err) {
        setFieldError(emailInput, emailError, 'Network error. Please try again.');
    } finally {
        submitEmailBtn.disabled = false;
        submitEmailBtn.textContent = 'Send Code';
    }
});

submitNewPasswordBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    clearFieldError(codeInput, codeError);
    clearFieldError(newPasswordInput, newPasswordError);
    clearFieldError(confirmPasswordInput, confirmPasswordError);

    const email = emailInput.value.trim();
    const code = codeInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    if (!code) {
        setFieldError(codeInput, codeError, 'Code is required');
        hasError = true;
    }

    if (!newPassword) {
        setFieldError(newPasswordInput, newPasswordError, 'New password is required');
        hasError = true;
    } else if (newPassword.length < 8) {
        setFieldError(newPasswordInput, newPasswordError, 'Password must be at least 8 characters');
        hasError = true;
    }

    if (!confirmPassword) {
        setFieldError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
        hasError = true;
    } else if (confirmPassword !== newPassword) {
        setFieldError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    submitNewPasswordBtn.disabled = true;
    submitNewPasswordBtn.textContent = 'Saving...';

    try {
        const res = await fetch(`${API_BASE}/reset_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, new_password: newPassword }),
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
            const msg = data.message || 'Failed to reset password';
            setFieldError(codeInput, codeError, msg);
            submitNewPasswordBtn.disabled = false;
            submitNewPasswordBtn.textContent = 'Change Password';
            return;
        }

        alert('Password has been changed. You can now login.');
        window.location.href = 'login/login.html';
    } catch (err) {
        setFieldError(codeInput, codeError, 'Network error. Please try again.');
    } finally {
        submitNewPasswordBtn.disabled = false;
        submitNewPasswordBtn.textContent = 'Change Password';
    }
});
