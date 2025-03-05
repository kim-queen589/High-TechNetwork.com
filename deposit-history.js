document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const depositItems = document.getElementById('depositItems');
    const methodFilter = document.getElementById('methodFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const statusFilter = document.getElementById('statusFilter');
    const applyFilters = document.getElementById('applyFilters');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const modal = document.getElementById('depositModal');
    const closeBtn = modal.querySelector('.close-btn');
    const downloadBtn = modal.querySelector('.download-btn');

    // Pagination state
    let currentPageNumber = 1;
    const itemsPerPage = 10;
    let filteredDeposits = [];

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
            method: methodFilter.value,
            startDate: new Date(startDate.value),
            endDate: new Date(endDate.value),
            status: statusFilter.value
        };

        // Get all deposits
        const allDeposits = getDepositHistory();

        // Apply filters
        filteredDeposits = allDeposits.filter(deposit => {
            const depositDate = new Date(deposit.timestamp);
            return (filters.method === 'all' || deposit.method === filters.method) &&
                   (filters.status === 'all' || deposit.status === filters.status) &&
                   depositDate >= filters.startDate &&
                   depositDate <= filters.endDate;
        });

        // Reset to first page
        currentPageNumber = 1;
        updateDepositList();
        updatePagination();
    }

    function getDepositHistory() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return (userData.depositHistory || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function updateDepositList() {
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageDeposits = filteredDeposits.slice(start, end);

        depositItems.innerHTML = pageDeposits.map(deposit => `
            <div class="transaction-item">
                <div>${formatDate(new Date(deposit.timestamp))}</div>
                <div>${formatMethodName(deposit.method)}</div>
                <div>${deposit.id}</div>
                <div class="income">
                    + Rs ${deposit.amount.toLocaleString()}
                </div>
                <div>
                    <span class="status status-${deposit.status.toLowerCase()}">
                        ${deposit.status}
                    </span>
                </div>
                <div>
                    <button class="action-btn view-btn" onclick="showDepositDetails('${deposit.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
        currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;
        
        prevPage.disabled = currentPageNumber === 1;
        nextPage.disabled = currentPageNumber === totalPages;
    }

    function changePage(delta) {
        const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
        const newPage = currentPageNumber + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPageNumber = newPage;
            updateDepositList();
            updatePagination();
        }
    }

    function updateStats() {
        const deposits = getDepositHistory();
        let totalAmount = 0;
        let successfulCount = 0;
        let pendingCount = 0;

        deposits.forEach(deposit => {
            if (deposit.status === 'completed') {
                totalAmount += deposit.amount;
                successfulCount++;
            } else if (deposit.status === 'pending') {
                pendingCount++;
            }
        });

        document.getElementById('totalDeposits').textContent = totalAmount.toLocaleString();
        document.getElementById('successfulDeposits').textContent = successfulCount;
        document.getElementById('pendingDeposits').textContent = pendingCount;
    }

    function showDepositDetails(depositId) {
        const deposit = filteredDeposits.find(d => d.id === depositId);
        if (!deposit) return;

        const detailsHtml = generateDepositDetailsHtml(deposit);
        modal.querySelector('.deposit-details').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }

    function generateDepositDetailsHtml(deposit) {
        const details = [
            ['Transaction ID', deposit.id],
            ['Payment Method', formatMethodName(deposit.method)],
            ['Amount', `Rs ${deposit.amount.toLocaleString()}`],
            ['Status', deposit.status],
            ['Date', formatDate(new Date(deposit.timestamp))],
            ['Account Number', deposit.accountNumber],
            ['Account Name', deposit.accountName]
        ];

        if (deposit.method === 'bank') {
            details.push(
                ['Bank Name', deposit.bankName],
                ['Branch Code', deposit.branchCode]
            );
        }

        if (deposit.description) {
            details.push(['Description', deposit.description]);
        }

        return details.map(([label, value]) => `
            <div class="detail-row">
                <span>${label}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function downloadReceipt() {
        // Implementation for downloading deposit receipt
        alert('Receipt download functionality will be implemented');
    }

    // Helper Functions
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatMethodName(method) {
        const names = {
            easypaisa: 'EasyPaisa',
            jazzcash: 'JazzCash',
            bank: 'Bank Transfer'
        };
        return names[method] || method;
    }

    // Expose function to global scope for onclick handler
    window.showDepositDetails = showDepositDetails;
}); 