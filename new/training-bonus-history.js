document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const trainingBonusItems = document.getElementById('trainingBonusItems');
    const courseTypeFilter = document.getElementById('courseTypeFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const statusFilter = document.getElementById('statusFilter');
    const applyFilters = document.getElementById('applyFilters');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const currentPage = document.getElementById('currentPage');
    const modal = document.getElementById('trainingModal');
    const closeBtn = modal.querySelector('.close-btn');
    const downloadBtn = modal.querySelector('.download-btn');

    // Pagination state
    let currentPageNumber = 1;
    const itemsPerPage = 10;
    let filteredTrainingBonuses = [];

    // Course Types and their bonus amounts
    const courseTypes = {
        basic: {
            name: 'Basic Training',
            bonus: 1000,
            duration: '1 week'
        },
        advanced: {
            name: 'Advanced Training',
            bonus: 2500,
            duration: '2 weeks'
        },
        expert: {
            name: 'Expert Training',
            bonus: 5000,
            duration: '4 weeks'
        }
    };

    // Initialize
    initializePage();

    // Event Listeners
    applyFilters.addEventListener('click', handleFilterChange);
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    downloadBtn.addEventListener('click', downloadCertificate);

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
            courseType: courseTypeFilter.value,
            startDate: new Date(startDate.value),
            endDate: new Date(endDate.value),
            status: statusFilter.value
        };

        // Get all training bonuses
        const allTrainingBonuses = getTrainingBonusHistory();

        // Apply filters
        filteredTrainingBonuses = allTrainingBonuses.filter(training => {
            const trainingDate = new Date(training.startDate);
            return (filters.courseType === 'all' || training.courseType === filters.courseType) &&
                   (filters.status === 'all' || training.status === filters.status) &&
                   trainingDate >= filters.startDate &&
                   trainingDate <= filters.endDate;
        });

        // Reset to first page
        currentPageNumber = 1;
        updateTrainingBonusList();
        updatePagination();
    }

    function getTrainingBonusHistory() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return (userData.trainingHistory || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    function updateTrainingBonusList() {
        const start = (currentPageNumber - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageTrainings = filteredTrainingBonuses.slice(start, end);

        trainingBonusItems.innerHTML = pageTrainings.map(training => `
            <div class="transaction-item">
                <div>${formatDate(new Date(training.startDate))}</div>
                <div>${courseTypes[training.courseType].name}</div>
                <div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${training.progress}%"></div>
                    </div>
                    <span>${training.progress}%</span>
                </div>
                <div class="income">
                    Rs ${courseTypes[training.courseType].bonus.toLocaleString()}
                </div>
                <div>
                    <span class="status status-${training.status.toLowerCase()}">
                        ${formatStatus(training.status)}
                    </span>
                </div>
                <div>
                    <button class="action-btn view-btn" onclick="showTrainingDetails('${training.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredTrainingBonuses.length / itemsPerPage);
        currentPage.textContent = `Page ${currentPageNumber} of ${totalPages}`;
        
        prevPage.disabled = currentPageNumber === 1;
        nextPage.disabled = currentPageNumber === totalPages;
    }

    function changePage(delta) {
        const totalPages = Math.ceil(filteredTrainingBonuses.length / itemsPerPage);
        const newPage = currentPageNumber + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            currentPageNumber = newPage;
            updateTrainingBonusList();
            updatePagination();
        }
    }

    function updateStats() {
        const trainings = getTrainingBonusHistory();
        let totalBonus = 0;
        let completedCount = 0;
        let availableBonus = 0;

        trainings.forEach(training => {
            const courseBonus = courseTypes[training.courseType].bonus;
            if (training.status === 'completed') {
                totalBonus += courseBonus;
                completedCount++;
            } else if (training.status === 'in_progress' && training.progress === 100) {
                availableBonus += courseBonus;
            }
        });

        document.getElementById('totalTrainingBonus').textContent = totalBonus.toLocaleString();
        document.getElementById('completedCourses').textContent = completedCount;
        document.getElementById('availableBonus').textContent = availableBonus.toLocaleString();
    }

    function showTrainingDetails(trainingId) {
        const training = filteredTrainingBonuses.find(t => t.id === trainingId);
        if (!training) return;

        const detailsHtml = generateTrainingDetailsHtml(training);
        modal.querySelector('.training-details').innerHTML = detailsHtml;
        modal.style.display = 'flex';
    }

    function generateTrainingDetailsHtml(training) {
        const courseInfo = courseTypes[training.courseType];
        const details = [
            ['Course ID', training.id],
            ['Course Name', courseInfo.name],
            ['Start Date', formatDate(new Date(training.startDate))],
            ['End Date', training.endDate ? formatDate(new Date(training.endDate)) : 'In Progress'],
            ['Duration', courseInfo.duration],
            ['Progress', `${training.progress}%`],
            ['Bonus Amount', `Rs ${courseInfo.bonus.toLocaleString()}`],
            ['Status', formatStatus(training.status)]
        ];

        if (training.completionDate) {
            details.push(['Completion Date', formatDate(new Date(training.completionDate))]);
        }

        if (training.bonusReceived) {
            details.push(['Bonus Received Date', formatDate(new Date(training.bonusReceived))]);
        }

        if (training.instructor) {
            details.push(['Instructor', training.instructor]);
        }

        if (training.score) {
            details.push(['Final Score', `${training.score}%`]);
        }

        return details.map(([label, value]) => `
            <div class="detail-row">
                <span>${label}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
    }

    function downloadCertificate() {
        // Implementation for downloading training certificate
        alert('Certificate download functionality will be implemented');
    }

    // Helper Functions
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function formatStatus(status) {
        const statuses = {
            completed: 'Completed',
            in_progress: 'In Progress',
            bonus_received: 'Bonus Received'
        };
        return statuses[status] || status;
    }

    // Expose function to global scope for onclick handler
    window.showTrainingDetails = showTrainingDetails;
}); 