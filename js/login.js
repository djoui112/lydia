//login
           document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            let isValid = true;

            // Reset errors
            document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
            document.querySelectorAll('input').forEach(inp => inp.parentElement.classList.remove('error'));

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError(email, 'email-error', 'Email is required');
                isValid = false;
            } else if (!emailRegex.test(email.value)) {
                showError(email, 'email-error', 'Please enter a valid email');
                isValid = false;
            }

            // Password validation
            if (!password.value.trim()) {
                showError(password, 'password-error', 'Password is required');
                isValid = false;
            } else if (password.value.length < 8) {
                showError(password, 'password-error', 'Password must be at least 8 characters');
                isValid = false;
            }

            if (isValid) {
                sessionStorage.setItem('loginData', JSON.stringify({
                    email: email.value,
                    userType: 'general'
                }));
                window.location.href = '/pages/user-interface.html';
            }
        });

        function showError(input, errorId, message) {
            input.parentElement.classList.add('error');
            document.getElementById(errorId).textContent = message;
        }
        