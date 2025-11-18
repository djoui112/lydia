// Profile image upload
document.getElementById('profile-upload-agency').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-preview-agency').src = event.target.result;
            // Store image for next page
            sessionStorage.setItem('agencyProfile', event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Form validation
document.getElementById('login-agency-1').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('agency-email');
    const password = document.getElementById('agency-password');
    const cpassword = document.getElementById('agency-cpassword');
    const name = document.getElementById('agency-name');
    const phone = document.getElementById('agency-phone');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, 'email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'password-error', 'Password is required');
        isValid = false;
    } else if (password.value.length < 8) {
        showError(password, 'password-error', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
        showError(password, 'password-error', 'Password must contain uppercase, lowercase and number');
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

    // Agency name validation
    if (!name.value.trim()) {
        showError(name, 'name-error', 'Agency name is required');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        showError(name, 'name-error', 'Agency name must be at least 3 characters');
        isValid = false;
    }

    // Phone validation
    // Phone validation: 10 digits starting with 05, 06 or 07
    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    if (isValid) {
        // Store data for page 2
        sessionStorage.setItem('agencyData1', JSON.stringify({
            email: email.value,
            password: password.value,
            name: name.value,
            phone: phone.value
        }));
        // Go to agencyLogin2 in the same login folder
        window.location.href = 'agencyLogin2.html';
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
