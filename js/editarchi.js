const API_BASE = '../php/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[5-7][0-9]{8}$/;

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function showError(input, errorId, message) {
  const wrapper = input.closest('div, .select-wrapper, .date-wrapper') || input.parentElement;
  if (wrapper) wrapper.classList.add('error');
  const el = document.getElementById(errorId);
  if (el) el.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(e => (e.textContent = ''));
  document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}

// Profile image upload handler
const profileUploadInput = document.getElementById('edit-architect-profile-upload');
if (profileUploadInput) {
  profileUploadInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const preview = document.getElementById('edit-architect-profile-preview');
        if (preview) {
          preview.src = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

window.addEventListener('load', async () => {
  const fname = document.getElementById('edit-architect-fname');
  const lname = document.getElementById('edit-architect-lname');
  const email = document.getElementById('edit-architect-email');
  const phone = document.getElementById('edit-architect-phone');
  const city = document.getElementById('edit-architect-city');
  const birth = document.getElementById('edit-architect-birth');
  const birthDisplay = document.getElementById('edit-architect-birth-display');
  const address = document.getElementById('edit-architect-address');
  const bio = document.getElementById('edit-architect-bio');
  const experience = document.getElementById('edit-architect-experience');
  const portfolio = document.getElementById('edit-architect-portfolio');
  const linkedin = document.getElementById('edit-architect-linkedin');
  const expertise = document.getElementById('edit-architect-expertise');

  if (birth && birthDisplay) {
    birth.addEventListener('change', () => {
      if (!birth.value) {
        birthDisplay.value = '';
        return;
      }
      const d = new Date(birth.value);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      birthDisplay.value = `${day}/${month}/${year}`;
    });
  }

  try {
    const res = await fetch(`${API_BASE}/users/profile.php`, {
      method: 'GET',
      credentials: 'include',
    });
    
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

    const user = data.data.user || {};
    const architect = data.data.architect || {};

    console.log('Loaded user:', user);
    console.log('Loaded architect:', architect);

    if (fname && architect.first_name) fname.value = architect.first_name;
    if (lname && architect.last_name) lname.value = architect.last_name;
    if (email && user.email) email.value = user.email;
    if (phone && user.phone_number) phone.value = user.phone_number;
    if (city && architect.city) {
      city.value = architect.city;
    }
    if (birth && architect.date_of_birth) {
      birth.value = architect.date_of_birth;
      birth.dispatchEvent(new Event('change'));
    }
    if (address && architect.address) address.value = architect.address;
    if (bio && architect.bio) bio.value = architect.bio;
    if (experience !== null && experience !== undefined && architect.years_of_experience !== null && architect.years_of_experience !== undefined) {
      experience.value = architect.years_of_experience;
    }
    if (portfolio && architect.portfolio_url) portfolio.value = architect.portfolio_url;
    if (linkedin && architect.linkedin_url) linkedin.value = architect.linkedin_url;
    if (expertise && architect.primary_expertise) expertise.value = architect.primary_expertise;

    if (architect.gender) {
      const genderInput = document.querySelector(
        `input[name="edit-architect-gender"][value="${architect.gender}"]`
      );
      if (genderInput) genderInput.checked = true;
    }

    // Load profile image if available
    const profilePreview = document.getElementById('edit-architect-profile-preview');
    if (profilePreview && user.profile_image) {
      profilePreview.src = user.profile_image.startsWith('http') 
        ? user.profile_image 
        : `../${user.profile_image}`;
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
});

const profileForm = document.getElementById('edit-profile-architect');
if (profileForm) {
  profileForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const fname = document.getElementById('edit-architect-fname');
    const lname = document.getElementById('edit-architect-lname');
    const email = document.getElementById('edit-architect-email');
    const phone = document.getElementById('edit-architect-phone');
    const city = document.getElementById('edit-architect-city');
    const birth = document.getElementById('edit-architect-birth');
    const address = document.getElementById('edit-architect-address');
    const bio = document.getElementById('edit-architect-bio');
    const experience = document.getElementById('edit-architect-experience');
    const portfolio = document.getElementById('edit-architect-portfolio');
    const linkedin = document.getElementById('edit-architect-linkedin');
    const expertise = document.getElementById('edit-architect-expertise');

    let isValid = true;

    if (!fname.value.trim()) {
      showError(fname, 'edit-architect-fname-error', 'First name is required');
      isValid = false;
    } else if (fname.value.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
      showError(
        fname,
        'edit-architect-fname-error',
        'First name must be at least 2 letters and contain only letters'
      );
      isValid = false;
    }

    if (!lname.value.trim()) {
      showError(lname, 'edit-architect-lname-error', 'Last name is required');
      isValid = false;
    } else if (lname.value.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
      showError(
        lname,
        'edit-architect-lname-error',
        'Last name must be at least 2 letters and contain only letters'
      );
      isValid = false;
    }

    if (!email.value.trim()) {
      showError(email, 'edit-architect-email-error', 'Email is required');
      isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
      showError(email, 'edit-architect-email-error', 'Please enter a valid email address');
      isValid = false;
    }

    if (!phone.value.trim()) {
      showError(phone, 'edit-architect-phone-error', 'Phone number is required');
      isValid = false;
    } else if (!PHONE_REGEX.test(phone.value.trim())) {
      showError(
        phone,
        'edit-architect-phone-error',
        'Phone must be 10 digits starting with 05, 06 or 07'
      );
      isValid = false;
    }

    if (!city.value) {
      showError(city, 'edit-architect-city-error', 'Please select a city');
      isValid = false;
    }

    if (!birth.value) {
      showError(birth, 'edit-architect-birth-error', 'Date of birth is required');
      isValid = false;
    }

    if (address.value.trim().length < 10) {
      showError(
        address,
        'edit-architect-address-error',
        'Address must be at least 10 characters'
      );
      isValid = false;
    }

    if (bio.value.trim().length < 30) {
      showError(bio, 'edit-architect-bio-error', 'Bio must be at least 30 characters');
      isValid = false;
    }

    if (experience.value) {
      const years = Number(experience.value);
      if (Number.isNaN(years) || years < 0) {
        showError(
          experience,
          'edit-architect-experience-error',
          'Years of experience must be a positive number'
        );
        isValid = false;
      }
    }

    if (portfolio.value && !isValidURL(portfolio.value)) {
      showError(
        portfolio,
        'edit-architect-portfolio-error',
        'Please enter a valid portfolio URL'
      );
      isValid = false;
    }

    if (linkedin.value && !isValidURL(linkedin.value)) {
      showError(
        linkedin,
        'edit-architect-linkedin-error',
        'Please enter a valid LinkedIn URL'
      );
      isValid = false;
    }

    if (!expertise.value.trim()) {
      showError(
        expertise,
        'edit-architect-expertise-error',
        'Primary expertise is required'
      );
      isValid = false;
    }

    if (!isValid) return;

    const gender = document.querySelector(
      'input[name="edit-architect-gender"]:checked'
    )?.value;

    try {
      const res = await fetch(`${API_BASE}/users/profile.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.value.trim(),
          phone_number: phone.value.trim(),
          first_name: fname.value.trim(),
          last_name: lname.value.trim(),
          city: city.value,
          date_of_birth: birth.value,
          gender: gender || null,
          address: address.value.trim(),
          bio: bio.value.trim(),
          years_of_experience: experience.value ? Number(experience.value) : null,
          portfolio_url: portfolio.value.trim(),
          linkedin_url: linkedin.value.trim(),
          primary_expertise: expertise.value.trim(),
        }),
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
        alert(data.message || 'Update failed');
        return;
      }
      alert('Profile updated successfully');
      window.location.href = 'architect-interface.html';
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
}

const logoutArchitectBtn = document.getElementById('logout-architect');
if (logoutArchitectBtn) {
  logoutArchitectBtn.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/auth/logout.php`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    } finally {
      window.location.href = 'login/login.html';
    }
  });
}
