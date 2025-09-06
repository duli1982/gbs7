/**
 * Daily Tips System - Expandable across all modules
 * Provides 5-minute actionable tips for continuous learning
 */

class DailyTipsSystem {
    constructor() {
        this.currentModule = this.detectCurrentModule();
        this.userProgress = this.loadUserProgress();
        this.tipHistory = this.loadTipHistory();
        this.init();
    }

    detectCurrentModule() {
        const path = window.location.pathname;
        if (path.includes('rpo-training')) return 'rpo-training';
        if (path.includes('gbs-ai-workshop')) return 'leadership';
        if (path.includes('gbs-prompts')) return 'prompts';
        if (path.includes('daily-focus')) return 'sourcing';
        if (path.includes('use-cases')) return 'success-stories';
        if (path.includes('knowledge-content')) return 'knowledge';
        if (path.includes('ai-sme')) return 'advanced';
        return 'general';
    }

    init() {
        this.createTipContainer();
        this.displayDailyTip();
        this.setupTipNavigation();
        this.trackEngagement();
    }

    createTipContainer() {
        // Check if we're on the main hub page
        const path = window.location.pathname;
        const isHubPage = path === '/' || 
                         path === '/index.html' || 
                         path.endsWith('/index.html') ||
                         path === '' ||
                         (path.split('/').length <= 2 && path.includes('index'));
        

        
        if (isHubPage) {
            this.createHubPageTip();
        } else {
            this.createModulePageTip();
        }
    }

    createHubPageTip() {
        // Create a more integrated tip for the hub page
        const tipContainer = document.createElement('div');
        tipContainer.id = 'daily-tip-container';
        tipContainer.className = 'daily-tip-container hub-page-tip';
        
        // Try multiple insertion strategies
        const searchContainer = document.querySelector('.search-container');
        const mainGrid = document.querySelector('#modules-grid');
        const mainElement = document.querySelector('main');
        const containerElement = document.querySelector('.container');
        

        
        // Create a compact tip banner
        tipContainer.innerHTML = `
            <div class="hub-tip-banner">
                <div class="tip-content-compact">
                    <div class="tip-left">
                        <div class="tip-icon-small">💡</div>
                        <div class="tip-text">
                            <div class="tip-title-small">Today's Quick Win</div>
                            <div class="tip-description-small"></div>
                        </div>
                    </div>
                    <div class="tip-right">
                        <button class="tip-expand-btn">View Tip</button>
                        <button class="tip-dismiss-btn">×</button>
                    </div>
                </div>
                
                <!-- Expanded view (hidden by default) -->
                <div class="tip-expanded-content" style="display: none;">
                    <div class="tip-description"></div>
                    <div class="tip-action-steps"></div>
                    <div class="tip-footer-compact">
                        <button class="tip-mark-complete">Complete</button>
                        <button class="tip-save">Save</button>
                        <div class="tip-streak">
                            <span class="streak-icon">🔥</span>
                            <span class="streak-count">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Simple and reliable insertion strategy
        let inserted = false;
        
        // Strategy 1: Insert after search container using insertAdjacentElement
        if (searchContainer) {
            try {

                searchContainer.insertAdjacentElement('afterend', tipContainer);
                inserted = true;
            } catch (error) {
                // Strategy 1 failed, try next strategy
            }
        }
        
        // Strategy 2: Insert before main grid if it exists
        if (!inserted && mainGrid) {
            try {
                console.log('Daily Tips System - Using strategy 2: before main grid');
                mainGrid.insertAdjacentElement('beforebegin', tipContainer);
                inserted = true;
            } catch (error) {
                console.log('Daily Tips System - Strategy 2 failed:', error.message);
            }
        }
        
        // Strategy 3: Insert at the beginning of main element
        if (!inserted && mainElement) {
            try {
                console.log('Daily Tips System - Using strategy 3: beginning of main');
                mainElement.insertAdjacentElement('afterbegin', tipContainer);
                inserted = true;
            } catch (error) {
                console.log('Daily Tips System - Strategy 3 failed:', error.message);
            }
        }
        
        // Strategy 4: Insert at the beginning of container
        if (!inserted && containerElement) {
            try {
                console.log('Daily Tips System - Using strategy 4: beginning of container');
                containerElement.insertAdjacentElement('afterbegin', tipContainer);
                inserted = true;
            } catch (error) {
                console.log('Daily Tips System - Strategy 4 failed:', error.message);
            }
        }
        
        // Strategy 5: Fallback - append to body
        if (!inserted) {
            try {
                console.log('Daily Tips System - Using strategy 5: fallback to body');
                document.body.appendChild(tipContainer);
                inserted = true;
            } catch (error) {
                console.log('Daily Tips System - Strategy 5 failed:', error.message);
            }
        }
        
        if (inserted) {
            console.log('Daily Tips System - Hub page tip successfully inserted');
        } else {
            console.error('Daily Tips System - Failed to insert hub page tip');
        }
    }

    createModulePageTip() {
        // Create the full tip card for module pages
        const tipContainer = document.createElement('div');
        tipContainer.id = 'daily-tip-container';
        tipContainer.className = 'daily-tip-container module-page-tip';
        tipContainer.innerHTML = `
            <div class="daily-tip-card">
                <div class="tip-header">
                    <div class="tip-icon">💡</div>
                    <div class="tip-meta">
                        <h3 class="tip-title">Today's 5-Minute Tip</h3>
                        <span class="tip-module-badge"></span>
                    </div>
                    <div class="tip-controls">
                        <button class="tip-prev" title="Previous tip">‹</button>
                        <button class="tip-next" title="Next tip">›</button>
                        <button class="tip-close" title="Dismiss">×</button>
                    </div>
                </div>
                <div class="tip-content">
                    <div class="tip-description"></div>
                    <div class="tip-action-steps"></div>
                    <div class="tip-timer">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-text">Estimated time: 5 minutes</span>
                    </div>
                </div>
                <div class="tip-footer">
                    <button class="tip-mark-complete">Mark as Complete</button>
                    <button class="tip-save">Save for Later</button>
                    <div class="tip-streak">
                        <span class="streak-icon">🔥</span>
                        <span class="streak-count">0</span>
                        <span class="streak-text">day streak</span>
                    </div>
                </div>
            </div>
        `;

        // Insert at the top of the main content area
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.insertBefore(tipContainer, mainContent.firstChild);
        }
    }

    displayDailyTip() {
        const today = new Date().toDateString();
        const todaysTip = this.getTipForDate(today);
        
        if (todaysTip) {
            this.renderTip(todaysTip);
            this.updateStreak();
        }
    }

    getTipForDate(date) {
        const dayOfYear = this.getDayOfYear(new Date(date));
        const moduleKey = this.currentModule;
        const tips = this.getAllTips()[moduleKey] || this.getAllTips()['general'];
        
        // Cycle through tips based on day of year
        const tipIndex = dayOfYear % tips.length;
        return {
            ...tips[tipIndex],
            module: moduleKey,
            date: date
        };
    }

    renderTip(tip) {
        const container = document.getElementById('daily-tip-container');
        if (!container) return;

        const isHubPage = container.classList.contains('hub-page-tip');

        if (isHubPage) {
            this.renderHubPageTip(tip, container);
        } else {
            this.renderModulePageTip(tip, container);
        }
    }

    renderHubPageTip(tip, container) {
        // Update compact description
        const compactDesc = container.querySelector('.tip-description-small');
        if (compactDesc) {
            compactDesc.textContent = tip.description.substring(0, 80) + '...';
        }

        // Update expanded content
        const fullDesc = container.querySelector('.tip-description');
        if (fullDesc) {
            fullDesc.innerHTML = tip.description;
        }
        
        // Render action steps
        const stepsContainer = container.querySelector('.tip-action-steps');
        if (stepsContainer) {
            stepsContainer.innerHTML = `
                <div class="action-steps-compact">
                    <h4>Quick Steps:</h4>
                    <ol>
                        ${tip.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        }
    }

    renderModulePageTip(tip, container) {
        // Update module badge
        const badge = container.querySelector('.tip-module-badge');
        if (badge) {
            badge.textContent = this.getModuleDisplayName(tip.module);
            badge.className = `tip-module-badge module-${tip.module}`;
        }

        // Update content
        const desc = container.querySelector('.tip-description');
        if (desc) {
            desc.innerHTML = tip.description;
        }
        
        // Render action steps
        const stepsContainer = container.querySelector('.tip-action-steps');
        if (stepsContainer) {
            stepsContainer.innerHTML = `
                <div class="action-steps">
                    <h4>Quick Action Steps:</h4>
                    <ol>
                        ${tip.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
        }

        // Update timer if different from default
        const timerText = container.querySelector('.timer-text');
        if (timerText && tip.estimatedTime && tip.estimatedTime !== 5) {
            timerText.textContent = `Estimated time: ${tip.estimatedTime} minutes`;
        }
    }

    getAllTips() {
        return {
            'rpo-training': [
                {
                    title: "Master the C.R.E.A.T.E. Framework",
                    description: "Practice building one perfect prompt using Character, Request, Examples, Additions, Type, and Extras.",
                    steps: [
                        "Pick a real task you need to do today",
                        "Define your Character (role for AI to play)",
                        "Write a clear Request (what you want)",
                        "Add one Example of good output",
                        "Specify the Type of response you need",
                        "Test it and refine based on results"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Boolean String Quick Win",
                    description: "Generate a complex Boolean search string for your current role in under 3 minutes.",
                    steps: [
                        "Open your AI tool and describe the role you're sourcing",
                        "Ask for 3 different Boolean string variations",
                        "Test one string on LinkedIn or your ATS",
                        "Save the best performing string for future use",
                        "Share the result with your team"
                    ],
                    estimatedTime: 4
                },
                {
                    title: "Data Analysis Speed Run",
                    description: "Use AI to analyze a dataset and extract 3 key insights in minutes.",
                    steps: [
                        "Upload or paste a small dataset into your AI tool",
                        "Ask for the top 3 trends or patterns",
                        "Request one actionable recommendation",
                        "Create a simple visualization if possible",
                        "Document the insight for your next team meeting"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Automation Quick Setup",
                    description: "Set up one simple automation that will save you 10 minutes daily.",
                    steps: [
                        "Identify one repetitive task you do daily",
                        "Use AI to write the automation steps",
                        "Set up the automation in your preferred tool",
                        "Test it with sample data",
                        "Calculate your weekly time savings"
                    ],
                    estimatedTime: 6
                }
            ],
            'leadership': [
                {
                    title: "Team AI Readiness Check",
                    description: "Assess your team's AI readiness and identify the next training priority.",
                    steps: [
                        "List your team members and their current AI usage",
                        "Identify the biggest AI opportunity for your team",
                        "Choose one person to mentor this week",
                        "Schedule a 15-minute AI check-in with them",
                        "Document their progress and challenges"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "ROI Calculation Practice",
                    description: "Calculate the ROI of one AI implementation in your department.",
                    steps: [
                        "Pick one AI tool or process your team uses",
                        "Estimate time saved per person per week",
                        "Calculate the monetary value (hourly rate × time saved)",
                        "Compare against any tool costs or training time",
                        "Create a simple ROI summary to share upward"
                    ],
                    estimatedTime: 4
                },
                {
                    title: "Resistance Handling Practice",
                    description: "Prepare responses for the most common AI resistance you encounter.",
                    steps: [
                        "Identify the top AI concern you hear from your team",
                        "Write a 2-sentence empathetic response",
                        "Prepare one concrete example of AI success",
                        "Practice the conversation out loud",
                        "Use it in your next team interaction"
                    ],
                    estimatedTime: 5
                }
            ],
            'prompts': [
                {
                    title: "Prompt Library Expansion",
                    description: "Add 3 new prompts to your personal collection based on yesterday's work.",
                    steps: [
                        "Review tasks you did yesterday that took longer than expected",
                        "Create prompts for 2-3 of those tasks",
                        "Test each prompt with sample data",
                        "Save the working prompts to your library",
                        "Tag them for easy future discovery"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Prompt Optimization Challenge",
                    description: "Take an existing prompt and make it 50% more effective.",
                    steps: [
                        "Choose a prompt you use regularly",
                        "Add more specific context or examples",
                        "Test the original vs. improved version",
                        "Measure the quality difference",
                        "Update your saved version with the improvement"
                    ],
                    estimatedTime: 4
                },
                {
                    title: "Cross-Department Prompt Sharing",
                    description: "Find and adapt a prompt from another department for your use.",
                    steps: [
                        "Browse prompts from a different department",
                        "Identify one that could work for your role",
                        "Adapt the language and context for your needs",
                        "Test it on a real task",
                        "Share your adaptation back to the community"
                    ],
                    estimatedTime: 5
                }
            ],
            'sourcing': [
                {
                    title: "Outreach Message Refresh",
                    description: "Improve one of your standard outreach templates using AI.",
                    steps: [
                        "Copy your most-used outreach template",
                        "Ask AI to make it more engaging and personal",
                        "A/B test the new version with 5 candidates",
                        "Track response rates for both versions",
                        "Update your template with the winner"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Talent Pool Audit",
                    description: "Use AI to analyze and refresh one of your saved talent pools.",
                    steps: [
                        "Export or review one saved candidate list",
                        "Ask AI to identify patterns in successful profiles",
                        "Generate new search criteria based on patterns",
                        "Find 3 new candidates using the refined criteria",
                        "Add them to your refreshed talent pool"
                    ],
                    estimatedTime: 6
                },
                {
                    title: "Market Intelligence Gathering",
                    description: "Quickly research salary and market trends for your current role.",
                    steps: [
                        "Ask AI for current salary ranges for your target role",
                        "Request market demand insights and trends",
                        "Identify 3 key selling points for the role",
                        "Update your pitch based on market intelligence",
                        "Share insights with your recruiting team"
                    ],
                    estimatedTime: 4
                }
            ],
            'success-stories': [
                {
                    title: "Personal Success Documentation",
                    description: "Document one AI win from this week to inspire others.",
                    steps: [
                        "Identify one task where AI saved you time this week",
                        "Calculate the exact time savings",
                        "Write a 3-sentence success story",
                        "Include the specific prompt or tool you used",
                        "Submit it to the success stories collection"
                    ],
                    estimatedTime: 4
                },
                {
                    title: "Success Story Implementation",
                    description: "Try implementing one success story from another team member.",
                    steps: [
                        "Browse recent success stories from colleagues",
                        "Pick one that applies to your role",
                        "Follow their exact steps with your own data",
                        "Measure your results vs. their reported outcomes",
                        "Share your replication experience"
                    ],
                    estimatedTime: 5
                }
            ],
            'knowledge': [
                {
                    title: "Knowledge Gap Identification",
                    description: "Identify and fill one AI knowledge gap you have today.",
                    steps: [
                        "Think of an AI task you've been avoiding",
                        "Find relevant training content or documentation",
                        "Spend 3 minutes learning the basics",
                        "Try one simple implementation",
                        "Schedule time to practice more this week"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Best Practice Sharing",
                    description: "Share one AI best practice you've learned with your team.",
                    steps: [
                        "Identify one AI technique that works well for you",
                        "Write a simple how-to guide (3-4 steps)",
                        "Test it with a colleague",
                        "Refine based on their feedback",
                        "Share it in your team channel or meeting"
                    ],
                    estimatedTime: 5
                }
            ],
            'advanced': [
                {
                    title: "Advanced Technique Exploration",
                    description: "Explore one advanced AI technique and create a simple use case.",
                    steps: [
                        "Research one advanced AI concept (RAG, fine-tuning, etc.)",
                        "Identify how it could apply to your work",
                        "Create a simple proof-of-concept",
                        "Document the potential business impact",
                        "Share findings with the AI SME community"
                    ],
                    estimatedTime: 7
                },
                {
                    title: "Innovation Opportunity Mapping",
                    description: "Identify one process that could be revolutionized with AI.",
                    steps: [
                        "Map out a current manual process in your department",
                        "Identify the most time-consuming steps",
                        "Research AI solutions for those pain points",
                        "Estimate potential impact and feasibility",
                        "Create a one-page innovation proposal"
                    ],
                    estimatedTime: 6
                }
            ],
            'general': [
                {
                    title: "Daily AI Habit Building",
                    description: "Establish one new AI habit that will compound over time.",
                    steps: [
                        "Choose one daily task you do manually",
                        "Find or create an AI solution for it",
                        "Use the AI solution for this task today",
                        "Set a reminder to use it again tomorrow",
                        "Track your time savings for one week"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Quick Module Exploration",
                    description: "Spend 5 minutes exploring a new section of the Learning Hub.",
                    steps: [
                        "Pick a module you haven't visited recently",
                        "Browse through 2-3 pieces of content",
                        "Bookmark one item that interests you",
                        "Try one quick tip or technique",
                        "Share your discovery with a colleague"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "AI Success Documentation",
                    description: "Document one way AI helped you this week to inspire others.",
                    steps: [
                        "Think of one task where AI saved you time recently",
                        "Write a 2-sentence summary of what you did",
                        "Note the time savings or quality improvement",
                        "Share it in your team chat or meeting",
                        "Encourage others to try the same approach"
                    ],
                    estimatedTime: 4
                },
                {
                    title: "Learning Path Planning",
                    description: "Plan your next learning steps based on your current needs.",
                    steps: [
                        "Identify one AI skill you want to improve",
                        "Find relevant content in the Learning Hub",
                        "Schedule 15 minutes this week to work on it",
                        "Set a reminder in your calendar",
                        "Tell a colleague about your learning goal"
                    ],
                    estimatedTime: 5
                },
                {
                    title: "Team AI Sharing",
                    description: "Share one AI tip or tool with your team to multiply the impact.",
                    steps: [
                        "Pick your favorite AI tool or technique",
                        "Write a quick how-to guide (3-4 steps)",
                        "Share it in your team channel or meeting",
                        "Offer to help someone try it",
                        "Ask for their feedback and results"
                    ],
                    estimatedTime: 6
                }
            ]
        };
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

    setupTipNavigation() {
        const container = document.getElementById('daily-tip-container');
        if (!container) return;

        const isHubPage = container.classList.contains('hub-page-tip');

        if (isHubPage) {
            this.setupHubPageNavigation(container);
        } else {
            this.setupModulePageNavigation(container);
        }
    }

    setupHubPageNavigation(container) {
        // Expand/collapse functionality
        const expandBtn = container.querySelector('.tip-expand-btn');
        const dismissBtn = container.querySelector('.tip-dismiss-btn');
        const expandedContent = container.querySelector('.tip-expanded-content');

        if (expandBtn && expandedContent) {
            expandBtn.addEventListener('click', () => {
                const isExpanded = expandedContent.style.display !== 'none';
                if (isExpanded) {
                    expandedContent.style.display = 'none';
                    expandBtn.textContent = 'View Tip';
                } else {
                    expandedContent.style.display = 'block';
                    expandBtn.textContent = 'Hide Tip';
                }
            });
        }

        // Dismiss functionality
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.dismissTip();
            });
        }

        // Mark complete
        const completeBtn = container.querySelector('.tip-mark-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.markTipComplete();
            });
        }

        // Save for later
        const saveBtn = container.querySelector('.tip-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveTipForLater();
            });
        }
    }

    setupModulePageNavigation(container) {
        // Previous tip
        const prevBtn = container.querySelector('.tip-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.showPreviousTip();
            });
        }

        // Next tip
        const nextBtn = container.querySelector('.tip-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.showNextTip();
            });
        }

        // Close tip
        const closeBtn = container.querySelector('.tip-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.dismissTip();
            });
        }

        // Mark complete
        const completeBtn = container.querySelector('.tip-mark-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.markTipComplete();
            });
        }

        // Save for later
        const saveBtn = container.querySelector('.tip-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveTipForLater();
            });
        }
    }

    showPreviousTip() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tip = this.getTipForDate(yesterday.toDateString());
        this.renderTip(tip);
    }

    showNextTip() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tip = this.getTipForDate(tomorrow.toDateString());
        this.renderTip(tip);
    }

    markTipComplete() {
        const today = new Date().toDateString();
        this.userProgress[today] = {
            completed: true,
            completedAt: new Date().toISOString(),
            module: this.currentModule
        };
        this.saveUserProgress();
        this.updateStreak();
        this.showCompletionFeedback();
    }

    saveTipForLater() {
        const today = new Date().toDateString();
        const tip = this.getTipForDate(today);
        
        let savedTips = JSON.parse(localStorage.getItem('savedTips') || '[]');
        savedTips.push({
            ...tip,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem('savedTips', JSON.stringify(savedTips));
        
        this.showSaveConfirmation();
    }

    updateStreak() {
        const streak = this.calculateStreak();
        const streakElement = document.querySelector('.streak-count');
        if (streakElement) {
            streakElement.textContent = streak;
        }
    }

    calculateStreak() {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            if (this.userProgress[dateString]?.completed) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    dismissTip() {
        const container = document.getElementById('daily-tip-container');
        if (container) {
            container.style.display = 'none';
            localStorage.setItem('tipDismissedToday', new Date().toDateString());
        }
    }

    showCompletionFeedback() {
        const button = document.querySelector('.tip-mark-complete');
        const originalText = button.textContent;
        button.textContent = '✓ Completed!';
        button.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    }

    showSaveConfirmation() {
        const button = document.querySelector('.tip-save');
        const originalText = button.textContent;
        button.textContent = '✓ Saved!';
        
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }

    loadUserProgress() {
        return JSON.parse(localStorage.getItem('dailyTipsProgress') || '{}');
    }

    saveUserProgress() {
        localStorage.setItem('dailyTipsProgress', JSON.stringify(this.userProgress));
    }

    loadTipHistory() {
        return JSON.parse(localStorage.getItem('tipHistory') || '[]');
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    trackEngagement() {
        // Track tip views, completions, and engagement
        const today = new Date().toDateString();
        let analytics = JSON.parse(localStorage.getItem('tipAnalytics') || '{}');
        
        if (!analytics[today]) {
            analytics[today] = {
                viewed: true,
                viewedAt: new Date().toISOString(),
                module: this.currentModule
            };
            localStorage.setItem('tipAnalytics', JSON.stringify(analytics));
        }
    }
}

// Initialize the daily tips system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if tips are enabled and not dismissed today
    const dismissedToday = localStorage.getItem('tipDismissedToday');
    const today = new Date().toDateString();
    
    if (dismissedToday !== today) {
        new DailyTipsSystem();
    }
});

