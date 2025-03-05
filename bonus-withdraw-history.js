document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bonusWithdrawalItems = document.getElementById('bonusWithdrawalItems');
    const bonusTypeFilter = document.getElementById('bonusTypeFilter');
    const methodFilter = document.getElementById('methodFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const statusFilter = document.getElementById('statusFilter');
    const applyFilters = document.getElementById('applyFilters');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const modal = document.getElementById('bonusWithdrawalModal');
    const closeBtn = modal.querySelector('.close-btn');
    const downloadBtn = modal.querySelector('.download-btn');

    // Pagination state
    let currentPageNumber = 1;
    const itemsPerPage = 10;
    let filteredBonusWithdrawals = [];

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
            bonusType: bonusTypeFilter.value,
            method: methodFilter.value,
            startDate: new Date(startDate.value),
            endDate: new Date(endDate.value),
            status: statusFilter.value
        };

        // Get all bonus withdrawals
        const allBonusWithdrawals = getBonusWithdrawalHistory();

        // Apply filters
        filteredBonusWithdrawals = allBonusWithdrawals.filter(withdrawal => {
            const withdrawalDate = new Date(withdrawal.timestamp);
            return (filters.bonusType === 'all' || withdrawal.bonusType === filters.bonusType) &&
                   (filters.method === 'all' || withdrawal.method === filters.method) &&
                   (filters.status === 'all' || withdrawal.status === filters.status) &&
                   withdrawalDate >= filters.startDate &&
                   withdrawalDate <= filters.endDate;
        });

        // Reset to first page
        currentPageNumber = 1;
        updateBonusWithdrawalList();
        updatePagination();
    }

    function getBonusWithdrawalHistory() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return (userData.bonusWithdrawHistory || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function updateBonusWithdrawalList() {
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageWithdrawals = filteredBonusWithdrawals.slice(start, end);

        bonusWithdrawalItems.innerHTML = pageWithdrawals.map(withdrawal => `
            <div class="transaction-item">
                <div>${formatDate(new Date(withdrawal.timestamp))}</div>
                <div>${formatBonusType(withdrawal.bonusType)}</div>
                <div>${formatMethodName(withdrawal.method)}</div>
                <div class="expense">
                    - Rs ${withdrawal.amount.toLocaleString()}
                </div>
                <div>
                    <span class="status status-${withdrawal.status.toLowerCase()}">
                        ${withdrawal.status}
                    </span>
                </div>
                <div>
                    <button class="action-btn view-btn" onclick="showBonusWithdrawalDetails('${withdrawal.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredBonusWithdrawals.length / itemsPerPage);
        currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;
        
        prevPage.disabled = currentPageNumber === 1;
        nextPage.disabled = currentPageNumber === totalPages;
    }

    function changePage(delta) {
        const totalPages = Math.ceil(filteredBonusWithdrawals.length / itemsPerPage);
        const newPage = currentPageNumber + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPageNumber = newPage;
            updateBonusWithdrawalList();
            updatePagination();
        }
    }

    function updateStats() {
        const withdrawals = getBonusWithdrawalHistory();
        let totalAmount = 0;
        let successfulCount = 0;
        let pendingCount = 0;

        withdrawals.forEach(withdrawal => {
            if (withdrawal.status === 'completed') {
                totalAmount += withdrawal.amount;
                successfulCount++;
            } else if (withdrawal.status === 'pending') {
                pendingCount++;
            }
        });

        document.getElementById('totalBonusWithdrawals').textContent = totalAmount.toLocaleString();
        document.getElementById('successfulBonusWithdrawals').textContent = successfulCount;
        document.getElementById('pendingBonusWithdrawals').textContent = pendingCount;
    }

    function showBonusWithdrawalDetails(withdrawalId) {
        const withdrawal = filteredBonusWithdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal) return;

        const detailsHtml = generateBonusWithdrawalDetailsHtml(withdrawal);
        modal.querySelector('.bonus-withdrawal-details').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }

    function generateBonusWithdrawalDetailsHtml(withdrawal) {
        const details = [
            ['Transaction ID', withdrawal.id],
            ['Bonus Type', formatBonusType(withdrawal.bonusType)],
            ['Payment Method', formatMethodName(withdrawal.method)],
            ['Amount', `Rs ${withdrawal.amount.toLocaleString()}`],
            ['Status', withdrawal.status],
            ['Date', formatDate(new Date(withdrawal.timestamp))],
            ['Account Number', withdrawal.accountNumber],
            ['Account Name', withdrawal.accountName]
        ];

        if (withdrawal.method === 'bank') {
            details.push(
                ['Bank Name', withdrawal.bankName],
                ['Branch Code', withdrawal.branchCode]
            );
        }

        // Add bonus-specific details
        if (withdrawal.bonusType === 'referral') {
            details.push(
                ['Referred User', withdrawal.referredUser],
                ['Referral Level', withdrawal.referralLevel]
            );
        } else if (withdrawal.bonusType === 'investment') {
            details.push(
                ['Investment Plan', withdrawal.investmentPlan],
                ['Investment Period', withdrawal.investmentPeriod]
            );
        } else if (withdrawal.bonusType === 'training') {
            details.push(
                ['Training Course', withdrawal.trainingCourse],
                ['Completion Date', formatDate(new Date(withdrawal.completionDate))]
            );
        }

        if (withdrawal.description) {
            details.push(['Description', withdrawal.description]);
        }

        return details.map(([label, value]) => `
            <div class="detail-row">
                <span>${label}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function downloadReceipt() {
        // Implementation for downloading bonus withdrawal receipt
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

    function formatBonusType(type) {
        const types = {
            training: 'Training Bonus',
            referral: 'Referral Bonus',
            investment: 'Investment Bonus'
        };
        return types[type] || type;
    }

    // Expose function to global scope for onclick handler
    window.showBonusWithdrawalDetails = showBonusWithdrawalDetails;
}); 