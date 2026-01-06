const API_BASE = '../php/api';

document.getElementById('edit-agency-profile-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('edit-agency-profile-preview').src = event.target.result;
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

        const agency = data.data.agency || {};
        const user = data.data.user || {};

        if (agency.name) document.getElementById('edit-agency-name').value = agency.name;
        if (user.email) document.getElementById('edit-agency-email').value = user.email;
        if (user.phone_number) document.getElementById('edit-agency-phone').value = user.phone_number;
        if (agency.city) document.getElementById('edit-agency-city').value = agency.city;
        if (agency.address) document.getElementById('edit-agency-address').value = agency.address;
    } catch (e) {
        // ignore
    }
});

document.getElementById('edit-profile-agency').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('edit-agency-name');
    const email = document.getElementById('edit-agency-email');
    const phone = document.getElementById('edit-agency-phone');
    const city = document.getElementById('edit-agency-city');
    const address = document.getElementById('edit-agency-address');
    let isValid = true;

    clearErrors();

    if (!name.value.trim()) {
        showError(name, 'edit-agency-name-error', 'Agency name is required');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        showError(name, 'edit-agency-name-error', 'Agency name must be at least 3 characters');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'edit-agency-email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, 'edit-agency-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'edit-agency-phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'edit-agency-phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    if (!city.value) {
        showError(city, 'edit-agency-city-error', 'Please select a city');
        isValid = false;
    }

    if (!address.value.trim()) {
        showError(address, 'edit-agency-address-error', 'Office address is required');
        isValid = false;
    } else if (address.value.trim().length < 5) {
        showError(address, 'edit-agency-address-error', 'Address must be at least 5 characters');
        isValid = false;
    }

    if (!isValid) return;

    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: name.value.trim(),
                email: email.value.trim(),
                phone_number: phone.value.trim(),
                city: city.value,
                address: address.value.trim(),
            }),
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
            alert(data.message || 'Failed to save changes');
            return;
        }
        alert('Profile updated successfully!');
        window.location.href = 'agency-interface.html';
    } catch (err) {
        alert('Network error. Please try again.');
    }
});

function showError(input, errorId, message) {
    const wrapper = input.closest('div, .select-wrapper');
    if (wrapper) {
        wrapper.classList.add('error');
    }
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('.select-wrapper, div').forEach(el => {
        el.classList.remove('error');
    });
}

const logoutAgencyBtn = document.getElementById('logout-agency');
if (logoutAgencyBtn) {
    logoutAgencyBtn.addEventListener('click', async () => {
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

