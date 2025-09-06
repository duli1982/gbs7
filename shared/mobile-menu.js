// Mobile Hamburger Menu Component
class MobileMenu {
    constructor() {
        this.isOpen = false;
        this.menuButton = null;
        this.mobileMenu = null;
        this.overlay = null;
        
        // Navigation data structure
        this.navigationData = {
            main: [
                {
                    id: 'rpo-training',
                    title: 'RPO AI Acceleration Program',
                    icon: '🎯',
                    url: '/rpo-training/',
                    description: 'Complete multi-phase training curriculum',
                    category: 'Training'
                },
                {
                    id: 'gbs-ai-workshop',
                    title: 'Guide for GBS Leaders',
                    icon: '👥',
                    url: '/gbs-ai-workshop/',
                    description: 'Interactive training for GBS leaders',
                    category: 'Training'
                },
                {
                    id: 'daily-focus',
                    title: 'Daily Sourcing Focus',
                    icon: '📅',
                    url: '/daily-focus/',
                    description: 'Daily micro-coaching tool',
                    category: 'Tools'
                },
                {
                    id: 'gbs-prompts',
                    title: 'GBS AI Prompts Library',
                    icon: '💡',
                    url: '/gbs-prompts/',
                    description: 'Comprehensive prompts library',
                    category: 'Tools'
                },
                {
                    id: 'knowledge-content',
                    title: 'Knowledge Content',
                    icon: '📚',
                    url: '/knowledge-content/',
                    description: 'Wealth of knowledge resources',
                    category: 'Resources'
                },
                {
                    id: 'ai-sme',
                    title: 'AI SME',
                    icon: '🧠',
                    url: '/ai-sme/',
                    description: 'Expert AI knowledge',
                    category: 'Resources'
                },
                {
                    id: 'use-cases',
                    title: 'AI Success Stories',
                    icon: '📈',
                    url: '/use-cases/',
                    description: 'Real-world examples and case studies',
                    category: 'Resources'
                },
                {
                    id: 'sourcing-workshop',
                    title: 'Sourcing Workshop',
                    icon: '🔍',
                    url: '/sourcing-workshop/',
                    description: 'Advanced sourcing techniques (Coming Soon)',
                    category: 'Training'
                }
            ],
            secondary: [
                {
                    id: 'about-us',
                    title: 'About Us',
                    icon: 'ℹ️',
                    url: '/about-us/',
                    description: 'Learn about our mission'
                },
                {
                    id: 'feedback',
                    title: 'Feedback',
                    icon: '💬',
                    url: '/feedback/',
                    description: 'Share your thoughts'
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.createMobileMenuStructure();
        this.addEventListeners();
        this.updateActiveState();
    }

    createMobileMenuStructure() {
        // Create hamburger button
        this.menuButton = document.createElement('button');
        this.menuButton.id = 'mobile-menu-button';
        this.menuButton.className = 'mobile-menu-button';
        this.menuButton.setAttribute('aria-label', 'Toggle mobile menu');
        this.menuButton.setAttribute('aria-expanded', 'false');
        this.menuButton.innerHTML = `
            <div class="hamburger-lines">
                <span class="line line-1"></span>
                <span class="line line-2"></span>
                <span class="line line-3"></span>
            </div>
        `;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'mobile-menu-overlay';
        this.overlay.className = 'mobile-menu-overlay';

        // Create mobile menu
        this.mobileMenu = document.createElement('nav');
        this.mobileMenu.id = 'mobile-menu';
        this.mobileMenu.className = 'mobile-menu';
        this.mobileMenu.setAttribute('aria-label', 'Mobile navigation');
        
        // Build menu content
        this.buildMenuContent();

        // Insert elements into DOM
        this.insertIntoDOM();
    }

    buildMenuContent() {
        const currentPath = window.location.pathname;
        const isHomePage = currentPath === '/' || currentPath === '/index.html';
        
        let menuHTML = `
            <div class="mobile-menu-header">
                <div class="mobile-menu-logo">
                    <span class="mobile-menu-logo-icon">🏠</span>
                    <span class="mobile-menu-logo-text">GBS Learning Hub</span>
                </div>
                <button id="mobile-menu-close" class="mobile-menu-close" aria-label="Close menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="mobile-menu-content">
        `;

        // Add Home link if not on homepage
        if (!isHomePage) {
            menuHTML += `
                <div class="mobile-menu-section">
                    <a href="/" class="mobile-menu-item mobile-menu-home">
                        <span class="mobile-menu-icon">🏠</span>
                        <div class="mobile-menu-text">
                            <span class="mobile-menu-title">Learning Hub</span>
                            <span class="mobile-menu-description">Return to main hub</span>
                        </div>
                    </a>
                </div>
            `;
        }

        // Group main navigation by category
        const categories = ['Training', 'Tools', 'Resources'];
        
        categories.forEach(category => {
            const categoryItems = this.navigationData.main.filter(item => item.category === category);
            
            if (categoryItems.length > 0) {
                menuHTML += `
                    <div class="mobile-menu-section">
                        <div class="mobile-menu-category-header">${category}</div>
                        <div class="mobile-menu-category-items">
                `;
                
                categoryItems.forEach(item => {
                    const isActive = currentPath.includes(item.id);
                    menuHTML += `
                        <a href="${item.url}" class="mobile-menu-item ${isActive ? 'active' : ''}">
                            <span class="mobile-menu-icon">${item.icon}</span>
                            <div class="mobile-menu-text">
                                <span class="mobile-menu-title">${item.title}</span>
                                <span class="mobile-menu-description">${item.description}</span>
                            </div>
                        </a>
                    `;
                });
                
                menuHTML += `
                        </div>
                    </div>
                `;
            }
        });

        // Add secondary navigation
        if (this.navigationData.secondary.length > 0) {
            menuHTML += `
                <div class="mobile-menu-section mobile-menu-secondary">
                    <div class="mobile-menu-divider"></div>
            `;
            
            this.navigationData.secondary.forEach(item => {
                const isActive = currentPath.includes(item.id);
                menuHTML += `
                    <a href="${item.url}" class="mobile-menu-item mobile-menu-secondary-item ${isActive ? 'active' : ''}">
                        <span class="mobile-menu-icon">${item.icon}</span>
                        <div class="mobile-menu-text">
                            <span class="mobile-menu-title">${item.title}</span>
                            <span class="mobile-menu-description">${item.description}</span>
                        </div>
                    </a>
                `;
            });
            
            menuHTML += `
                </div>
            `;
        }

        menuHTML += `
            </div>
        `;

        this.mobileMenu.innerHTML = menuHTML;
    }

    insertIntoDOM() {
        // Find insertion point - prefer header, then body
        let insertionPoint = document.querySelector('header');
        
        if (insertionPoint) {
            // Insert hamburger button in header
            const headerContent = insertionPoint.querySelector('.flex, .container, div');
            if (headerContent) {
                // Add hamburger button to header
                this.menuButton.classList.add('header-hamburger');
                headerContent.insertBefore(this.menuButton, headerContent.firstChild);
            } else {
                insertionPoint.appendChild(this.menuButton);
            }
        } else {
            // Insert at top of page if no header
            this.menuButton.classList.add('fixed-hamburger');
            document.body.insertBefore(this.menuButton, document.body.firstChild);
        }

        // Insert overlay and menu at end of body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.mobileMenu);
    }

    addEventListeners() {
        // Hamburger button click
        this.menuButton.addEventListener('click', () => this.toggleMenu());

        // Close button click
        const closeButton = this.mobileMenu.querySelector('#mobile-menu-close');
        closeButton.addEventListener('click', () => this.closeMenu());

        // Overlay click
        this.overlay.addEventListener('click', () => this.closeMenu());

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Menu item clicks (for smooth closing)
        const menuItems = this.mobileMenu.querySelectorAll('.mobile-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                // Small delay to allow navigation to start
                setTimeout(() => this.closeMenu(), 150);
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });

        // Touch handling for better mobile experience
        let touchStartY = 0;
        this.mobileMenu.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.mobileMenu.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchY - touchStartY;
            
            // Prevent overscroll if at top and trying to scroll up
            if (deltaY > 0 && this.mobileMenu.scrollTop === 0) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        
        // Update ARIA
        this.menuButton.setAttribute('aria-expanded', 'true');
        
        // Add classes
        this.menuButton.classList.add('active');
        this.overlay.classList.add('active');
        this.mobileMenu.classList.add('active');
        document.body.classList.add('mobile-menu-open');
        
        // Focus management
        const firstMenuItem = this.mobileMenu.querySelector('.mobile-menu-item');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 300);
        }
        
        // Analytics tracking
        this.trackMenuEvent('open');
    }

    closeMenu() {
        this.isOpen = false;
        
        // Update ARIA
        this.menuButton.setAttribute('aria-expanded', 'false');
        
        // Remove classes
        this.menuButton.classList.remove('active');
        this.overlay.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        
        // Return focus to hamburger button
        this.menuButton.focus();
        
        // Analytics tracking
        this.trackMenuEvent('close');
    }

    updateActiveState() {
        const currentPath = window.location.pathname;
        const menuItems = this.mobileMenu.querySelectorAll('.mobile-menu-item');
        
        menuItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && currentPath.includes(href.replace('/', ''))) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    trackMenuEvent(action) {
        // Track menu usage for analytics
        console.log(`Mobile menu ${action}`, {
            timestamp: new Date().toISOString(),
            currentPath: window.location.pathname,
            userAgent: navigator.userAgent
        });
        
        // Could be connected to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mobile_menu_interaction', {
                event_category: 'navigation',
                event_label: action
            });
        }
    }

    // Public methods for external control
    forceClose() {
        if (this.isOpen) {
            this.closeMenu();
        }
    }

    refresh() {
        this.buildMenuContent();
        this.updateActiveState();
    }

    destroy() {
        // Clean up event listeners and DOM elements
        if (this.menuButton && this.menuButton.parentNode) {
            this.menuButton.parentNode.removeChild(this.menuButton);
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.mobileMenu && this.mobileMenu.parentNode) {
            this.mobileMenu.parentNode.removeChild(this.mobileMenu);
        }
        
        document.body.classList.remove('mobile-menu-open');
    }
}

// Auto-initialize mobile menu when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on mobile/tablet devices or small screens
    const initMobileMenu = () => {
        if (window.innerWidth <= 1024) { // Show on tablet and below
            if (!window.mobileMenu) {
                window.mobileMenu = new MobileMenu();
            }
        }
    };

    // Initialize immediately
    initMobileMenu();

    // Re-check on window resize
    window.addEventListener('resize', initMobileMenu);
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileMenu;
}