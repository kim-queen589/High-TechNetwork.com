document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentFields = document.getElementById('paymentFields');
    const transferForm = document.getElementById('transferForm');
    const transfersList = document.querySelector('.transfers-list');
    const recipientModal = document.getElementById('recipientModal');
    const cancelBtn = recipientModal.querySelector('.cancel-btn');
    const confirmBtn = recipientModal.querySelector('.confirm-btn');

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

    // Transfer fee configuration
    const transferFees = {
        easypaisa: 0.02, // 2%
        jazzcash: 0.02, // 2%
        bank: 0.01 // 1%
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
            input.placeholder = ' ';

            const label = document.createElement('label');
            label.htmlFor = field.id;
            label.textContent = field.label;

            formGroup.appendChild(input);
            formGroup.appendChild(label);
            paymentFields.appendChild(formGroup);
        });
    }

    // Handle form submission
    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get selected payment method
        const selectedMethod = document.querySelector('.payment-method.active');
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }

        // Get form data
        const formData = {
            recipientUsername: document.getElementById('recipientUsername').value,
            method: selectedMethod.dataset.method,
            amount: parseFloat(document.getElementById('amount').value),
            description: document.getElementById('description').value,
            pin: document.getElementById('pin').value
        };

        // Add payment method specific fields
        const fields = paymentFieldsConfig[formData.method];
        fields.forEach(field => {
            formData[field.id] = document.getElementById(field.id).value;
        });

        // Validate recipient
        const recipient = findUser(formData.recipientUsername);
        if (!recipient) {
            alert('Recipient not found');
            return;
        }

        // Show confirmation modal
        showConfirmationModal(formData, recipient);
    });

    // Handle modal actions
    cancelBtn.addEventListener('click', () => {
        recipientModal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', function() {
        const formData = this.transferData;
        processTransfer(formData);
        recipientModal.style.display = 'none';
    });

    // Show confirmation modal
    function showConfirmationModal(formData, recipient) {
        const fee = calculateTransferFee(formData.amount, formData.method);
        const total = formData.amount + fee;

        // Update modal content
        document.getElementById('recipientName').textContent = recipient.firstName + ' ' + recipient.lastName;
        document.getElementById('recipientId').textContent = recipient.userName;
        document.getElementById('confirmAmount').textContent = formData.amount.toLocaleString();
        document.getElementById('confirmMethod').textContent = formatMethodName(formData.method);
        document.getElementById('transferFee').textContent = fee.toLocaleString();
        document.getElementById('totalAmount').textContent = total.toLocaleString();

        // Store transfer data for confirmation
        confirmBtn.transferData = { ...formData, fee, total, recipient };

        // Show modal
        recipientModal.style.display = 'flex';
    }

    // Process transfer
    function processTransfer(formData) {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Validate balance
        if (formData.total > (userData.availableBalance || 0)) {
            alert('Insufficient balance');
            return;
        }

        // Create transfer record
        const transfer = {
            id: generateTransferId(),
            sender: userData.userName,
            recipient: formData.recipient.userName,
            method: formData.method,
            amount: formData.amount,
            fee: formData.fee,
            total: formData.total,
            description: formData.description,
            status: 'completed',
            timestamp: new Date().toISOString(),
            ...formData
        };

        // Update sender's data
        userData.availableBalance = (userData.availableBalance || 0) - transfer.total;
        if (!userData.transferHistory) userData.transferHistory = [];
        userData.transferHistory.unshift(transfer);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update recipient's data
        const recipientData = JSON.parse(localStorage.getItem(formData.recipient.userName)) || {};
        recipientData.availableBalance = (recipientData.availableBalance || 0) + transfer.amount;
        if (!recipientData.transferHistory) recipientData.transferHistory = [];
        recipientData.transferHistory.unshift({
            ...transfer,
            type: 'received'
        });
        localStorage.setItem(formData.recipient.userName, JSON.stringify(recipientData));

        // Update UI
        updateStats();
        updateTransfersList();
        
        // Reset form
        transferForm.reset();
        document.querySelector('.payment-method.active')?.classList.remove('active');
        paymentFields.innerHTML = '';

        // Show success message
        alert('Transfer completed successfully');
    }

    // Update stats display
    function updateStats() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        document.getElementById('availableBalance').textContent = 
            (userData.availableBalance || 0).toLocaleString();
        document.getElementById('totalTransfers').textContent = 
            (userData.transferHistory || []).length;

        updateTransfersList();
    }

    // Update transfers list
    function updateTransfersList() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const transfers = userData.transferHistory || [];
        
        transfersList.innerHTML = transfers.slice(0, 5).map(transfer => `
            <div class="transfer-item">
                <div class="transfer-info">
                    <div class="transfer-icon">
                        <i class="${getMethodIcon(transfer.method)}"></i>
                    </div>
                    <div class="transfer-details">
                        <h4>To: ${transfer.recipient}</h4>
                        <p>${transfer.description || 'No description'}</p>
                    </div>
                </div>
                <div class="transfer-amount">
                    <div class="amount">Rs ${transfer.amount.toLocaleString()}</div>
                    <div class="date">${new Date(transfer.timestamp).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }

    // Helper function to find user
    function findUser(username) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        return users[username];
    }

    // Helper function to calculate transfer fee
    function calculateTransferFee(amount, method) {
        return Math.ceil(amount * (transferFees[method] || 0));
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

    // Helper function to generate transfer ID
    function generateTransferId() {
        return 'TR' + Date.now().toString(36).toUpperCase();
    }

    // Select first payment method by default
    if (paymentMethods.length > 0) {
        paymentMethods[0].click();
    }
}); 