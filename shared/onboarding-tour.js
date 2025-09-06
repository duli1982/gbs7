/**
 * Onboarding Tour System
 * Provides interactive guided tour for new users
 */

class OnboardingTour {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.settings = {};
        this.messages = {};
        this.analytics = {};
        this.isActive = false;
        this.startTime = null;
        this.stepStartTime = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadTourConfig();
            this.setupEventListeners();
            this.checkFirstVisit();
        } catch (error) {
            console.error('Failed to initialize onboarding tour:', error);
        }
    }

    async loadTourConfig() {
        try {
            const response = await fetch('shared/onboarding-tour.json');
            const config = await response.json();
            
            this.steps = config.steps;
            this.settings = config.settings;
            this.messages = config.messages;
            this.analytics = config.analytics;
        } catch (error) {
            console.error('Failed to load tour configuration:', error);
            // Fallback to basic configuration
            this.initializeFallbackConfig();
        }
    }

    initializeFallbackConfig() {
        this.steps = [
            {
                id: "welcome",
                title: "Welcome! 👋",
                content: "Welcome to Randstad GBS Learning Hub! Let's take a quick tour.",
                target: null,
                position: "center",
                showSkip: true
            }
        ];
        this.settings = { autoStart: false, showOnFirstVisit: true };
        this.messages = { startTour: "Take Tour", skipTour: "Skip" };
    }

    checkFirstVisit() {
        const hasCompleted = localStorage.getItem('onboarding-tour-completed');
        const hasSeenWelcome = localStorage.getItem('onboarding-welcome-shown');
        
        if (!hasCompleted && this.settings.showOnFirstVisit && !hasSeenWelcome) {
            // Show welcome banner for first-time visitors who haven't seen it
            setTimeout(() => {
                this.showWelcomeBanner();
            }, 1500);
            
            // Also show tour button for easy access
            setTimeout(() => {
                this.showTourButton();
            }, 2000);
        } else if (!hasCompleted) {
            // Show tour button for returning users who haven't completed tour
            this.showTourButton();
        } else {
            // For users who completed the tour, hide the button initially
            // but show a subtle restart option after some time
            this.hideTourButton();
            setTimeout(() => {
                this.showRestartOption();
            }, 5000);
        }
    }

    showWelcomeBanner() {
        if (document.getElementById('welcome-banner')) return; // Already shown
        
        const banner = document.createElement('div');
        banner.id = 'welcome-banner';
        banner.className = 'tour-welcome-banner';
        banner.innerHTML = `
            <div class="welcome-banner-content">
                <div class="welcome-text">
                    <span class="welcome-icon">👋</span>
                    <span>${this.messages.welcomeBanner || 'Welcome! Take our quick tour to get started.'}</span>
                </div>
                <div class="welcome-actions">
                    <button class="tour-start-btn" onclick="window.onboardingTour.startTour()">
                        ${this.messages.startTour || 'Take Tour'}
                    </button>
                    <button class="tour-dismiss-btn" onclick="window.onboardingTour.dismissWelcome()">
                        ×
                    </button>
                </div>
            </div>
        `;

        // Insert at the top of the page
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Mark welcome as shown
        localStorage.setItem('onboarding-welcome-shown', 'true');
        
        // Auto-hide after 10 seconds if not interacted with
        setTimeout(() => {
            if (document.getElementById('welcome-banner')) {
                this.dismissWelcome();
            }
        }, 10000);
    }

    showTourButton() {
        // Show tour button in header for first-time visitors or returning users
        const headerBtn = document.getElementById('tour-header-btn');
        const restartBtn = document.getElementById('restart-tour-btn');
        
        if (headerBtn && restartBtn) {
            // Show the header button (integrated design)
            headerBtn.style.display = 'block';
            headerBtn.style.animation = 'fadeInUp 0.5s ease-out';
            restartBtn.onclick = () => this.startTour();
            
            // Update button text based on completion status
            const hasCompleted = localStorage.getItem('onboarding-tour-completed');
            const buttonText = restartBtn.querySelector('span:last-child');
            if (buttonText) {
                buttonText.textContent = hasCompleted ? 'Retake Tour' : 'Take Interactive Tour';
            }
        } else {
            // Fallback: create fixed position button
            this.createFixedTourButton();
        }
    }

    hideTourButton() {
        const headerBtn = document.getElementById('tour-header-btn');
        if (headerBtn) {
            headerBtn.style.display = 'none';
        }
        
        // Also remove any fixed buttons
        const fixedBtn = document.getElementById('fixed-tour-btn');
        if (fixedBtn) {
            fixedBtn.remove();
        }
    }

    showRestartOption() {
        const hasCompleted = localStorage.getItem('onboarding-tour-completed');
        if (!hasCompleted) return; // Only show for completed users
        
        const headerBtn = document.getElementById('tour-header-btn');
        const restartBtn = document.getElementById('restart-tour-btn');
        
        if (headerBtn && restartBtn) {
            // Show as a subtle restart option
            headerBtn.style.display = 'block';
            headerBtn.style.opacity = '0.7';
            headerBtn.style.animation = 'fadeInUp 0.5s ease-out';
            
            // Update button styling for restart
            restartBtn.classList.add('tour-restart-subtle');
            
            const buttonText = restartBtn.querySelector('span:last-child');
            if (buttonText) {
                buttonText.textContent = 'Retake Tour';
            }
            
            restartBtn.onclick = () => this.restartTour();
        }
    }

    createFixedTourButton() {
        // Remove existing fixed button
        const existing = document.getElementById('fixed-tour-btn');
        if (existing) existing.remove();

        const tourBtn = document.createElement('button');
        tourBtn.id = 'fixed-tour-btn';
        tourBtn.className = 'tour-restart-button';
        tourBtn.innerHTML = this.messages.restartTour || '🎯 Take Tour';
        tourBtn.onclick = () => this.startTour();

        document.body.appendChild(tourBtn);
    }

    dismissWelcome() {
        const banner = document.getElementById('welcome-banner');
        if (banner) {
            banner.style.animation = 'slideOutUp 0.3s ease-in forwards';
            setTimeout(() => {
                banner.remove();
                // Ensure tour button is visible after dismissing welcome
                this.showTourButton();
            }, 300);
        }
        
        // Mark welcome as shown but don't mark tour as completed
        localStorage.setItem('onboarding-welcome-shown', 'true');
    }

    startTour() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.startTime = Date.now();
        
        // Remove welcome banner if present
        const banner = document.getElementById('welcome-banner');
        if (banner) banner.remove();
        
        // Create tour overlay
        this.createTourOverlay();
        
        // Show first step
        this.showStep(0);
        
        // Track tour start
        this.trackEvent('tour_started');
    }

    createTourOverlay() {
        // Remove existing overlay
        const existing = document.getElementById('tour-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tour-overlay';
        overlay.className = 'tour-overlay';
        
        document.body.appendChild(overlay);
        document.body.classList.add('tour-active');
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        this.currentStep = stepIndex;
        this.stepStartTime = Date.now();
        const step = this.steps[stepIndex];
        
        // Remove existing tooltip
        const existingTooltip = document.getElementById('tour-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        // Remove existing spotlight
        this.removeSpotlight();
        
        // Create spotlight if target exists
        if (step.target) {
            this.createSpotlight(step.target);
        }
        
        // Create tooltip
        this.createTooltip(step);
        
        // Execute step action
        if (step.action) {
            this.executeAction(step.action);
        }
        
        // Track step view
        this.trackEvent('step_viewed', { step: stepIndex, stepId: step.id });
    }

    createSpotlight(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) return;
        
        // Add spotlight class to target
        target.classList.add('tour-spotlight');
        
        // Scroll target into view
        target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
        });
    }

    removeSpotlight() {
        document.querySelectorAll('.tour-spotlight').forEach(el => {
            el.classList.remove('tour-spotlight');
        });
    }

    createTooltip(step) {
        const tooltip = document.createElement('div');
        tooltip.id = 'tour-tooltip';
        tooltip.className = 'tour-tooltip';
        
        const progress = Math.round(((this.currentStep + 1) / this.steps.length) * 100);
        
        tooltip.innerHTML = `
            <div class="tour-tooltip-header">
                <div class="tour-progress">
                    <div class="tour-progress-bar">
                        <div class="tour-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="tour-progress-text">${this.currentStep + 1} of ${this.steps.length}</span>
                </div>
                ${step.showSkip ? `<button class="tour-skip-btn" onclick="window.onboardingTour.skipTour()">
                    ${this.messages.skipTour || 'Skip'}
                </button>` : ''}
            </div>
            <div class="tour-tooltip-content">
                <h3 class="tour-tooltip-title">${step.title}</h3>
                <p class="tour-tooltip-text">${step.content}</p>
            </div>
            <div class="tour-tooltip-footer">
                <div class="tour-navigation">
                    ${step.showBack && this.currentStep > 0 ? `
                        <button class="tour-btn tour-btn-secondary" onclick="window.onboardingTour.previousStep()">
                            ${this.messages.prevStep || 'Back'}
                        </button>
                    ` : '<div></div>'}
                    <button class="tour-btn tour-btn-primary" onclick="window.onboardingTour.nextStep()">
                        ${this.currentStep === this.steps.length - 1 ? 
                            (this.messages.completeTour || 'Get Started!') : 
                            (this.messages.nextStep || 'Next')}
                    </button>
                </div>
                <div class="tour-keyboard-hint">
                    ${this.messages.keyboardHint || 'Use arrow keys or space to navigate'}
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        this.positionTooltip(tooltip, step);
        
        // Animate in
        setTimeout(() => {
            tooltip.classList.add('tour-tooltip-visible');
        }, 50);
    }

    positionTooltip(tooltip, step) {
        if (!step.target || step.position === 'center') {
            // Center the tooltip
            tooltip.classList.add('tour-tooltip-center');
            return;
        }
        
        const target = document.querySelector(step.target);
        if (!target) {
            tooltip.classList.add('tour-tooltip-center');
            return;
        }
        
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let top, left;
        
        switch (step.position) {
            case 'bottom':
                top = targetRect.bottom + 20;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'top':
                top = targetRect.top - tooltipRect.height - 20;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
                left = targetRect.right + 20;
                break;
            default:
                top = targetRect.bottom + 20;
                left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        }
        
        // Keep tooltip in viewport
        if (left < 20) left = 20;
        if (left + tooltipRect.width > viewportWidth - 20) {
            left = viewportWidth - tooltipRect.width - 20;
        }
        if (top < 20) top = 20;
        if (top + tooltipRect.height > viewportHeight - 20) {
            top = viewportHeight - tooltipRect.height - 20;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.classList.add('tour-tooltip-positioned');
    }

    executeAction(action) {
        const element = action.element ? document.querySelector(action.element) : null;
        
        switch (action.type) {
            case 'highlight':
                if (element) {
                    element.classList.add('tour-highlight');
                    setTimeout(() => {
                        element.classList.remove('tour-highlight');
                    }, 2000);
                }
                break;
            case 'pulse':
                if (element) {
                    element.classList.add('tour-pulse');
                    setTimeout(() => {
                        element.classList.remove('tour-pulse');
                    }, 2000);
                }
                break;
            case 'focus':
                if (element && element.focus) {
                    element.focus();
                }
                break;
            case 'celebrate':
                document.body.classList.add('tour-celebrate');
                setTimeout(() => {
                    document.body.classList.remove('tour-celebrate');
                }, 1000);
                break;
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeTour();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    skipTour() {
        this.trackEvent('tour_skipped', { 
            step: this.currentStep,
            stepsViewed: this.currentStep + 1,
            totalSteps: this.steps.length
        });
        this.endTour();
    }

    completeTour() {
        this.trackEvent('tour_completed', {
            totalSteps: this.steps.length,
            timeSpent: Date.now() - this.startTime
        });
        
        localStorage.setItem('onboarding-tour-completed', 'true');
        localStorage.setItem('onboarding-tour-completed-date', new Date().toISOString());
        
        this.endTour();
        
        // Show completion message
        this.showCompletionMessage();
    }

    endTour() {
        this.isActive = false;
        
        // Remove tour elements
        const overlay = document.getElementById('tour-overlay');
        const tooltip = document.getElementById('tour-tooltip');
        
        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        
        // Remove spotlight
        this.removeSpotlight();
        
        // Remove tour classes
        document.body.classList.remove('tour-active', 'tour-celebrate');
        
        // Hide tour button immediately after completion
        this.hideTourButton();
        
        // For completed tours, DO NOT show subtle restart option
        // Comment out or remove the following lines:
        // const hasCompleted = localStorage.getItem('onboarding-tour-completed');
        // if (hasCompleted) {
        //     setTimeout(() => {
        //         this.showRestartOption();
        //     }, 3000);
        // }
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'tour-completion-message';
        message.innerHTML = `
            <div class="completion-content">
                <span class="completion-icon">🎉</span>
                <span>${this.messages.tourCompleted || 'Tour completed! Welcome to the Learning Hub.'}</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('tour-completion-visible');
        }, 100);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) {
                // Global shortcuts
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    this.startTour();
                }
                return;
            }
            
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextStep();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousStep();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.skipTour();
                    break;
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isActive) {
                const tooltip = document.getElementById('tour-tooltip');
                if (tooltip) {
                    const step = this.steps[this.currentStep];
                    this.positionTooltip(tooltip, step);
                }
            }
        });
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (this.settings.pauseOnBackground && document.hidden && this.isActive) {
                // Pause tour when page is not visible
                this.trackEvent('tour_paused');
            }
        });
    }

    trackEvent(eventName, data = {}) {
        if (!this.analytics.trackCompletion && eventName.includes('completion')) return;
        if (!this.analytics.trackStepViews && eventName.includes('step_viewed')) return;
        
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            tourVersion: '1.0',
            ...data
        };
        
        // Store in localStorage for now (can be extended to send to analytics service)
        const analytics = JSON.parse(localStorage.getItem('onboarding-analytics') || '[]');
        analytics.push(eventData);
        localStorage.setItem('onboarding-analytics', JSON.stringify(analytics));
        
        console.log('Tour Analytics:', eventData);
    }

    // Public method to restart tour
    restartTour() {
        localStorage.removeItem('onboarding-tour-completed');
        this.startTour();
    }
}

// Initialize tour when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.onboardingTour = new OnboardingTour();
});

// Global functions for easy access
window.startOnboardingTour = () => {
    if (window.onboardingTour) {
        window.onboardingTour.startTour();
    }
};

window.restartOnboardingTour = () => {
    if (window.onboardingTour) {
        window.onboardingTour.restartTour();
    }
};