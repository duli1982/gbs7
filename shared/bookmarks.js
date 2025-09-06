// Content Bookmarking System
class BookmarkManager {
    constructor() {
        this.storageKey = 'gbs-bookmarks';
        this.bookmarks = this.loadBookmarks();
        this.observers = [];
        
        // Content type definitions
        this.contentTypes = {
            lesson: {
                icon: '📚',
                label: 'Lesson',
                color: '#4A90E2'
            },
            prompt: {
                icon: '💡',
                label: 'Prompt',
                color: '#10b981'
            },
            module: {
                icon: '🎯',
                label: 'Module', 
                color: '#f59e0b'
            },
            usecase: {
                icon: '📈',
                label: 'Use Case',
                color: '#8b5cf6'
            },
            tool: {
                icon: '🔧',
                label: 'Tool',
                color: '#ef4444'
            }
        };
        
        this.init();
    }

    init() {
        this.injectBookmarkButtons();
        this.setupEventListeners();
        this.updateAllBookmarkStates();
    }

    // Core bookmark operations
    addBookmark(item) {
        const bookmark = {
            id: item.id || this.generateId(item),
            title: item.title,
            description: item.description || '',
            url: item.url || window.location.href,
            type: item.type || 'lesson',
            category: item.category || 'General',
            dateAdded: new Date().toISOString(),
            source: item.source || this.getPageTitle(),
            tags: item.tags || [],
            metadata: item.metadata || {}
        };
        
        // Avoid duplicates
        if (!this.bookmarks.find(b => b.id === bookmark.id)) {
            this.bookmarks.unshift(bookmark);
            this.saveBookmarks();
            this.notifyObservers('added', bookmark);
            this.showNotification(`Added "${bookmark.title}" to bookmarks`, 'success');
            return true;
        }
        return false;
    }

    removeBookmark(id) {
        const index = this.bookmarks.findIndex(b => b.id === id);
        if (index !== -1) {
            const removed = this.bookmarks.splice(index, 1)[0];
            this.saveBookmarks();
            this.notifyObservers('removed', removed);
            this.showNotification(`Removed "${removed.title}" from bookmarks`, 'info');
            return true;
        }
        return false;
    }

    isBookmarked(id) {
        return this.bookmarks.some(b => b.id === id);
    }

    getBookmarks(filter = {}) {
        let filtered = [...this.bookmarks];
        
        if (filter.type) {
            filtered = filtered.filter(b => b.type === filter.type);
        }
        
        if (filter.category) {
            filtered = filtered.filter(b => b.category === filter.category);
        }
        
        if (filter.search) {
            const search = filter.search.toLowerCase();
            filtered = filtered.filter(b => 
                b.title.toLowerCase().includes(search) ||
                b.description.toLowerCase().includes(search) ||
                b.tags.some(tag => tag.toLowerCase().includes(search))
            );
        }
        
        return filtered;
    }

    // Local storage operations
    saveBookmarks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
            this.showNotification('Failed to save bookmark', 'error');
        }
    }

    loadBookmarks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
            return [];
        }
    }

    // UI generation and management
    injectBookmarkButtons() {
        // Auto-detect bookmarkable content and add buttons
        this.injectLessonBookmarks();
        this.injectPromptBookmarks();
        this.injectModuleBookmarks();
        this.injectUseCaseBookmarks();
    }

    injectLessonBookmarks() {
        // Training session pages
        const sessionTitles = document.querySelectorAll('h2, .session-title, .content-section h2');
        sessionTitles.forEach(title => {
            if (this.isSessionTitle(title.textContent)) {
                this.addBookmarkButton(title, {
                    type: 'lesson',
                    title: title.textContent.trim(),
                    description: this.getSessionDescription(title),
                    category: 'Training',
                    url: window.location.href
                });
            }
        });
    }

    injectPromptBookmarks() {
        // Prompt blocks in various pages
        const promptBlocks = document.querySelectorAll('.prompt-block, .prompt-box, .code-block');
        promptBlocks.forEach((block, index) => {
            const title = this.getPromptTitle(block, index);
            if (title) {
                this.addBookmarkButton(block, {
                    type: 'prompt',
                    title: title,
                    description: this.getPromptDescription(block),
                    category: 'Prompts',
                    url: window.location.href + '#prompt-' + index
                });
            }
        });
    }

    injectModuleBookmarks() {
        // Training modules
        const moduleCards = document.querySelectorAll('.module-card, .phase-section');
        moduleCards.forEach(card => {
            const title = card.querySelector('h3');
            if (title) {
                this.addBookmarkButton(title, {
                    type: 'module',
                    title: title.textContent.trim(),
                    description: this.getModuleDescription(card),
                    category: 'Training Modules',
                    url: window.location.href
                });
            }
        });
    }

    injectUseCaseBookmarks() {
        // Use case examples
        const useCases = document.querySelectorAll('.use-case, .case-study, .success-story');
        useCases.forEach(useCase => {
            const title = useCase.querySelector('h3, h4');
            if (title) {
                this.addBookmarkButton(title, {
                    type: 'usecase',
                    title: title.textContent.trim(),
                    description: this.getUseCaseDescription(useCase),
                    category: 'Success Stories',
                    url: window.location.href
                });
            }
        });
    }

    addBookmarkButton(element, bookmarkData) {
        // Skip if button already exists
        if (element.querySelector('.bookmark-btn')) return;

        const button = document.createElement('button');
        button.className = 'bookmark-btn';
        button.setAttribute('data-bookmark-id', bookmarkData.id || this.generateId(bookmarkData));
        button.setAttribute('title', 'Bookmark this content');
        
        const isBookmarked = this.isBookmarked(button.getAttribute('data-bookmark-id'));
        this.updateButtonState(button, isBookmarked);

        // Store bookmark data on button for easy access
        button.bookmarkData = bookmarkData;

        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleBookmark(button);
        });

        // Position and insert button
        this.positionBookmarkButton(element, button);
    }

    positionBookmarkButton(element, button) {
        const parent = element.closest('.content-section, .module-card, .prompt-block, .use-case') || element.parentElement;
        
        if (parent) {
            parent.style.position = 'relative';
            button.style.position = 'absolute';
            button.style.top = '12px';
            button.style.right = '12px';
            button.style.zIndex = '10';
            parent.appendChild(button);
        } else {
            // Fallback: insert after element
            element.parentNode.insertBefore(button, element.nextSibling);
        }
    }

    toggleBookmark(button) {
        const id = button.getAttribute('data-bookmark-id');
        const isCurrentlyBookmarked = this.isBookmarked(id);
        
        if (isCurrentlyBookmarked) {
            this.removeBookmark(id);
        } else {
            this.addBookmark(button.bookmarkData);
        }
        
        this.updateButtonState(button, !isCurrentlyBookmarked);
    }

    updateButtonState(button, isBookmarked) {
        button.className = `bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`;
        button.innerHTML = isBookmarked 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"/></svg>'
            : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"/></svg>';
    }

    updateAllBookmarkStates() {
        const buttons = document.querySelectorAll('.bookmark-btn');
        buttons.forEach(button => {
            const id = button.getAttribute('data-bookmark-id');
            const isBookmarked = this.isBookmarked(id);
            this.updateButtonState(button, isBookmarked);
        });
    }

    // Content detection helpers
    isSessionTitle(text) {
        return /Session \d+\.\d+|Module \d+|Lesson \d+|Chapter \d+/i.test(text);
    }

    getSessionDescription(titleElement) {
        const nextP = titleElement.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
            return nextP.textContent.trim().substring(0, 150) + '...';
        }
        return '';
    }

    getPromptTitle(block, index) {
        const prevHeading = this.findPreviousHeading(block);
        if (prevHeading) {
            return `Prompt: ${prevHeading.textContent.trim()}`;
        }
        return `Prompt #${index + 1}`;
    }

    getPromptDescription(block) {
        return block.textContent.trim().substring(0, 100) + '...';
    }

    getModuleDescription(card) {
        const desc = card.querySelector('p');
        return desc ? desc.textContent.trim().substring(0, 150) + '...' : '';
    }

    getUseCaseDescription(useCase) {
        const desc = useCase.querySelector('p');
        return desc ? desc.textContent.trim().substring(0, 150) + '...' : '';
    }

    findPreviousHeading(element) {
        let current = element.previousElementSibling;
        while (current) {
            if (/^H[1-6]$/.test(current.tagName)) {
                return current;
            }
            current = current.previousElementSibling;
        }
        return null;
    }

    // Utility functions
    generateId(item) {
        const text = (item.title || '').toLowerCase();
        const hash = text.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        return hash + '-' + Date.now();
    }

    getPageTitle() {
        return document.title || 'GBS Learning Hub';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `bookmark-notification ${type}`;
        notification.textContent = message;
        
        // Style and position
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        // Type-specific colors
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Observer pattern for UI updates
    addObserver(callback) {
        this.observers.push(callback);
    }

    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(action, bookmark) {
        this.observers.forEach(callback => {
            try {
                callback(action, bookmark, this.bookmarks.length);
            } catch (error) {
                console.error('Error in bookmark observer:', error);
            }
        });
    }

    // Event listeners
    setupEventListeners() {
        // Listen for dynamic content changes
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.injectBookmarkButtons();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
                e.preventDefault();
                this.showBookmarksModal();
            }
        });
    }

    // Export/Import functionality
    exportBookmarks() {
        const exportData = {
            bookmarks: this.bookmarks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gbs-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Bookmarks exported successfully', 'success');
    }

    importBookmarks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                const imported = importData.bookmarks || [];
                
                let addedCount = 0;
                imported.forEach(bookmark => {
                    if (!this.bookmarks.find(b => b.id === bookmark.id)) {
                        this.bookmarks.push(bookmark);
                        addedCount++;
                    }
                });
                
                if (addedCount > 0) {
                    this.saveBookmarks();
                    this.updateAllBookmarkStates();
                    this.showNotification(`Imported ${addedCount} new bookmarks`, 'success');
                } else {
                    this.showNotification('No new bookmarks to import', 'info');
                }
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Failed to import bookmarks', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Quick bookmark modal (implemented separately)
    showBookmarksModal() {
        if (window.bookmarksModal) {
            window.bookmarksModal.show();
        }
    }

    // Analytics and stats
    getStats() {
        const stats = {
            total: this.bookmarks.length,
            byType: {},
            byCategory: {},
            recentlyAdded: this.bookmarks.filter(b => {
                const added = new Date(b.dateAdded);
                const week = new Date();
                week.setDate(week.getDate() - 7);
                return added > week;
            }).length
        };

        this.bookmarks.forEach(bookmark => {
            stats.byType[bookmark.type] = (stats.byType[bookmark.type] || 0) + 1;
            stats.byCategory[bookmark.category] = (stats.byCategory[bookmark.category] || 0) + 1;
        });

        return stats;
    }

    // Public API methods
    clear() {
        this.bookmarks = [];
        this.saveBookmarks();
        this.updateAllBookmarkStates();
        this.notifyObservers('cleared', null);
        this.showNotification('All bookmarks cleared', 'info');
    }

    search(query) {
        return this.getBookmarks({ search: query });
    }

    getByType(type) {
        return this.getBookmarks({ type });
    }

    getByCategory(category) {
        return this.getBookmarks({ category });
    }
}

// Auto-initialize bookmark manager
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all content is loaded
    setTimeout(() => {
        window.bookmarkManager = new BookmarkManager();
        
        // Add bookmark count to mobile menu if available
        if (window.mobileMenu && window.bookmarkManager) {
            const count = window.bookmarkManager.bookmarks.length;
            if (count > 0) {
                console.log(`📚 ${count} bookmarks loaded`);
            }
        }
    }, 1000);
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarkManager;
}