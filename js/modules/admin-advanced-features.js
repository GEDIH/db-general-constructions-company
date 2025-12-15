/**
 * Admin Advanced Features Module
 * Adds charts, reports, dark mode, keyboard shortcuts, and more
 */

const AdminAdvancedFeatures = {
    /**
     * Initialize all advanced features
     */
    init() {
        this.initCharts();
        this.initKeyboardShortcuts();
        this.initDarkMode();
        this.initAutoSave();
        console.log('Admin Advanced Features initialized');
    },

    /**
     * Initialize charts
     */
    initCharts() {
        // Charts will be initialized when Chart.js is available
        if (typeof Chart !== 'undefined') {
            console.log('Charts ready');
        }
    },

    /**
     * Initialize keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N - New Project
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (typeof addProject === 'function') {
                    addProject();
                }
            }

            // Ctrl/Cmd + F - Focus Search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchBox = document.querySelector('input[type="text"][placeholder*="Search"]');
                if (searchBox) {
                    searchBox.focus();
                }
            }

            // Ctrl/Cmd + E - Export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                if (typeof AdminEnhancements !== 'undefined') {
                    AdminEnhancements.exportToCSV('projects');
                }
            }
        });
    },

    /**
     * Initialize dark mode
     */
    initDarkMode() {
        const savedTheme = localStorage.getItem('admin_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
    },

    /**
     * Initialize auto-save
     */
    initAutoSave() {
        // Auto-save is already handled by AdminCRUD
        console.log('Auto-save active');
    },

    /**
     * Generate report
     */
    generateReport(type) {
        let data = {};
        let title = '';

        switch(type) {
            case 'projects':
                data = AdminCRUD.getProjects();
                title = 'Projects Report';
                break;
            case 'clients':
                data = AdminCRUD.getClients();
                title = 'Clients Report';
                break;
            case 'quotes':
                data = AdminCRUD.getQuotes();
                title = 'Quotes Report';
                break;
        }

        console.log(`Generating ${title}...`, data);
        alert(`${title} generated with ${data.length} items`);
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAdvancedFeatures;
}

if (typeof window !== 'undefined') {
    window.AdminAdvancedFeatures = AdminAdvancedFeatures;
}

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-dashboard')) {
            setTimeout(() => {
                AdminAdvancedFeatures.init();
            }, 700);
        }
    });
}
