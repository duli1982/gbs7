// Bookmarks Modal Component
class BookmarksModal {
    constructor(bookmarkManager) {
        this.bookmarkManager = bookmarkManager;
        this.modal = null;
        this.searchInput = null;
        this.filterSelect = null;
        this.bookmarksList = null;
        this.statsContainer = null;
        this.isVisible = false;
        
        this.currentFilter = {
            search: '',
            type: '',
            category: ''
        };
        
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
        this.addToMobileMenu();
        
        // Listen to bookmark manager changes
        this.bookmarkManager.addObserver((action, bookmark, totalCount) => {
            if (this.isVisible) {
                this.updateStats();
                this.renderBookmarks();
            }
        });
    }

    createModal() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.id = 'bookmarks-modal';
        this.modal.className = 'bookmarks-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-labelledby', 'bookmarks-modal-title');
        this.modal.setAttribute('aria-hidden', 'true');

        this.modal.innerHTML = `
            <div class="bookmarks-modal-content">
                <div class="bookmarks-modal-header">
                    <h2 id="bookmarks-modal-title" class="bookmarks-modal-title">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"/>
                        </svg>
                        My Bookmarks
                    </h2>
                    <button class="bookmarks-modal-close" aria-label="Close bookmarks">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    
                    <div class="bookmarks-controls">
                        <input 
                            type="text" 
                            class="bookmarks-search" 
                            placeholder="Search bookmarks..."
                            id="bookmarks-search-input"
                        >
                        
                        <select class="bookmarks-filter" id="bookmarks-type-filter">
                            <option value="">All Types</option>
                            <option value="lesson">📚 Lessons</option>
                            <option value="prompt">💡 Prompts</option>
                            <option value="module">🎯 Modules</option>
                            <option value="usecase">📈 Use Cases</option>
                            <option value="tool">🔧 Tools</option>
                        </select>
                        
                        <div class="bookmarks-actions">
                            <button class="bookmarks-action-btn" id="export-bookmarks-btn" title="Export bookmarks">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                </svg>
                                Export
                            </button>
                            
                            <button class="bookmarks-action-btn" id="import-bookmarks-btn" title="Import bookmarks">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                                </svg>
                                Import
                            </button>
                            
                            <button class="bookmarks-action-btn" id="clear-bookmarks-btn" title="Clear all bookmarks">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bookmarks-modal-body">
                    <div class="bookmarks-stats" id="bookmarks-stats">
                        <!-- Stats will be populated here -->
                    </div>
                    
                    <div class="bookmarks-list" id="bookmarks-list">
                        <!-- Bookmarks will be populated here -->
                    </div>
                </div>
            </div>
            
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
        `;

        document.body.appendChild(this.modal);

        // Cache elements
        this.searchInput = this.modal.querySelector('#bookmarks-search-input');
        this.filterSelect = this.modal.querySelector('#bookmarks-type-filter');
        this.bookmarksList = this.modal.querySelector('#bookmarks-list');
        this.statsContainer = this.modal.querySelector('#bookmarks-stats');
    }

    setupEventListeners() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.bookmarks-modal-close');
        closeBtn.addEventListener('click', () => this.hide());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Search and filter
        this.searchInput.addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.renderBookmarks();
        });

        this.filterSelect.addEventListener('change', (e) => {
            this.currentFilter.type = e.target.value;
            this.renderBookmarks();
        });

        // Action buttons
        const exportBtn = this.modal.querySelector('#export-bookmarks-btn');
        exportBtn.addEventListener('click', () => {
            this.bookmarkManager.exportBookmarks();
        });

        const importBtn = this.modal.querySelector('#import-bookmarks-btn');
        const fileInput = this.modal.querySelector('#import-file-input');
        
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.bookmarkManager.importBookmarks(file);
                e.target.value = ''; // Reset file input
            }
        });

        const clearBtn = this.modal.querySelector('#clear-bookmarks-btn');
        clearBtn.addEventListener('click', () => {
            this.confirmClearBookmarks();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isVisible) {
                if (e.key === 'Escape') {
                    this.hide();
                } else if (e.key === '/' || (e.ctrlKey && e.key === 'f')) {
                    e.preventDefault();
                    this.searchInput.focus();
                }
            }
        });
    }

    addToMobileMenu() {
        // Add bookmarks option to mobile menu if available
        if (window.mobileMenu) {
            // This would integrate with the mobile menu system
            // For now, we'll add a keyboard shortcut hint
            console.log('💡 Tip: Press Ctrl/Cmd + B to open bookmarks');
        }
    }

    show() {
        this.isVisible = true;
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Update content
        this.updateStats();
        this.renderBookmarks();
        
        // Focus management
        setTimeout(() => {
            this.searchInput.focus();
        }, 300);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.isVisible = false;
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Reset filters
        this.currentFilter = { search: '', type: '', category: '' };
        this.searchInput.value = '';
        this.filterSelect.value = '';
    }

    updateStats() {
        const stats = this.bookmarkManager.getStats();
        
        this.statsContainer.innerHTML = `
            <div class="bookmarks-stat">
                <span class="bookmarks-stat-number">${stats.total}</span>
                <span class="bookmarks-stat-label">Total</span>
            </div>
            <div class="bookmarks-stat">
                <span class="bookmarks-stat-number">${stats.byType.lesson || 0}</span>
                <span class="bookmarks-stat-label">Lessons</span>
            </div>
            <div class="bookmarks-stat">
                <span class="bookmarks-stat-number">${stats.byType.prompt || 0}</span>
                <span class="bookmarks-stat-label">Prompts</span>
            </div>
            <div class="bookmarks-stat">
                <span class="bookmarks-stat-number">${stats.byType.module || 0}</span>
                <span class="bookmarks-stat-label">Modules</span>
            </div>
            <div class="bookmarks-stat">
                <span class="bookmarks-stat-number">${stats.recentlyAdded}</span>
                <span class="bookmarks-stat-label">This Week</span>
            </div>
        `;
    }

    renderBookmarks() {
        const bookmarks = this.bookmarkManager.getBookmarks(this.currentFilter);
        
        if (bookmarks.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.bookmarksList.innerHTML = bookmarks.map(bookmark => this.createBookmarkElement(bookmark)).join('');
        
        // Add event listeners to bookmark items
        this.bookmarksList.querySelectorAll('.bookmark-item').forEach((item, index) => {
            const bookmark = bookmarks[index];
            
            // Click to navigate
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.bookmark-actions')) {
                    this.navigateToBookmark(bookmark);
                }
            });
            
            // Delete action
            const deleteBtn = item.querySelector('.bookmark-action.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.confirmDeleteBookmark(bookmark);
                });
            }
            
            // Copy URL action
            const copyBtn = item.querySelector('.bookmark-action.copy');
            if (copyBtn) {
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyBookmarkUrl(bookmark);
                });
            }
        });
    }

    createBookmarkElement(bookmark) {
        const contentType = this.bookmarkManager.contentTypes[bookmark.type];
        const typeIcon = contentType?.icon || '📄';
        const formattedDate = new Date(bookmark.dateAdded).toLocaleDateString();
        
        return `
            <div class="bookmark-item">
                <div class="bookmark-icon ${bookmark.type}">${typeIcon}</div>
                
                <div class="bookmark-content">
                    <h3 class="bookmark-title">${this.escapeHtml(bookmark.title)}</h3>
                    ${bookmark.description ? `<p class="bookmark-description">${this.escapeHtml(bookmark.description)}</p>` : ''}
                    
                    <div class="bookmark-meta">
                        <span class="bookmark-category">${bookmark.category}</span>
                        <span class="bookmark-date">${formattedDate}</span>
                        <span class="bookmark-source">${this.escapeHtml(bookmark.source)}</span>
                    </div>
                </div>
                
                <div class="bookmark-actions">
                    <button class="bookmark-action copy" title="Copy link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                    </button>
                    <button class="bookmark-action delete" title="Remove bookmark">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        const message = this.currentFilter.search || this.currentFilter.type 
            ? 'No bookmarks match your search criteria'
            : 'No bookmarks yet';
            
        const subMessage = this.currentFilter.search || this.currentFilter.type
            ? 'Try adjusting your search terms or filters'
            : 'Start bookmarking your favorite lessons and prompts!';

        this.bookmarksList.innerHTML = `
            <div class="bookmarks-empty">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z"/>
                </svg>
                <h3>${message}</h3>
                <p>${subMessage}</p>
            </div>
        `;
    }

    navigateToBookmark(bookmark) {
        // Close modal first
        this.hide();
        
        // Navigate with a small delay to ensure smooth transition
        setTimeout(() => {
            if (bookmark.url.startsWith('http') || bookmark.url.startsWith('/')) {
                window.location.href = bookmark.url;
            } else {
                // Handle relative URLs
                window.location.href = '/' + bookmark.url.replace(/^\/+/, '');
            }
        }, 150);
    }

    copyBookmarkUrl(bookmark) {
        const fullUrl = bookmark.url.startsWith('http') 
            ? bookmark.url 
            : window.location.origin + bookmark.url;
            
        navigator.clipboard.writeText(fullUrl).then(() => {
            this.showCopyConfirmation();
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyConfirmation();
        });
    }

    showCopyConfirmation() {
        // Temporarily change the copy button text
        const copyBtns = this.modal.querySelectorAll('.bookmark-action.copy');
        copyBtns.forEach(btn => {
            const originalTitle = btn.title;
            btn.title = 'Copied!';
            btn.style.color = '#10b981';
            
            setTimeout(() => {
                btn.title = originalTitle;
                btn.style.color = '';
            }, 2000);
        });
    }

    confirmDeleteBookmark(bookmark) {
        if (confirm(`Are you sure you want to remove "${bookmark.title}" from your bookmarks?`)) {
            this.bookmarkManager.removeBookmark(bookmark.id);
        }
    }

    confirmClearBookmarks() {
        const count = this.bookmarkManager.bookmarks.length;
        if (count === 0) {
            this.bookmarkManager.showNotification('No bookmarks to clear', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to remove all ${count} bookmarks? This cannot be undone.`)) {
            this.bookmarkManager.clear();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public methods
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    refreshData() {
        if (this.isVisible) {
            this.updateStats();
            this.renderBookmarks();
        }
    }
}

// Auto-initialize when bookmark manager is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for bookmark manager to be available
    const initModal = () => {
        if (window.bookmarkManager) {
            window.bookmarksModal = new BookmarksModal(window.bookmarkManager);
            console.log('📚 Bookmarks modal initialized');
        } else {
            setTimeout(initModal, 500);
        }
    };
    
    setTimeout(initModal, 1200);
});

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarksModal;
}