const API_BASE = '../php/api';

document.getElementById('edit-client-profile-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('edit-client-profile-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

window.addEventListener('load', async function () {
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok || data.success === false) return;

        const client = data.data.client || {};
        const user = data.data.user || {};

        if (client.first_name) document.getElementById('edit-client-fname').value = client.first_name;
        if (client.last_name) document.getElementById('edit-client-lname').value = client.last_name;
        if (user.email) document.getElementById('edit-client-email').value = user.email;
    } catch (e) {
        // fail silently for now
    }
});

document.getElementById('edit-profile-client').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fname = document.getElementById('edit-client-fname');
    const lname = document.getElementById('edit-client-lname');
    const email = document.getElementById('edit-client-email');
    let isValid = true;

    clearErrors();

    if (!fname.value.trim()) {
        showError(fname, 'edit-client-fname-error', 'First name is required');
        isValid = false;
    } else if (fname.value.trim().length < 2) {
        showError(fname, 'edit-client-fname-error', 'First name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
        showError(fname, 'edit-client-fname-error', 'First name can only contain letters');
        isValid = false;
    }

    if (!lname.value.trim()) {
        showError(lname, 'edit-client-lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.value.trim().length < 2) {
        showError(lname, 'edit-client-lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
        showError(lname, 'edit-client-lname-error', 'Last name can only contain letters');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'edit-client-email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, 'edit-client-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    if (!isValid) return;

    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                first_name: fname.value.trim(),
                last_name: lname.value.trim(),
                email: email.value.trim(),
            }),
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
            alert(data.message || 'Failed to save changes');
            return;
        }
        alert('Profile updated successfully!');
        window.location.href = 'clientinterface.html';
    } catch (err) {
        alert('Network error. Please try again.');
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

const logoutClientBtn = document.getElementById('logout-client');
if (logoutClientBtn) {
    logoutClientBtn.addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE}/auth/logout.php`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            // ignore
        } finally {
            window.location.href = 'login/login.html';
        }
    });
}
