const API_BASE = '../php/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clientProfileUpload = document.getElementById('edit-client-profile-upload');
if (clientProfileUpload) {
  clientProfileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('edit-client-profile-preview').src = event.target.result;
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

        const client = data.data.client || {};
        const user = data.data.user || {};

        console.log('Loaded user:', user);
        console.log('Loaded client:', client);

        const fnameEl = document.getElementById('edit-client-fname');
        const lnameEl = document.getElementById('edit-client-lname');
        const emailEl = document.getElementById('edit-client-email');

        if (fnameEl && client.first_name) fnameEl.value = client.first_name;
        if (lnameEl && client.last_name) lnameEl.value = client.last_name;
        if (emailEl && user.email) emailEl.value = user.email;

        // Load profile image if available
        const profilePreview = document.getElementById('edit-client-profile-preview');
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

const editClientForm = document.getElementById('edit-profile-client');
if (editClientForm) {
editClientForm.addEventListener('submit', async function (e) {
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

    if (!email.value.trim()) {
        showError(email, 'edit-client-email-error', 'Email is required');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
        showError(email, 'edit-client-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    if (!isValid) return;

    // Use FormData if profile image is selected
    const profileImageFile = clientProfileUpload?.files[0];
    const useFormData = !!profileImageFile;
    
    let requestBody;
    let headers = {};
    
    if (useFormData) {
      const formData = new FormData();
      formData.append('first_name', fname.value.trim());
      formData.append('last_name', lname.value.trim());
      formData.append('email', email.value.trim());
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }
      requestBody = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify({
        first_name: fname.value.trim(),
        last_name: lname.value.trim(),
        email: email.value.trim(),
      });
    }
    
    try {
        // Use POST when sending FormData - PHP does not populate $_POST/$_FILES for PUT requests
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: useFormData ? 'POST' : 'PUT',
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
        window.location.href = 'clientinterface.html';
    } catch (err) {
        alert('Network error. Please try again.');
    }
});
}

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
