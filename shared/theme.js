/**
 * Global Theme Management System
 * Provides dark/light mode functionality across all pages
 */

class ThemeManager {
    constructor(options = {}) {
        this.currentTheme = 'light';
        this.elements = {
            toggle: document.getElementById('theme-toggle'),
            lightBtn: document.getElementById('light-theme-btn'),
            darkBtn: document.getElementById('dark-theme-btn'),
            body: document.body,
            html: document.documentElement
        };
        
        this.storageKey = options.storageKey || 'gbs-hub-theme-preference';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.callbacks = new Set();
        
        this.initialize();
        this.initializeEventListeners();
    }

    initialize() {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem(this.storageKey);
        let initialTheme;
        
        if (savedTheme) {
            initialTheme = savedTheme;
        } else {
            // Use system preference
            initialTheme = this.mediaQuery.matches ? 'dark' : 'light';
        }
        
        this.setTheme(initialTheme, false);
        
        // Listen for system theme changes
        this.mediaQuery.addListener((e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem(this.storageKey)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    initializeEventListeners() {
        // Toggle buttons
        if (this.elements.lightBtn) {
            this.elements.lightBtn.addEventListener('click', () => {
                this.setTheme('light', true);
            });
        }

        if (this.elements.darkBtn) {
            this.elements.darkBtn.addEventListener('click', () => {
                this.setTheme('dark', true);
            });
        }

        // Keyboard shortcut: Ctrl/Cmd + Shift + D
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    setTheme(theme, savePreference = true) {
        const previousTheme = this.currentTheme;
        this.currentTheme = theme;
        
        // Update HTML data attribute
        this.elements.html.setAttribute('data-theme', theme);
        
        // Update toggle component if it exists
        if (this.elements.toggle) {
            this.elements.toggle.setAttribute('data-theme', theme);
        }
        
        // Update button states
        if (this.elements.lightBtn && this.elements.darkBtn) {
            this.elements.lightBtn.classList.toggle('active', theme === 'light');
            this.elements.darkBtn.classList.toggle('active', theme === 'dark');
        }
        
        // Add transition class to all elements for smooth switching
        this.addTransitionClasses();
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Save preference if requested
        if (savePreference) {
            localStorage.setItem(this.storageKey, theme);
        }
        
        // Execute callbacks
        this.callbacks.forEach(callback => {
            try {
                callback(theme, previousTheme);
            } catch (error) {
                console.error('Theme callback error:', error);
            }
        });
        
        // Dispatch custom event for other components
        this.dispatchThemeChangeEvent(theme, previousTheme);
        
        // Track theme usage
        this.trackThemeUsage(theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme, true);
    }

    addTransitionClasses() {
        // Add transition class to common elements
        const elementsToTransition = [
            this.elements.body,
            ...document.querySelectorAll('.card'),
            ...document.querySelectorAll('.content-card'), 
            ...document.querySelectorAll('input'),
            ...document.querySelectorAll('textarea'),
            ...document.querySelectorAll('select'),
            ...document.querySelectorAll('nav'),
            ...document.querySelectorAll('.hub-card'),
            ...document.querySelectorAll('.search-input'),
            ...document.querySelectorAll('.search-results'),
            ...document.querySelectorAll('.whats-new-card')
        ];
        
        elementsToTransition.forEach(el => {
            if (el && !el.classList.contains('theme-transition')) {
                el.classList.add('theme-transition');
            }
        });
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#f8f9fa',
            dark: '#111827'
        };
        
        metaThemeColor.content = colors[theme];
    }

    dispatchThemeChangeEvent(theme, previousTheme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, previousTheme }
        });
        window.dispatchEvent(event);
    }

    trackThemeUsage(theme) {
        // Track theme preference for analytics
        const data = {
            theme: theme,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            systemPreference: this.mediaQuery.matches ? 'dark' : 'light',
            page: window.location.pathname
        };
        
        console.log('Theme Analytics:', data);
        // This could be sent to analytics service
    }

    // Public API methods
    getCurrentTheme() {
        return this.currentTheme;
    }

    resetToSystemPreference() {
        localStorage.removeItem(this.storageKey);
        const systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
        this.setTheme(systemTheme, false);
    }

    isSystemDark() {
        return this.mediaQuery.matches;
    }

    isDark() {
        return this.currentTheme === 'dark';
    }

    isLight() {
        return this.currentTheme === 'light';
    }

    // Callback system for components that need to respond to theme changes
    onThemeChange(callback) {
        this.callbacks.add(callback);
        // Call immediately with current theme
        callback(this.currentTheme, null);
    }

    offThemeChange(callback) {
        this.callbacks.delete(callback);
    }

    // Utility method to create theme toggle HTML
    static createToggleHTML() {
        return `
            <div id="theme-toggle" class="theme-toggle" data-theme="light">
                <button id="light-theme-btn" class="theme-toggle-button active">
                    <span class="theme-toggle-icon">☀️</span>
                    <span class="hidden sm:inline">Light</span>
                </button>
                <button id="dark-theme-btn" class="theme-toggle-button">
                    <span class="theme-toggle-icon">🌙</span>
                    <span class="hidden sm:inline">Dark</span>
                </button>
            </div>
        `;
    }

    // Method to inject toggle if it doesn't exist
    injectToggle() {
        if (!document.getElementById('theme-toggle')) {
            const toggleHTML = ThemeManager.createToggleHTML();
            document.body.insertAdjacentHTML('afterbegin', toggleHTML);
            
            // Re-initialize elements
            this.elements.toggle = document.getElementById('theme-toggle');
            this.elements.lightBtn = document.getElementById('light-theme-btn');
            this.elements.darkBtn = document.getElementById('dark-theme-btn');
            
            // Re-initialize event listeners for new elements
            this.initializeEventListeners();
            
            // Update button states
            this.elements.lightBtn.classList.toggle('active', this.currentTheme === 'light');
            this.elements.darkBtn.classList.toggle('active', this.currentTheme === 'dark');
            this.elements.toggle.setAttribute('data-theme', this.currentTheme);
        }
    }
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.themeManager) {
            window.themeManager = new ThemeManager();
        }
    });
} else {
    if (!window.themeManager) {
        window.themeManager = new ThemeManager();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function() {
        return ThemeManager;
    });
}