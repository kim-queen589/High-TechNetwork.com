document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get all form values
        const formData = {
            sponsorId: document.getElementById('sponsorId').value,
            registrationCode: document.getElementById('registrationCode').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            pin: document.getElementById('pin').value,
            userName: document.getElementById('userName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            repeatPassword: document.getElementById('repeatPassword').value,
            phone: document.getElementById('phone').value,
            terms: document.getElementById('terms').checked
        };

        // Validate registration code
        if (formData.registrationCode !== '09@163#eman') {
            alert('Do not register in this file. Registration code is incorrect!');
            document.getElementById('registrationCode').value = '';
            return;
        }

        // Basic validation
        if (formData.password !== formData.repeatPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!formData.terms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        if (formData.pin.length !== 4 || isNaN(formData.pin)) {
            alert('PIN must be 4 digits');
            return;
        }

        // Store user data in localStorage (in a real application, this would be sent to a server)
        localStorage.setItem('userData', JSON.stringify(formData));
        
        // Show success message
        alert('Registration successful!');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    });

    // Add floating label effect
    const inputs = document.querySelectorAll('.form-group input:not([type="checkbox"])');
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

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
}); 