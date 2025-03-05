document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const taskModal = document.querySelector('.task-modal');
    const startButtons = document.querySelectorAll('.start-task-btn');
    const cancelButton = document.querySelector('.cancel-btn');
    const completeButton = document.querySelector('.complete-btn');
    const taskDetails = document.querySelector('.task-details');

    // Task data
    const tasks = {
        'Watch Training Video': {
            type: 'video',
            reward: 500,
            required: 10, // minutes
            description: 'Watch our comprehensive training video about investment strategies and market analysis.',
            videoUrl: 'path/to/training-video.mp4'
        },
        'Complete Quiz': {
            type: 'quiz',
            reward: 1000,
            required: 10, // questions
            description: 'Test your knowledge about investment strategies and earn bonus rewards.',
            questions: [
                {
                    question: 'What is the minimum investment amount for the Starter Plan?',
                    options: ['Rs 5,000', 'Rs 10,000', 'Rs 15,000', 'Rs 20,000'],
                    correct: 1
                },
                // Add more questions here
            ]
        },
        'Refer Friends': {
            type: 'referral',
            reward: 2000,
            required: 5, // referrals
            description: 'Invite your friends to join our platform and earn bonus rewards for each successful referral.',
            referralCode: generateReferralCode()
        }
    };

    // Initialize stats
    updateStats();

    // Handle start task button clicks
    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskCard = this.closest('.task-card');
            const taskName = taskCard.querySelector('h3').textContent;
            const task = tasks[taskName];

            showTaskModal(taskName, task);
        });
    });

    // Handle cancel button click
    cancelButton.addEventListener('click', closeTaskModal);

    // Handle complete button click
    completeButton.addEventListener('click', function() {
        const taskName = this.getAttribute('data-task');
        const task = tasks[taskName];
        
        completeTask(taskName, task);
    });

    // Show task modal with appropriate content
    function showTaskModal(taskName, task) {
        let content = '';

        switch(task.type) {
            case 'video':
                content = `
                    <div class="video-task">
                        <video controls width="100%">
                            <source src="${task.videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <p>${task.description}</p>
                        <div class="time-remaining">Time remaining: ${task.required} minutes</div>
                    </div>
                `;
                break;

            case 'quiz':
                content = `
                    <div class="quiz-task">
                        <p>${task.description}</p>
                        <div class="quiz-questions">
                            ${generateQuizHTML(task.questions)}
                        </div>
                    </div>
                `;
                break;

            case 'referral':
                content = `
                    <div class="referral-task">
                        <p>${task.description}</p>
                        <div class="referral-code">
                            <h3>Your Referral Code</h3>
                            <div class="code">${task.referralCode}</div>
                            <button class="copy-btn" onclick="copyReferralCode('${task.referralCode}')">
                                Copy Code
                            </button>
                        </div>
                        <div class="share-buttons">
                            <button onclick="shareOnWhatsApp('${task.referralCode}')">
                                <i class="fab fa-whatsapp"></i> Share on WhatsApp
                            </button>
                            <button onclick="shareOnFacebook('${task.referralCode}')">
                                <i class="fab fa-facebook"></i> Share on Facebook
                            </button>
                        </div>
                    </div>
                `;
                break;
        }

        taskDetails.innerHTML = content;
        completeButton.setAttribute('data-task', taskName);
        taskModal.style.display = 'flex';
    }

    // Close task modal
    function closeTaskModal() {
        taskModal.style.display = 'none';
        taskDetails.innerHTML = '';
    }

    // Complete task and update progress
    function completeTask(taskName, task) {
        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        // Initialize training bonus data if not exists
        if (!userData.trainingBonus) {
            userData.trainingBonus = {
                available: 0,
                total: 0,
                completedTasks: []
            };
        }

        // Check if task is not already completed
        if (!userData.trainingBonus.completedTasks.includes(taskName)) {
            // Update bonus amounts
            userData.trainingBonus.available += task.reward;
            userData.trainingBonus.total += task.reward;
            userData.trainingBonus.completedTasks.push(taskName);

            // Save updated user data
            localStorage.setItem('userData', JSON.stringify(userData));

            // Update UI
            updateStats();
            updateTaskProgress(taskName);

            // Show success message
            alert(`Congratulations! You've earned Rs ${task.reward} bonus!`);
        }

        closeTaskModal();
    }

    // Update stats display
    function updateStats() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const trainingBonus = userData.trainingBonus || { available: 0, total: 0, completedTasks: [] };

        document.getElementById('availableBonus').textContent = trainingBonus.available.toLocaleString();
        document.getElementById('totalEarned').textContent = trainingBonus.total.toLocaleString();
        document.getElementById('tasksCompleted').textContent = trainingBonus.completedTasks.length;

        // Update progress bars
        updateAllTaskProgress(trainingBonus.completedTasks);
    }

    // Update progress bar for all tasks
    function updateAllTaskProgress(completedTasks) {
        document.querySelectorAll('.task-card').forEach(card => {
            const taskName = card.querySelector('h3').textContent;
            if (completedTasks.includes(taskName)) {
                const progressBar = card.querySelector('.progress');
                progressBar.style.width = '100%';
                card.querySelector('.start-task-btn').disabled = true;
                card.querySelector('.start-task-btn').textContent = 'Completed';
            }
        });
    }

    // Helper function to generate referral code
    function generateReferralCode() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        return `${userData.userName || 'USER'}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
    }

    // Helper function to generate quiz HTML
    function generateQuizHTML(questions) {
        return questions.map((q, index) => `
            <div class="quiz-question">
                <p>${index + 1}. ${q.question}</p>
                <div class="options">
                    ${q.options.map((option, i) => `
                        <label>
                            <input type="radio" name="q${index}" value="${i}">
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
});

// Global functions for sharing
function copyReferralCode(code) {
    navigator.clipboard.writeText(code);
    alert('Referral code copied to clipboard!');
}

function shareOnWhatsApp(code) {
    const text = `Join High-Tech Network using my referral code: ${code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareOnFacebook(code) {
    const text = `Join High-Tech Network using my referral code: ${code}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`);
} 