const ARCH_API_BASE = '../../php/api';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-architect-2');
    if (!form) return;

    const phone = document.getElementById('architect-phone');
    const city = document.getElementById('architect-city');
    const birth = document.getElementById('architect-birth');
    const birthDisplay = document.getElementById('architect-birth-display');


    const experience = document.getElementById('architect-experience');
    const portfolio = document.getElementById('architect-portfolio');
    const linkedin = document.getElementById('architect-linkedin');
    const expertise = document.getElementById('architect-expertise');

    birth.addEventListener('change', function () {
    if (!this.value) return;

    // this.value format: YYYY-MM-DD
    const [year, month, day] = this.value.split('-');

    // Display as DD/MM/YYYY
    birthDisplay.value = `${day}/${month}/${year}`;
});

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearErrors();

        let isValid = true;

        // Phone
        const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
        if (!phone.value.trim()) {
            showError(phone, 'phone-error', 'Phone number is required');
            isValid = false;
        } else if (!phoneRegex.test(phone.value.trim())) {
            showError(phone, 'phone-error', 'Phone must start with 05, 06 or 07');
            isValid = false;
        }

        // City
        if (!city.value) {
            showError(city, 'city-error', 'Please select a city');
            isValid = false;
        }

        // Birth date
        if (!birth.value) {
            showError(birth, 'birth-error', 'Date of birth is required');
            isValid = false;
        }

        // Years of experience (optional but must be >= 0 if provided)
        if (experience && experience.value) {
            const years = Number(experience.value);
            if (Number.isNaN(years) || years < 0) {
                showError(experience, 'experience-error', 'Years of experience must be a positive number');
                isValid = false;
            }
        }

        // Portfolio URL
        if (portfolio.value && !isValidURL(portfolio.value)) {
            showError(portfolio, 'portfolio-error', 'Invalid portfolio URL');
            isValid = false;
        }

        // LinkedIn URL
        if (linkedin.value && !isValidURL(linkedin.value)) {
            showError(linkedin, 'linkedin-error', 'Invalid LinkedIn URL');
            isValid = false;
        }

        // Expertise
        if (!expertise.value.trim()) {
            showError(expertise, 'expertise-error', 'Primary expertise is required');
            isValid = false;
        }

        if (!isValid) return;

        // Get step 1 data (user already registered in step 1)
        const data1 = JSON.parse(sessionStorage.getItem('architectData1') || '{}');
        if (!data1.email) {
            showError(phone, 'phone-error', 'Previous step missing');
            return;
        }

        // User is already registered and logged in from step 1
        // Now update profile with additional fields via profile.php
        const updateData = {
            phone_number: phone.value.trim(),
            city: city.value,
            date_of_birth: birth.value,
            gender: document.querySelector('input[name="gender"]:checked')?.value || null,
            address: data1.address,
            bio: data1.bio,
            years_of_experience: experience && experience.value ? Number(experience.value) : null,
            portfolio_url: portfolio.value.trim() || null,
            linkedin_url: linkedin.value.trim() || null,
            primary_expertise: expertise.value.trim() || null
        };

        try {
            // Update profile with additional fields (user already registered in step 1)
            const res = await fetch(`${ARCH_API_BASE}/users/profile.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            const data = await res.json();
            if (!res.ok || data.success === false) {
                showError(phone, 'phone-error', data.message || 'Failed to update profile');
                return;
            }

            sessionStorage.clear();
            window.location.href = '../architect-interface.html';

        } catch (err) {
            showError(phone, 'phone-error', 'Network error');
        }
    });
});

// Helpers
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showError(input, errorId, message) {
    const wrapper = input.closest('div, .select-wrapper, .date-wrapper');
    if (wrapper) wrapper.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}
