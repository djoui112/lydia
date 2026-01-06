const API_BASE = '../php/api';

document.getElementById('edit-architect-profile-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('edit-architect-profile-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

const dateInput = document.getElementById('edit-architect-birth');
const dateDisplay = document.getElementById('edit-architect-birth-display');

dateInput.addEventListener('change', function () {
    if (this.value) {
        const [year, month, day] = this.value.split('-');
        dateDisplay.value = `${day}/${month}/${year}`;
    }
});

document.querySelectorAll('.date-icon, #edit-architect-birth-display').forEach(el => {
    el.addEventListener('click', function (e) {
        e.preventDefault();
        try {
            dateInput.showPicker();
        } catch {
            dateInput.focus();
            dateInput.click();
        }
    });
});

window.addEventListener('load', async function () {
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok || data.success === false) return;

        const architect = data.data.architect || {};
        const user = data.data.user || {};

        if (architect.first_name) document.getElementById('edit-architect-fname').value = architect.first_name;
        if (architect.last_name) document.getElementById('edit-architect-lname').value = architect.last_name;
        if (user.email) document.getElementById('edit-architect-email').value = user.email;
        if (user.phone_number) document.getElementById('edit-architect-phone').value = user.phone_number;
        if (architect.city) document.getElementById('edit-architect-city').value = architect.city;
        if (architect.date_of_birth) document.getElementById('edit-architect-birth').value = architect.date_of_birth;
        if (architect.gender) {
            const genderInput = document.querySelector(
                `input[name="edit-architect-gender"][value="${architect.gender}"]`
            );
            if (genderInput) genderInput.checked = true;
        }
    } catch (e) {
        // ignore
    }
});

document.getElementById('edit-profile-architect').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fname = document.getElementById('edit-architect-fname');
    const lname = document.getElementById('edit-architect-lname');
    const email = document.getElementById('edit-architect-email');
    const phone = document.getElementById('edit-architect-phone');
    const city = document.getElementById('edit-architect-city');
    const birth = document.getElementById('edit-architect-birth');
    const gender = document.querySelector('input[name="edit-architect-gender"]:checked');
    let isValid = true;

    clearErrors();

    if (!fname.value.trim()) {
        showError(fname, 'edit-architect-fname-error', 'First name is required');
        isValid = false;
    } else if (fname.value.trim().length < 2) {
        showError(fname, 'edit-architect-fname-error', 'First name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
        showError(fname, 'edit-architect-fname-error', 'First name can only contain letters');
        isValid = false;
    }

    if (!lname.value.trim()) {
        showError(lname, 'edit-architect-lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.value.trim().length < 2) {
        showError(lname, 'edit-architect-lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
        showError(lname, 'edit-architect-lname-error', 'Last name can only contain letters');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'edit-architect-email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
        showError(email, 'edit-architect-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'edit-architect-phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'edit-architect-phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    if (!city.value) {
        showError(city, 'edit-architect-city-error', 'Please select a city');
        isValid = false;
    }

    if (!birth.value) {
        showError(birth, 'edit-architect-birth-error', 'Date of birth is required');
        isValid = false;
    } else {
        const birthDate = new Date(birth.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 18) {
            showError(birth, 'edit-architect-birth-error', 'You must be at least 18 years old');
            isValid = false;
        }
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
                phone_number: phone.value.trim(),
                city: city.value,
                date_of_birth: birth.value,
                gender: gender.value,
                address: null,
            }),
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
            alert(data.message || 'Failed to save changes');
            return;
        }
        alert('Profile updated successfully!');
        window.location.href = 'architect-interface.html';
    } catch (err) {
        alert('Network error. Please try again.');
    }
});

function showError(input, errorId, message) {
    const wrapper = input.closest('div, .select-wrapper');
    if (wrapper) wrapper.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('.select-wrapper, div').forEach(el => el.classList.remove('error'));
}

const logoutArchitectBtn = document.getElementById('logout-architect');
if (logoutArchitectBtn) {
    logoutArchitectBtn.addEventListener('click', async () => {
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

