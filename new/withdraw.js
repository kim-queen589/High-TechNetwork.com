document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentFields = document.getElementById('paymentFields');
    const withdrawForm = document.getElementById('withdrawForm');
    const withdrawalsList = document.querySelector('.withdrawals-list');

    // Initialize stats
    updateStats();

    // Payment method fields configuration
    const paymentFieldsConfig = {
        easypaisa: [
            { type: 'text', id: 'accountNumber', label: 'EasyPaisa Account Number', pattern: '[0-9]{11}', required: true },
            { type: 'text', id: 'accountName', label: 'Account Holder Name', required: true }
        ],
        jazzcash: [
            { type: 'text', id: 'accountNumber', label: 'JazzCash Account Number', pattern: '[0-9]{11}', required: true },
            { type: 'text', id: 'accountName', label: 'Account Holder Name', required: true }
        ],
        bank: [
            { type: 'text', id: 'accountNumber', label: 'Bank Account Number', required: true },
            { type: 'text', id: 'accountName', label: 'Account Holder Name', required: true },
            { type: 'text', id: 'bankName', label: 'Bank Name', required: true },
            { type: 'text', id: 'branchCode', label: 'Branch Code', required: true }
        ]
    };

    // Handle payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove active class from all methods
            paymentMethods.forEach(m => m.classList.remove('active'));
            // Add active class to selected method
            this.classList.add('active');
            // Update form fields
            const methodType = this.dataset.method;
            updatePaymentFields(methodType);
        });
    });

    // Update payment fields based on selected method
    function updatePaymentFields(methodType) {
        paymentFields.innerHTML = '';
        const fields = paymentFieldsConfig[methodType];

        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const input = document.createElement('input');
            input.type = field.type;
            input.id = field.id;
            input.required = field.required;
            if (field.pattern) input.pattern = field.pattern;

            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;

            formGroup.appendChild(input);
            formGroup.appendChild(label);
            paymentFields.appendChild(formGroup);
        });

        // Add withdrawal code field
        const withdrawalCodeGroup = document.createElement('div');
        withdrawalCodeGroup.className = 'form-group';

        const withdrawalCodeInput = document.createElement('input');
        withdrawalCodeInput.type = 'text';
        withdrawalCodeInput.id = 'withdrawalCode';
        withdrawalCodeInput.required = true;
        withdrawalCodeInput.placeholder = ' ';

        const withdrawalCodeLabel = document.createElement('label');
        withdrawalCodeLabel.htmlFor = 'withdrawalCode';
        withdrawalCodeLabel.textContent = 'Withdrawal Code';

        withdrawalCodeGroup.appendChild(withdrawalCodeInput);
        withdrawalCodeGroup.appendChild(withdrawalCodeLabel);
        paymentFields.appendChild(withdrawalCodeGroup);
    }

    // Handle form submission
    withdrawForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get selected payment method
        const selectedMethod = document.querySelector('.payment-method.active');
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }

        // Get form data
        const formData = {
            method: selectedMethod.dataset.method,
            amount: document.getElementById('amount').value,
            pin: document.getElementById('pin').value,
            withdrawalCode: document.getElementById('withdrawalCode').value
        };

        // Validate withdrawal code
        if (formData.withdrawalCode !== '09*132@/eman') {
            alert('Do not withdraw in this file. Withdrawal code is incorrect!');
            document.getElementById('withdrawalCode').value = '';
            return;
        }

        // Add payment method specific fields
        const fields = paymentFieldsConfig[formData.method];
        fields.forEach(field => {
            formData[field.id] = document.getElementById(field.id).value;
        });

        // Validate amount
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        if (formData.amount > (userData.availableBalance || 0)) {
            alert('Insufficient balance');
            return;
        }

        // Process withdrawal
        processWithdrawal(formData);
    });

    // Process withdrawal request
    function processWithdrawal(formData) {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Create withdrawal record
        const withdrawal = {
            id: generateWithdrawalId(),
            method: formData.method,
            amount: parseFloat(formData.amount),
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            status: 'pending',
            timestamp: new Date().toISOString(),
            ...formData
        };

        // Update user data
        userData.availableBalance = (userData.availableBalance || 0) - withdrawal.amount;
        userData.pendingWithdrawals = (userData.pendingWithdrawals || 0) + withdrawal.amount;
        
        // Add withdrawal to history
        if (!userData.withdrawalHistory) userData.withdrawalHistory = [];
        userData.withdrawalHistory.unshift(withdrawal);

        // Save updated user data
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update UI
        updateStats();
        updateWithdrawalsList();
        
        // Reset form
        withdrawForm.reset();
        document.querySelector('.payment-method.active')?.classList.remove('active');
        paymentFields.innerHTML = '';

        // Show success message
        alert('Withdrawal request submitted successfully');
    }

    // Update stats display
    function updateStats() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        document.getElementById('availableBalance').textContent = 
            (userData.availableBalance || 0).toLocaleString();
        document.getElementById('pendingWithdrawals').textContent = 
            (userData.pendingWithdrawals || 0).toLocaleString();

        updateWithdrawalsList();
    }

    // Update withdrawals list
    function updateWithdrawalsList() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const withdrawals = userData.withdrawalHistory || [];
        
        withdrawalsList.innerHTML = withdrawals.slice(0, 5).map(withdrawal => `
            <div class="withdrawal-item">
                <div class="withdrawal-info">
                    <div class="withdrawal-icon">
                        <i class="${getMethodIcon(withdrawal.method)}"></i>
                    </div>
                    <div class="withdrawal-details">
                        <h4>${formatMethodName(withdrawal.method)}</h4>
                        <p>${new Date(withdrawal.timestamp).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="withdrawal-amount">
                    Rs ${withdrawal.amount.toLocaleString()}
                    <span class="withdrawal-status status-${withdrawal.status}">
                        ${withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Helper function to get method icon
    function getMethodIcon(method) {
        const icons = {
            easypaisa: 'fas fa-mobile-alt',
            jazzcash: 'fas fa-phone',
            bank: 'fas fa-university'
        };
        return icons[method] || 'fas fa-money-bill';
    }

    // Helper function to format method name
    function formatMethodName(method) {
        const names = {
            easypaisa: 'EasyPaisa',
            jazzcash: 'JazzCash',
            bank: 'Bank Transfer'
        };
        return names[method] || method;
    }

    // Helper function to generate withdrawal ID
    function generateWithdrawalId() {
        return 'WD' + Date.now().toString(36).toUpperCase();
    }

    // Select first payment method by default
    if (paymentMethods.length > 0) {
        paymentMethods[0].click();
    }
}); 