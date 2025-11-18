document.getElementById('reset-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('reset-email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            document.getElementById('reset-email-error').textContent = '';
            email.parentElement.classList.remove('error');

            if (!email.value.trim()) {
                showError(email, 'reset-email-error', 'Email is required');
            } else if (!emailRegex.test(email.value)) {
                showError(email, 'reset-email-error', 'Please enter a valid email');
            } else {
                alert('Password reset link sent to ' + email.value);
                window.location.href = '/pages/login.html';
            }
        });

        function showError(input, errorId, message) {
            input.parentElement.classList.add('error');
            document.getElementById(errorId).textContent = message;
        }