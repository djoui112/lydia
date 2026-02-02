// Shared validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Profile image preview
document.getElementById('profile-upload-arch').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        document.getElementById('profile-preview-arch').src = event.target.result;
        sessionStorage.setItem('architectProfile', event.target.result);
    };
    reader.readAsDataURL(file);
});

// Form validation
document.getElementById('login-architect-1').addEventListener('submit', function (e) {
    e.preventDefault();

    const fname = document.getElementById('architect-fname');
    const lname = document.getElementById('architect-lname');
    const email = document.getElementById('architect-email');
    const password = document.getElementById('architect-password');
    const cpassword = document.getElementById('architect-cpassword');
    const address = document.getElementById('architect-address');
    const bio = document.getElementById('architect-bio');

    let isValid = true;
    clearErrors();

    // First name
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

    // Last name
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

    // Email
    if (!email.value.trim()) {
        showError(email, 'email-error', 'Email is required');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
        showError(email, 'email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Password
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

    // Confirm password
    if (!cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Please confirm your password');
        isValid = false;
    } else if (password.value !== cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Passwords do not match');
        isValid = false;
    }

    // Address
    if (address.value.trim().length < 10) {
        showError(address, 'address-error', 'Address must be at least 10 characters');
        isValid = false;
    }

    // Bio
    if (bio.value.trim().length < 30) {
        showError(bio, 'bio-error', 'Bio must be at least 30 characters');
        isValid = false;
    }

    if (!isValid) return;

    sessionStorage.setItem('architectData1', JSON.stringify({
        fname: fname.value.trim(),
        lname: lname.value.trim(),
        email: email.value.trim(),
        password: password.value,
        address: address.value.trim(),
        bio: bio.value.trim()
    }));

    window.location.href = 'archiLogin2.html';
});

// Helpers
function showError(input, errorId, message) {
    input.parentElement.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}
