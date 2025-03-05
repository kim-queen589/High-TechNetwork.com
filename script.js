document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    function checkAuth() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Initialize dashboard
    function initDashboard() {
        if (!checkAuth()) return;

        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Update user profile
        updateUserProfile(userData);
        
        // Update dashboard stats
        updateDashboardStats(userData);
        
        // Setup event listeners
        setupEventListeners();
    }

    // Update user profile information
    function updateUserProfile(userData) {
        // Update username everywhere
        const userNameElements = document.querySelectorAll('.user-name, #userName');
        userNameElements.forEach(el => {
            el.textContent = userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.userName;
        });

        // Update profile pictures with fallback
        const profileImages = document.querySelectorAll('.profile-img, .large-profile-img');
        profileImages.forEach(img => {
            // Default profile icon (inline SVG as base64)
            const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwMC00LTRIOGE0IDQgMCAwMC00IDR2MiIgc3Ryb2tlPSIjNjY3ZWVhIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM2NjdlZWEiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=';
            
            // Try to load user's profile picture, fallback to default if fails
            img.src = userData.profilePicture || 'assets/default-profile.png';
            img.onerror = () => img.src = defaultIcon;
        });
    }

    // Update dashboard statistics
    function updateDashboardStats(userData) {
        const stats = {
            availableBalance: userData.availableBalance || 0,
            withdrawableBalance: userData.withdrawableBalance || 0,
            trainingBonus: userData.trainingBonus || 0,
            totalInvested: userData.totalInvested || 0,
            points: userData.points || 0,
            directReferrals: userData.directReferrals || 0,
            indirectReferrals: userData.indirectReferrals || 0
        };

        // Update all stats in the dashboard
        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key].toLocaleString();
            }
        });
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
            });
        }

        // Menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                handleMenuNavigation(item);
            });
        });

        // Edit profile button
        const editProfileBtn = document.querySelector('.edit-profile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                window.location.href = 'edit-profile.html';
            });
        }

        // Back arrow
        const backArrow = document.querySelector('.back-arrow');
        if (backArrow) {
            backArrow.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    // Handle menu item navigation
    function handleMenuNavigation(menuItem) {
        const menuText = menuItem.querySelector('span')?.textContent;
        switch(menuText?.toLowerCase()) {
            case 'dashboard':
                window.location.href = 'index.html';
                break;
            case 'home':
                window.location.href = 'home.html';
                break;
            case 'invest now':
                window.location.href = 'invest.html';
                break;
            case 'training bonus':
                window.location.href = 'training-bonus.html';
                break;
            case 'withdraw':
                window.location.href = 'withdraw.html';
                break;
            case 'money transfer':
                window.location.href = 'money-transfer.html';
                break;
            case 'all transactions':
                window.location.href = 'transactions.html';
                break;
            case 'deposit history':
                window.location.href = 'deposit-history.html';
                break;
            case 'withdraw history':
                window.location.href = 'withdraw-history.html';
                break;
            case 'bonus withdraw history':
                window.location.href = 'bonus-withdraw-history.html';
                break;
            case 'training bonus history':
                window.location.href = 'training-bonus-history.html';
                break;
            case 'investment history':
                window.location.href = 'investment-history.html';
                break;
            case 'settings':
                window.location.href = 'settings.html';
                break;
            case 'help':
                window.location.href = 'help.html';
                break;
            default:
                console.log(`Navigation: ${menuText}`);
        }
    }

    // Initialize the dashboard
    initDashboard();

    // Add home button click handler
    document.querySelector('.home-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'home.html';
    });
}); 