document.getElementById('profile-upload-arch').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-preview-arch').src = event.target.result;
            sessionStorage.setItem('architectProfile', event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Form validation
document.getElementById('login-architect-1').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fname = document.getElementById('architect-fname');
    const lname = document.getElementById('architect-lname');
    const email = document.getElementById('architect-email');
    const password = document.getElementById('architect-password');
    const cpassword = document.getElementById('architect-cpassword');
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

    if (isValid) {
        sessionStorage.setItem('architectData1', JSON.stringify({
            fname: fname.value,
            lname: lname.value,
            email: email.value,
            password: password.value
        }));
        // Go to architect login step 2 (same login folder)
        window.location.href = 'archiLogin2.html';
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


//archiValidation2


