document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const transactionItems = document.getElementById('transactionItems');
    const typeFilter = document.getElementById('typeFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const statusFilter = document.getElementById('statusFilter');
    const applyFilters = document.getElementById('applyFilters');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const modal = document.getElementById('transactionModal');
    const closeBtn = modal.querySelector('.close-btn');
    const downloadBtn = modal.querySelector('.download-btn');

    // Pagination state
    let currentPageNumber = 1;
    const itemsPerPage = 10;
    let filteredTransactions = [];

    // Initialize
    initializePage();

    // Event Listeners
    applyFilters.addEventListener('click', handleFilterChange);
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    downloadBtn.addEventListener('click', downloadReceipt);

    function initializePage() {
        // Set default date range (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
        startDate.value = formatDate(thirtyDaysAgo);
        endDate.value = formatDate(new Date());

        // Load initial data
        handleFilterChange();
        updateStats();
    }

    function handleFilterChange() {
        const filters = {
            type: typeFilter.value,
            startDate: new Date(startDate.value),
            endDate: new Date(endDate.value),
            status: statusFilter.value
        };

        // Get all transactions
        const allTransactions = getAllTransactions();

        // Apply filters
        filteredTransactions = allTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.timestamp);
            return (filters.type === 'all' || transaction.type === filters.type) &&
                   (filters.status === 'all' || transaction.status === filters.status) &&
                   transactionDate >= filters.startDate &&
                   transactionDate <= filters.endDate;
        });

        // Reset to first page
        currentPageNumber = 1;
        updateTransactionList();
        updatePagination();
    }

    function getAllTransactions() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const transactions = [];

        // Combine all types of transactions
        if (userData.depositHistory) {
            transactions.push(...userData.depositHistory.map(t => ({...t, type: 'deposit'})));
        }
        if (userData.withdrawHistory) {
            transactions.push(...userData.withdrawHistory.map(t => ({...t, type: 'withdrawal'})));
        }
        if (userData.transferHistory) {
            transactions.push(...userData.transferHistory.map(t => ({...t, type: 'transfer'})));
        }
        if (userData.investmentHistory) {
            transactions.push(...userData.investmentHistory.map(t => ({...t, type: 'investment'})));
        }
        if (userData.bonusHistory) {
            transactions.push(...userData.bonusHistory.map(t => ({...t, type: 'bonus'})));
        }

        // Sort by date (newest first)
        return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function updateTransactionList() {
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageTransactions = filteredTransactions.slice(start, end);

        transactionItems.innerHTML = pageTransactions.map(transaction => `
            <div class="transaction-item">
                <div>${formatDate(new Date(transaction.timestamp))}</div>
                <div>${formatTransactionType(transaction.type)}</div>
                <div>${transaction.description || '-'}</div>
                <div class="${transaction.type === 'deposit' || transaction.type === 'bonus' ? 'income' : 'expense'}">
                    ${transaction.type === 'deposit' || transaction.type === 'bonus' ? '+' : '-'} Rs ${transaction.amount.toLocaleString()}
                </div>
                <div>
                    <span class="status status-${transaction.status.toLowerCase()}">
                        ${transaction.status}
                    </span>
                </div>
                <div>
                    <button class="action-btn view-btn" onclick="showTransactionDetails('${transaction.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;
        
        prevPage.disabled = currentPageNumber === 1;
        nextPage.disabled = currentPageNumber === totalPages;
    }

    function changePage(delta) {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const newPage = currentPageNumber + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPageNumber = newPage;
            updateTransactionList();
            updatePagination();
        }
    }

    function updateStats() {
        const transactions = getAllTransactions();
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'deposit' || transaction.type === 'bonus') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

        document.getElementById('totalIncome').textContent = totalIncome.toLocaleString();
        document.getElementById('totalExpense').textContent = totalExpense.toLocaleString();
        document.getElementById('totalTransactions').textContent = transactions.length;
    }

    function showTransactionDetails(transactionId) {
        const transaction = filteredTransactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const detailsHtml = generateTransactionDetailsHtml(transaction);
        modal.querySelector('.transaction-details').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }

    function generateTransactionDetailsHtml(transaction) {
        const details = [
            ['Transaction ID', transaction.id],
            ['Type', formatTransactionType(transaction.type)],
            ['Amount', `Rs ${transaction.amount.toLocaleString()}`],
            ['Status', transaction.status],
            ['Date', formatDate(new Date(transaction.timestamp))],
            ['Description', transaction.description || '-']
        ];

        // Add type-specific details
        if (transaction.type === 'transfer') {
            details.push(
                ['Recipient', transaction.recipient],
                ['Transfer Fee', `Rs ${transaction.fee.toLocaleString()}`],
                ['Total Amount', `Rs ${transaction.total.toLocaleString()}`]
            );
        } else if (transaction.type === 'withdrawal') {
            details.push(
                ['Payment Method', transaction.method],
                ['Account Number', transaction.accountNumber],
                ['Account Name', transaction.accountName]
            );
        }

        return details.map(([label, value]) => `
            <div class="detail-row">
                <span>${label}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function downloadReceipt() {
        // Implementation for downloading transaction receipt
        alert('Receipt download functionality will be implemented');
    }

    // Helper Functions
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatTransactionType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Expose function to global scope for onclick handler
    window.showTransactionDetails = showTransactionDetails;
}); 