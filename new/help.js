document.addEventListener('DOMContentLoaded', function() {
    // FAQ Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other open FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current FAQ
            item.classList.toggle('active');
        });
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Get user data for the support ticket
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const supportTicket = {
            id: generateTicketId(),
            subject: subject,
            message: message,
            userId: userData.id || 'guest',
            userName: userData.profile?.firstName ? 
                `${userData.profile.firstName} ${userData.profile.lastName}` : 'Guest',
            email: userData.profile?.email || '',
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Save support ticket
        saveSupportTicket(supportTicket);

        // Show success message
        showNotification('Your message has been sent successfully. We will get back to you soon.');

        // Reset form
        contactForm.reset();
    });

    // Live Chat Functionality
    window.openLiveChat = function() {
        // Implement live chat functionality or redirect to live chat service
        showNotification('Live chat feature coming soon!');
    };

    function generateTicketId() {
        return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    function saveSupportTicket(ticket) {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        if (!userData.supportTickets) {
            userData.supportTickets = [];
        }
        userData.supportTickets.push(ticket);
        localStorage.setItem('userData', JSON.stringify(userData));

        // In a real application, you would also send this to a server
        console.log('Support ticket created:', ticket);
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

    // Help Article Search (if implemented)
    const searchHelp = (query) => {
        // Implement help article search functionality
        console.log('Searching for:', query);
    };

    // Knowledge Base Navigation (if implemented)
    const navigateKnowledgeBase = (category) => {
        // Implement knowledge base navigation
        console.log('Navigating to category:', category);
    };

    // Support Ticket Tracking (if implemented)
    const trackTicket = (ticketId) => {
        // Implement ticket tracking functionality
        console.log('Tracking ticket:', ticketId);
    };
}); 