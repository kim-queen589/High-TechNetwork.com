document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const investmentItems = document.getElementById('investmentItems');
    const planFilter = document.getElementById('planFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const statusFilter = document.getElementById('statusFilter');
    const applyFilters = document.getElementById('applyFilters');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const modal = document.getElementById('investmentModal');
    const closeBtn = modal.querySelector('.close-btn');
    const downloadBtn = modal.querySelector('.download-btn');

    // Pagination state
    let currentPageNumber = 1;
    const itemsPerPage = 10;
    let filteredInvestments = [];

    // Investment Plans Configuration
    const investmentPlans = {
        starter: {
            name: 'Starter Plan',
            amount: 10000,
            dailyProfit: 100,
            duration: 365,
            totalReturn: 36500
        },
        premium: {
            name: 'Premium Plan',
            amount: 50000,
            dailyProfit: 600,
            duration: 365,
            totalReturn: 219000
        },
        elite: {
            name: 'Elite Plan',
            amount: 100000,
            dailyProfit: 1500,
            duration: 365,
            totalReturn: 547500
        }
    };

    // Initialize
    initializePage();

    // Event Listeners
    applyFilters.addEventListener('click', handleFilterChange);
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    downloadBtn.addEventListener('click', downloadStatement);

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
            plan: planFilter.value,
            startDate: new Date(startDate.value),
            endDate: new Date(endDate.value),
            status: statusFilter.value
        };

        // Get all investments
        const allInvestments = getInvestmentHistory();

        // Apply filters
        filteredInvestments = allInvestments.filter(investment => {
            const investmentDate = new Date(investment.date);
            return (filters.plan === 'all' || investment.plan === filters.plan) &&
                   (filters.status === 'all' || investment.status === filters.status) &&
                   investmentDate >= filters.startDate &&
                   investmentDate <= filters.endDate;
        });

        // Reset to first page
        currentPageNumber = 1;
        updateInvestmentList();
        updatePagination();
    }

    function getInvestmentHistory() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return (userData.investments || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function updateInvestmentList() {
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageInvestments = filteredInvestments.slice(start, end);

        investmentItems.innerHTML = pageInvestments.map(investment => {
            const plan = investmentPlans[investment.plan];
            const daysActive = calculateDaysActive(investment);
            const earnings = calculateEarnings(investment, daysActive);

            return `
                <div class="transaction-item">
                    <div>${formatDate(new Date(investment.date))}</div>
                    <div>${plan.name}</div>
                    <div class="expense">
                        Rs ${investment.amount.toLocaleString()}
                    </div>
                    <div class="income">
                        Rs ${earnings.toLocaleString()}
                    </div>
                    <div>
                        <span class="status status-${investment.status.toLowerCase()}">
                            ${formatStatus(investment.status)}
                        </span>
                    </div>
                    <div>
                        <button class="action-btn view-btn" onclick="showInvestmentDetails('${investment.id}')">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
        currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;
        
        prevPage.disabled = currentPageNumber === 1;
        nextPage.disabled = currentPageNumber === totalPages;
    }

    function changePage(delta) {
        const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
        const newPage = currentPageNumber + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPageNumber = newPage;
            updateInvestmentList();
            updatePagination();
        }
    }

    function updateStats() {
        const investments = getInvestmentHistory();
        let totalInvested = 0;
        let totalEarnings = 0;
        let activeCount = 0;

        investments.forEach(investment => {
            const daysActive = calculateDaysActive(investment);
            totalInvested += investment.amount;
            totalEarnings += calculateEarnings(investment, daysActive);
            
            if (investment.status === 'active') {
                activeCount++;
            }
        });

        document.getElementById('totalInvested').textContent = totalInvested.toLocaleString();
        document.getElementById('totalEarnings').textContent = totalEarnings.toLocaleString();
        document.getElementById('activeInvestments').textContent = activeCount;
    }

    function showInvestmentDetails(investmentId) {
        const investment = filteredInvestments.find(i => i.id === investmentId);
        if (!investment) return;

        const detailsHtml = generateInvestmentDetailsHtml(investment);
        modal.querySelector('.investment-details').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }

    function generateInvestmentDetailsHtml(investment) {
        const plan = investmentPlans[investment.plan];
        const daysActive = calculateDaysActive(investment);
        const earnings = calculateEarnings(investment, daysActive);
        const remainingDays = investment.status === 'active' ? plan.duration - daysActive : 0;

        const details = [
            ['Investment ID', investment.id],
            ['Plan Name', plan.name],
            ['Investment Amount', `Rs ${investment.amount.toLocaleString()}`],
            ['Daily Profit', `Rs ${plan.dailyProfit.toLocaleString()}`],
            ['Investment Date', formatDate(new Date(investment.date))],
            ['Duration', `${plan.duration} days`],
            ['Days Active', daysActive],
            ['Remaining Days', remainingDays],
            ['Total Earnings', `Rs ${earnings.toLocaleString()}`],
            ['Expected Return', `Rs ${plan.totalReturn.toLocaleString()}`],
            ['Status', formatStatus(investment.status)]
        ];

        if (investment.paymentMethod) {
            details.push(['Payment Method', formatPaymentMethod(investment.paymentMethod)]);
        }

        if (investment.transactionId) {
            details.push(['Transaction ID', investment.transactionId]);
        }

        return details.map(([label, value]) => `
            <div class="detail-row">
                <span>${label}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function downloadStatement() {
        // Implementation for downloading investment statement
        alert('Statement download functionality will be implemented');
    }

    // Helper Functions
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatStatus(status) {
        const statuses = {
            active: 'Active',
            completed: 'Completed',
            pending: 'Pending'
        };
        return statuses[status] || status;
    }

    function formatPaymentMethod(method) {
        const methods = {
            easypaisa: 'EasyPaisa',
            jazzcash: 'JazzCash',
            bank: 'Bank Transfer'
        };
        return methods[method] || method;
    }

    function calculateDaysActive(investment) {
        const startDate = new Date(investment.date);
        const endDate = investment.status === 'completed' ? 
            new Date(investment.completionDate) : new Date();
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function calculateEarnings(investment, daysActive) {
        const plan = investmentPlans[investment.plan];
        const actualDays = Math.min(daysActive, plan.duration);
        return actualDays * plan.dailyProfit;
    }

    // Expose function to global scope for onclick handler
    window.showInvestmentDetails = showInvestmentDetails;
}); 