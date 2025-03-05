document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const investmentForm = document.querySelector('.investment-form');
    const investButtons = document.querySelectorAll('.invest-btn');
    const cancelButton = document.querySelector('.cancel-btn');
    const confirmButton = document.querySelector('.confirm-btn');
    const planNameInput = document.getElementById('planName');
    const amountInput = document.getElementById('amount');
    const paymentMethodSelect = document.getElementById('paymentMethod');

    // Investment plans data
    const plans = {
        'Starter Plan': {
            amount: 10000,
            dailyProfit: 100,
            duration: 365,
            totalReturn: 36500
        },
        'Premium Plan': {
            amount: 50000,
            dailyProfit: 600,
            duration: 365,
            totalReturn: 219000
        },
        'Elite Plan': {
            amount: 100000,
            dailyProfit: 1500,
            duration: 365,
            totalReturn: 547500
        }
    };

    // Handle invest button clicks
    investButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planCard = this.closest('.plan-card');
            const planName = planCard.querySelector('h2').textContent;
            const plan = plans[planName];

            // Set form values
            planNameInput.value = planName;
            amountInput.value = plan.amount;

            // Show investment form
            investmentForm.style.display = 'block';
            
            // Add overlay
            addOverlay();
        });
    });

    // Handle cancel button click
    cancelButton.addEventListener('click', function() {
        closeInvestmentForm();
    });

    // Handle form submission
    document.getElementById('investmentForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const investment = {
            plan: planNameInput.value,
            amount: Number(amountInput.value),
            paymentMethod: paymentMethodSelect.value,
            date: new Date().toISOString(),
            status: 'pending'
        };

        // Get existing investments or initialize empty array
        const investments = JSON.parse(localStorage.getItem('investments')) || [];
        
        // Add new investment
        investments.push(investment);
        
        // Save to localStorage
        localStorage.setItem('investments', JSON.stringify(investments));

        // Show success message
        alert('Investment submitted successfully! Please complete the payment using your selected method.');
        
        // Close the form
        closeInvestmentForm();
    });

    // Helper function to add overlay
    function addOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        document.body.appendChild(overlay);

        // Close form when clicking overlay
        overlay.addEventListener('click', closeInvestmentForm);
    }

    // Helper function to close investment form
    function closeInvestmentForm() {
        investmentForm.style.display = 'none';
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Reset form
        document.getElementById('investmentForm').reset();
    }

    // Handle escape key to close form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && investmentForm.style.display === 'block') {
            closeInvestmentForm();
        }
    });
}); 