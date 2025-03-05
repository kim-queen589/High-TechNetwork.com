document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profilePicture = document.getElementById('profilePicture');
    const pictureInput = document.getElementById('pictureInput');
    const changePictureBtn = document.querySelector('.change-picture-btn');
    const forms = document.querySelectorAll('.settings-form');
    
    // Load user data
    loadUserData();

    // Event Listeners
    changePictureBtn.addEventListener('click', () => pictureInput.click());
    pictureInput.addEventListener('change', handleProfilePictureChange);
    forms.forEach(form => {
        const saveBtn = form.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => saveSettings(form));
    });

    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Load profile data
        if (userData.profile) {
            document.getElementById('firstName').value = userData.profile.firstName || '';
            document.getElementById('lastName').value = userData.profile.lastName || '';
            document.getElementById('email').value = userData.profile.email || '';
            document.getElementById('phone').value = userData.profile.phone || '';
            if (userData.profile.picture) {
                profilePicture.src = userData.profile.picture;
            }
        }

        // Load notification preferences
        if (userData.notifications) {
            document.getElementById('emailNotifications').checked = userData.notifications.email ?? true;
            document.getElementById('smsNotifications').checked = userData.notifications.sms ?? true;
            document.getElementById('marketingNotifications').checked = userData.notifications.marketing ?? false;
        }

        // Load account preferences
        if (userData.preferences) {
            document.getElementById('language').value = userData.preferences.language || 'en';
            document.getElementById('currency').value = userData.preferences.currency || 'PKR';
        }
    }

    function handleProfilePictureChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicture.src = e.target.result;
                saveProfilePicture(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function saveProfilePicture(pictureData) {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        if (!userData.profile) userData.profile = {};
        userData.profile.picture = pictureData;
        localStorage.setItem('userData', JSON.stringify(userData));
        showNotification('Profile picture updated successfully');
    }

    function saveSettings(form) {
        const formType = getFormType(form);
        const userData = JSON.parse(localStorage.getItem('userData')) || {};

        switch (formType) {
            case 'profile':
                saveProfileSettings(userData);
                break;
            case 'security':
                saveSecuritySettings(userData);
                break;
            case 'notifications':
                saveNotificationSettings(userData);
                break;
            case 'preferences':
                savePreferenceSettings(userData);
                break;
        }

        localStorage.setItem('userData', JSON.stringify(userData));
        showNotification('Settings saved successfully');
    }

    function getFormType(form) {
        const heading = form.closest('.settings-section').querySelector('h2').textContent.toLowerCase();
        if (heading.includes('profile')) return 'profile';
        if (heading.includes('security')) return 'security';
        if (heading.includes('notification')) return 'notifications';
        if (heading.includes('preferences')) return 'preferences';
        return '';
    }

    function saveProfileSettings(userData) {
        if (!userData.profile) userData.profile = {};
        userData.profile.firstName = document.getElementById('firstName').value;
        userData.profile.lastName = document.getElementById('lastName').value;
        userData.profile.email = document.getElementById('email').value;
        userData.profile.phone = document.getElementById('phone').value;
    }

    function saveSecuritySettings(userData) {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const pin = document.getElementById('pin').value;

        // Validate current password
        if (currentPassword !== userData.password) {
            showNotification('Current password is incorrect', 'error');
            return;
        }

        // Validate new password
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        // Validate PIN
        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            showNotification('PIN must be 4 digits', 'error');
            return;
        }

        userData.password = newPassword;
        userData.pin = pin;

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('pin').value = '';
    }

    function saveNotificationSettings(userData) {
        if (!userData.notifications) userData.notifications = {};
        userData.notifications.email = document.getElementById('emailNotifications').checked;
        userData.notifications.sms = document.getElementById('smsNotifications').checked;
        userData.notifications.marketing = document.getElementById('marketingNotifications').checked;
    }

    function savePreferenceSettings(userData) {
        if (!userData.preferences) userData.preferences = {};
        userData.preferences.language = document.getElementById('language').value;
        userData.preferences.currency = document.getElementById('currency').value;
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}); 