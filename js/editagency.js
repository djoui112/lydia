const API_BASE = '../php/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[5-7][0-9]{8}$/;

const agencyProfileUpload = document.getElementById('edit-agency-profile-upload');
if (agencyProfileUpload) {
  agencyProfileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('edit-agency-profile-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
  });
}

window.addEventListener('load', async function () {
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (res.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = 'login/login.html';
            return;
        }
        
        if (!res.ok) {
            console.error('Failed to load profile:', res.status, res.statusText);
            const text = await res.text();
            console.error('Response:', text.substring(0, 200));
            return;
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Response is not JSON. Content-Type:', contentType);
            const text = await res.text();
            console.error('Response:', text.substring(0, 200));
            return;
        }
        
        const data = await res.json();
        
        if (!data.success || !data.data) {
            console.error('Invalid response:', data);
            return;
        }

        const agency = data.data.agency || {};
        const user = data.data.user || {};

        console.log('Loaded user:', user);
        console.log('Loaded agency:', agency);

        const nameEl = document.getElementById('edit-agency-name');
        const emailEl = document.getElementById('edit-agency-email');
        const phoneEl = document.getElementById('edit-agency-phone');
        const cityEl = document.getElementById('edit-agency-city');
        const addressEl = document.getElementById('edit-agency-address');
        const bioEl = document.getElementById('edit-agency-bio');

        if (nameEl && agency.name) nameEl.value = agency.name;
        if (emailEl && user.email) emailEl.value = user.email;
        if (phoneEl && user.phone_number) phoneEl.value = user.phone_number;
        if (cityEl && agency.city) {
            cityEl.value = agency.city;
        }
        if (addressEl && agency.address) addressEl.value = agency.address;
        if (bioEl && agency.bio) bioEl.value = agency.bio;

        // Load profile image if available
        const profilePreview = document.getElementById('edit-agency-profile-preview');
        if (profilePreview && user.profile_image) {
            // Fix path - ensure correct relative path
            if (user.profile_image.startsWith('http')) {
                profilePreview.src = user.profile_image;
            } else if (user.profile_image.startsWith('assets/')) {
                profilePreview.src = `../${user.profile_image}`;
            } else {
                profilePreview.src = `../assets/uploads/profile_images/${user.profile_image.split('/').pop()}`;
            }
        }
    } catch (e) {
        console.error('Error loading profile:', e);
    }
});

document.getElementById('edit-profile-agency').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('edit-agency-name');
    const email = document.getElementById('edit-agency-email');
    const phone = document.getElementById('edit-agency-phone');
    const city = document.getElementById('edit-agency-city');
    const address = document.getElementById('edit-agency-address');
    const bio = document.getElementById('edit-agency-bio');
    let isValid = true;

    clearErrors();

    if (!name.value.trim()) {
        showError(name, 'edit-agency-name-error', 'Agency name is required');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        showError(name, 'edit-agency-name-error', 'Agency name must be at least 3 characters');
        isValid = false;
    }

    if (!email.value.trim()) {
        showError(email, 'edit-agency-email-error', 'Email is required');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
        showError(email, 'edit-agency-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    if (!phone.value.trim()) {
        showError(phone, 'edit-agency-phone-error', 'Phone number is required');
        isValid = false;
    } else if (!PHONE_REGEX.test(phone.value.trim())) {
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

    if (bio.value.trim().length < 10) {
        showError(bio, 'edit-agency-bio-error', 'Bio must be at least 10 characters');
        isValid = false;
    }

    if (!isValid) return;

    // Use FormData if profile image is selected
    const profileImageFile = agencyProfileUpload?.files[0];
    const useFormData = !!profileImageFile;
    
    let requestBody;
    let headers = {};
    
    if (useFormData) {
      const formData = new FormData();
      formData.append('name', name.value.trim());
      formData.append('email', email.value.trim());
      formData.append('phone_number', phone.value.trim());
      formData.append('city', city.value);
      formData.append('address', address.value.trim());
      formData.append('bio', bio.value.trim());
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }
      requestBody = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        phone_number: phone.value.trim(),
        city: city.value,
        address: address.value.trim(),
        bio: bio.value.trim(),
      });
    }
    
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'PUT',
            headers: headers,
            credentials: 'include',
            body: requestBody,
        });
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Update response is not JSON:', text.substring(0, 200));
            alert('Server returned an error. Please check the console.');
            return;
        }
        
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

