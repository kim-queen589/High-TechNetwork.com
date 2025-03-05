document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const userName = document.getElementById('userName').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        // Get stored user data
        const userData = JSON.parse(localStorage.getItem('userData'));

        // Check if user exists and password matches
        if (userData && userData.userName === userName && userData.password === password) {
            // Store login status if remember me is checked
            if (remember) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }

            // Show success message
            alert('Login successful!');
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            alert('Invalid username or password');
        }
    });

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }

    // Add floating label effect
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        // Set initial state
        if (input.value) {
            input.classList.add('has-value');
        }

        // Handle input changes
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });
}); 