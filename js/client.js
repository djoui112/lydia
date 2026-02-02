
const CLIENT_API_BASE = '../../php/api';

// Shared validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Profile image upload
document.getElementById('profile-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Form validation + registration
document.getElementById('login-client').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fname = document.getElementById('client-fname');
    const lname = document.getElementById('client-lname');
    const email = document.getElementById('client-email');
    const password = document.getElementById('client-password');
    const cpassword = document.getElementById('client-cpassword');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // First name validation
    if (!fname.value.trim()) {
        showError(fname, 'fname-error', 'First name is required');
        isValid = false;
    } else if (fname.value.trim().length < 2) {
        showError(fname, 'fname-error', 'First name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
        showError(fname, 'fname-error', 'First name can only contain letters');
        isValid = false;
    }

    // Last name validation
    if (!lname.value.trim()) {
        showError(lname, 'lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.value.trim().length < 2) {
        showError(lname, 'lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
        showError(lname, 'lname-error', 'Last name can only contain letters');
        isValid = false;
    }

    // Email validation
    if (!email.value.trim()) {
        showError(email, 'email-error', 'Email is required');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
        showError(email, 'email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'password-error', 'Password is required');
        isValid = false;
    } else if (!PASSWORD_REGEX.test(password.value)) {
        showError(
            password,
            'password-error',
            'Password must be at least 8 characters and include uppercase, lowercase, number and symbol'
        );
        isValid = false;
    }

    // Confirm password validation
    if (!cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Please confirm your password');
        isValid = false;
    } else if (password.value !== cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Passwords do not match');
        isValid = false;
    }

    if (!isValid) return;

    try {
        const res = await fetch(`${CLIENT_API_BASE}/auth/register.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                user_type: 'client',
                email: email.value.trim(),
                password: password.value,
                first_name: fname.value.trim(),
                last_name: lname.value.trim()
            })
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
            showError(email, 'email-error', data.message || 'Registration failed');
            return;
        }

        // On successful registration, go to client interface
        window.location.href = '../clientinterface.html';
    } catch (err) {
        showError(email, 'email-error', 'Network error. Please try again.');
    }
});

function showError(input, errorId, message) {
    input.parentElement.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('input').forEach(inp => {
        if (inp.parentElement.classList) {
            inp.parentElement.classList.remove('error');
        }
    });
}
