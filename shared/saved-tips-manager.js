/**
 * Saved Tips Manager - Handles user's saved tips collection
 */

class SavedTipsManager {
    constructor() {
        this.savedTips = this.loadSavedTips();
        this.init();
    }

    init() {
        this.createSavedTipsPage();
        this.addNavigationLink();
    }

    loadSavedTips() {
        return JSON.parse(localStorage.getItem('savedTips') || '[]');
    }

    saveTips() {
        localStorage.setItem('savedTips', JSON.stringify(this.savedTips));
    }

    createSavedTipsPage() {
        // Only create if we're on a page that should show saved tips
        if (window.location.hash === '#saved-tips' || window.location.search.includes('saved-tips')) {
            this.renderSavedTipsPage();
        }
    }

    renderSavedTipsPage() {
        const container = document.createElement('div');
        container.id = 'saved-tips-page';
        container.className = 'saved-tips-page';
        
        container.innerHTML = `
            <div class="saved-tips-header">
                <h2>Your Saved Tips</h2>
                <p>Quick access to tips you've saved for later implementation</p>
                <div class="saved-tips-stats">
                    <span class="stat">
                        <strong>${this.savedTips.length}</strong> saved tips
                    </span>
                    <span class="stat">
                        <strong>${this.getUniqueModules().length}</strong> modules
                    </span>
                </div>
            </div>
            <div class="saved-tips-filters">
                <button class="filter-btn active" data-filter="all">All Tips</button>
                ${this.getUniqueModules().map(module => 
                    `<button class="filter-btn" data-filter="${module}">${this.getModuleDisplayName(module)}</button>`
                ).join('')}
            </div>
            <div class="saved-tips-grid" id="saved-tips-grid">
                ${this.renderSavedTipCards()}
            </div>
        `;

        // Replace main content or insert into designated area
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.innerHTML = '';
            mainContent.appendChild(container);
        }

        this.setupSavedTipsInteractions();
    }

    renderSavedTipCards() {
        if (this.savedTips.length === 0) {
            return `
                <div class="no-saved-tips">
                    <div class="no-tips-icon">💡</div>
                    <h3>No saved tips yet</h3>
                    <p>Start saving tips from your daily learning to build your personal collection!</p>
                    <a href="/" class="btn-primary">Explore Tips</a>
                </div>
            `;
        }

        return this.savedTips.map((tip, index) => `
            <div class="saved-tip-card" data-module="${tip.module}" data-index="${index}">
                <div class="tip-card-header">
                    <span class="tip-module-badge module-${tip.module}">
                        ${this.getModuleDisplayName(tip.module)}
                    </span>
                    <button class="remove-tip-btn" data-index="${index}" title="Remove from saved">
                        ×
                    </button>
                </div>
                <div class="tip-card-content">
                    <h3 class="tip-card-title">${tip.title}</h3>
                    <p class="tip-card-description">${tip.description}</p>
                    <div class="tip-card-steps">
                        <h4>Action Steps:</h4>
                        <ol>
                            ${tip.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                    </div>
                    <div class="tip-card-meta">
                        <span class="tip-time">⏱️ ${tip.estimatedTime || 5} min</span>
                        <span class="tip-saved-date">Saved ${this.formatDate(tip.savedAt)}</span>
                    </div>
                </div>
                <div class="tip-card-actions">
                    <button class="implement-btn" data-index="${index}">
                        Implement Now
                    </button>
                    <button class="mark-complete-btn" data-index="${index}">
                        Mark Complete
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupSavedTipsInteractions() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterTips(e.target.dataset.filter);
            });
        });

        // Remove tip buttons
        document.querySelectorAll('.remove-tip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeTip(index);
            });
        });

        // Implement buttons
        document.querySelectorAll('.implement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.implementTip(index);
            });
        });

        // Mark complete buttons
        document.querySelectorAll('.mark-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.markTipComplete(index);
            });
        });
    }

    filterTips(filter) {
        const cards = document.querySelectorAll('.saved-tip-card');
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.module === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    removeTip(index) {
        if (confirm('Remove this tip from your saved collection?')) {
            this.savedTips.splice(index, 1);
            this.saveTips();
            this.renderSavedTipsPage(); // Re-render to update indices
        }
    }

    implementTip(index) {
        const tip = this.savedTips[index];
        
        // Create implementation modal or expand card
        const modal = document.createElement('div');
        modal.className = 'implementation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Implementing: ${tip.title}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>Description:</strong> ${tip.description}</p>
                    <div class="implementation-checklist">
                        <h4>Follow these steps:</h4>
                        ${tip.steps.map((step, i) => `
                            <div class="checklist-item">
                                <input type="checkbox" id="step-${i}" />
                                <label for="step-${i}">${step}</label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="implementation-timer">
                        <button class="start-timer-btn">Start ${tip.estimatedTime || 5}-Minute Timer</button>
                        <div class="timer-display" style="display: none;">
                            <span class="time-remaining">05:00</span>
                            <button class="stop-timer-btn">Stop</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="complete-implementation-btn">Mark as Completed</button>
                    <button class="save-progress-btn">Save Progress</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupImplementationModal(modal, tip, index);
    }

    setupImplementationModal(modal, tip, index) {
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Timer functionality
        let timer = null;
        let timeRemaining = (tip.estimatedTime || 5) * 60; // Convert to seconds

        const startBtn = modal.querySelector('.start-timer-btn');
        const stopBtn = modal.querySelector('.stop-timer-btn');
        const timerDisplay = modal.querySelector('.timer-display');
        const timeDisplay = modal.querySelector('.time-remaining');

        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
            timerDisplay.style.display = 'flex';
            
            timer = setInterval(() => {
                timeRemaining--;
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeRemaining <= 0) {
                    clearInterval(timer);
                    this.showTimerComplete();
                }
            }, 1000);
        });

        stopBtn.addEventListener('click', () => {
            clearInterval(timer);
            startBtn.style.display = 'block';
            timerDisplay.style.display = 'none';
            timeRemaining = (tip.estimatedTime || 5) * 60; // Reset
        });

        // Complete implementation
        modal.querySelector('.complete-implementation-btn').addEventListener('click', () => {
            this.markTipComplete(index);
            document.body.removeChild(modal);
        });

        // Save progress
        modal.querySelector('.save-progress-btn').addEventListener('click', () => {
            const checkedSteps = modal.querySelectorAll('input[type="checkbox"]:checked').length;
            const totalSteps = tip.steps.length;
            
            // Save progress to tip
            this.savedTips[index].progress = {
                completedSteps: checkedSteps,
                totalSteps: totalSteps,
                lastWorkedOn: new Date().toISOString()
            };
            this.saveTips();
            
            // Show confirmation
            const btn = modal.querySelector('.save-progress-btn');
            const originalText = btn.textContent;
            btn.textContent = '✓ Progress Saved';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    markTipComplete(index) {
        const tip = this.savedTips[index];
        
        // Add to completed tips
        let completedTips = JSON.parse(localStorage.getItem('completedTips') || '[]');
        completedTips.push({
            ...tip,
            completedAt: new Date().toISOString(),
            completedFrom: 'saved'
        });
        localStorage.setItem('completedTips', JSON.stringify(completedTips));
        
        // Remove from saved tips
        this.savedTips.splice(index, 1);
        this.saveTips();
        
        // Show success message
        this.showCompletionSuccess(tip.title);
        
        // Re-render page
        this.renderSavedTipsPage();
    }

    showTimerComplete() {
        // Create celebration notification
        const notification = document.createElement('div');
        notification.className = 'timer-complete-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="celebration-icon">🎉</span>
                <span>Time's up! Great work!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    showCompletionSuccess(tipTitle) {
        const notification = document.createElement('div');
        notification.className = 'completion-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="success-icon">✅</span>
                <span>Completed: ${tipTitle}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    getUniqueModules() {
        return [...new Set(this.savedTips.map(tip => tip.module))];
    }

    getModuleDisplayName(moduleKey) {
        const names = {
            'rpo-training': 'RPO Training',
            'leadership': 'Leadership',
            'prompts': 'Prompt Library',
            'sourcing': 'Sourcing',
            'success-stories': 'Success Stories',
            'knowledge': 'Knowledge',
            'advanced': 'AI SME',
            'general': 'General'
        };
        return names[moduleKey] || 'Learning Hub';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    addNavigationLink() {
        // Add "Saved Tips" link to navigation if it doesn't exist
        const nav = document.querySelector('nav') || document.querySelector('.navigation');
        if (nav && !nav.querySelector('.saved-tips-link')) {
            const link = document.createElement('a');
            link.href = '#saved-tips';
            link.className = 'saved-tips-link nav-link';
            link.innerHTML = `💾 Saved Tips (${this.savedTips.length})`;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderSavedTipsPage();
                window.history.pushState({}, '', '#saved-tips');
            });
            
            nav.appendChild(link);
        }
    }
}

// Initialize saved tips manager
document.addEventListener('DOMContentLoaded', () => {
    new SavedTipsManager();
});