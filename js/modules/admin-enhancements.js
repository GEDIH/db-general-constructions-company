/**
 * Admin Dashboard Enhancements Module
 * Adds search, filter, export, bulk operations, and more
 */

const AdminEnhancements = {
    /**
     * Initialize all enhancements
     */
    init() {
        this.initSearch();
        this.initFilters();
        this.initBulkOperations();
        this.initExport();
        this.initSorting();
        this.initPagination();
    },

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================

    /**
     * Initialize search for all sections
     */
    initSearch() {
        // Projects search
        const projectSearch = document.getElementById('searchProjects');
        if (projectSearch) {
            projectSearch.addEventListener('input', (e) => {
                this.searchProjects(e.target.value);
            });
        }

        // Clients search
        const clientSearch = document.getElementById('searchClients');
        if (clientSearch) {
            clientSearch.addEventListener('input', (e) => {
                this.searchClients(e.target.value);
            });
        }

        // Quotes search
        const quoteSearch = document.getElementById('quoteSearchInput');
        if (quoteSearch) {
            quoteSearch.addEventListener('input', (e) => {
                this.searchQuotes(e.target.value);
            });
        }
    },

    /**
     * Search projects
     */
    searchProjects(query) {
        const projects = AdminCRUD.getProjects();
        const filtered = projects.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.client.toLowerCase().includes(query.toLowerCase()) ||
            p.location.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredProjects(filtered);
    },

    /**
     * Search clients
     */
    searchClients(query) {
        const clients = AdminCRUD.getClients();
        const filtered = clients.filter(c => 
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.email.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query)
        );
        this.renderFilteredClients(filtered);
    },

    /**
     * Search quotes
     */
    searchQuotes(query) {
        const quotes = AdminCRUD.getQuotes();
        const filtered = quotes.filter(q => 
            q.name.toLowerCase().includes(query.toLowerCase()) ||
            q.email.toLowerCase().includes(query.toLowerCase()) ||
            q.projectType.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredQuotes(filtered);
    },

    // ============================================
    // FILTER FUNCTIONALITY
    // ============================================

    /**
     * Initialize filters
     */
    initFilters() {
        // Project status filter
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterProjectsByStatus(e.target.value);
            });
        }

        // Project type filter
        const typeFilter = document.getElementById('filterType');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterProjectsByType(e.target.value);
            });
        }

        // Quote status filters
        const quoteFilters = document.querySelectorAll('.quote-filter-btn');
        quoteFilters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                quoteFilters.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterQuotesByStatus(e.target.dataset.filter);
            });
        });
    },

    /**
     * Filter projects by status
     */
    filterProjectsByStatus(status) {
        const projects = AdminCRUD.getProjects();
        const filtered = status ? projects.filter(p => 
            p.status.toLowerCase() === status.toLowerCase()
        ) : projects;
        this.renderFilteredProjects(filtered);
    },

    /**
     * Filter projects by type
     */
    filterProjectsByType(type) {
        const projects = AdminCRUD.getProjects();
        const filtered = type ? projects.filter(p => 
            p.type.toLowerCase() === type.toLowerCase()
        ) : projects;
        this.renderFilteredProjects(filtered);
    },

    /**
     * Filter quotes by status
     */
    filterQuotesByStatus(status) {
        const quotes = AdminCRUD.getQuotes();
        const filtered = status === 'all' ? quotes : quotes.filter(q => 
            q.status.toLowerCase() === status.toLowerCase()
        );
        this.renderFilteredQuotes(filtered);
    },

    // ============================================
    // BULK OPERATIONS
    // ============================================

    /**
     * Initialize bulk operations
     */
    initBulkOperations() {
        this.selectedItems = {
            projects: [],
            clients: [],
            quotes: [],
            invoices: []
        };
    },

    /**
     * Toggle item selection
     */
    toggleSelection(type, id) {
        const index = this.selectedItems[type].indexOf(id);
        if (index > -1) {
            this.selectedItems[type].splice(index, 1);
        } else {
            this.selectedItems[type].push(id);
        }
        this.updateBulkActionsUI(type);
    },

    /**
     * Select all items
     */
    selectAll(type) {
        let items = [];
        switch(type) {
            case 'projects': items = AdminCRUD.getProjects(); break;
            case 'clients': items = AdminCRUD.getClients(); break;
            case 'quotes': items = AdminCRUD.getQuotes(); break;
        }
        this.selectedItems[type] = items.map(item => item.id);
        this.updateBulkActionsUI(type);
    },

    /**
     * Deselect all items
     */
    deselectAll(type) {
        this.selectedItems[type] = [];
        this.updateBulkActionsUI(type);
    },

    /**
     * Bulk delete
     */
    bulkDelete(type) {
        const count = this.selectedItems[type].length;
        if (count === 0) {
            alert('No items selected');
            return;
        }

        if (!confirm(`Delete ${count} selected items?`)) return;

        this.selectedItems[type].forEach(id => {
            switch(type) {
                case 'projects': AdminCRUD.deleteProject(id); break;
                case 'clients': AdminCRUD.deleteClient(id); break;
                case 'quotes': AdminCRUD.deleteQuote(id); break;
            }
        });

        this.selectedItems[type] = [];
        this.refreshSection(type);
        alert(`✅ ${count} items deleted successfully!`);
    },

    /**
     * Bulk status update
     */
    bulkUpdateStatus(type, newStatus) {
        const count = this.selectedItems[type].length;
        if (count === 0) {
            alert('No items selected');
            return;
        }

        this.selectedItems[type].forEach(id => {
            switch(type) {
                case 'projects': 
                    AdminCRUD.updateProject(id, { status: newStatus }); 
                    break;
                case 'quotes': 
                    AdminCRUD.updateQuote(id, { status: newStatus }); 
                    break;
            }
        });

        this.selectedItems[type] = [];
        this.refreshSection(type);
        alert(`✅ ${count} items updated to ${newStatus}!`);
    },

    /**
     * Update bulk actions UI
     */
    updateBulkActionsUI(type) {
        const count = this.selectedItems[type].length;
        const bulkBar = document.getElementById(`${type}BulkBar`);
        if (bulkBar) {
            bulkBar.style.display = count > 0 ? 'block' : 'none';
            const countSpan = bulkBar.querySelector('.selected-count');
            if (countSpan) countSpan.textContent = count;
        }
    },

    // ============================================
    // EXPORT FUNCTIONALITY
    // ============================================

    /**
     * Initialize export
     */
    initExport() {
        // Export buttons will be added to UI
    },

    /**
     * Export to CSV
     */
    exportToCSV(type) {
        let data = [];
        let filename = '';
        let headers = [];

        switch(type) {
            case 'projects':
                data = AdminCRUD.getProjects();
                filename = 'projects';
                headers = ['ID', 'Name', 'Client', 'Type', 'Location', 'Budget', 'Status', 'Progress', 'Start Date'];
                break;
            case 'clients':
                data = AdminCRUD.getClients();
                filename = 'clients';
                headers = ['ID', 'Name', 'Email', 'Phone', 'Type', 'Projects', 'Value', 'Status'];
                break;
            case 'quotes':
                data = AdminCRUD.getQuotes();
                filename = 'quotes';
                headers = ['ID', 'Name', 'Email', 'Phone', 'Project Type', 'Budget', 'Date', 'Status'];
                break;
            case 'invoices':
                data = AdminCRUD.getInvoices();
                filename = 'invoices';
                headers = ['ID', 'Client', 'Project', 'Amount', 'Date', 'Due Date', 'Status'];
                break;
        }

        const csv = this.convertToCSV(data, headers);
        this.downloadCSV(csv, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    },

    /**
     * Convert data to CSV
     */
    convertToCSV(data, headers) {
        const rows = [headers.join(',')];
        
        data.forEach(item => {
            const values = Object.values(item).map(val => {
                // Escape commas and quotes
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            });
            rows.push(values.join(','));
        });

        return rows.join('\n');
    },

    /**
     * Download CSV file
     */
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Export to Excel (XLSX)
     */
    exportToExcel(type) {
        // For now, export as CSV (can be enhanced with a library like SheetJS)
        this.exportToCSV(type);
        alert('Exported as CSV. For Excel format, you can open the CSV file in Excel.');
    },

    /**
     * Export to PDF
     */
    exportToPDF(type) {
        alert('PDF export requires a PDF library. For now, use Print to PDF from your browser.');
        window.print();
    },

    // ============================================
    // SORTING FUNCTIONALITY
    // ============================================

    /**
     * Initialize sorting
     */
    initSorting() {
        this.sortConfig = {
            projects: { column: 'name', direction: 'asc' },
            clients: { column: 'name', direction: 'asc' },
            quotes: { column: 'date', direction: 'desc' }
        };
    },

    /**
     * Sort data
     */
    sortData(type, column) {
        const config = this.sortConfig[type];
        
        // Toggle direction if same column
        if (config.column === column) {
            config.direction = config.direction === 'asc' ? 'desc' : 'asc';
        } else {
            config.column = column;
            config.direction = 'asc';
        }

        this.refreshSection(type);
    },

    /**
     * Apply sorting to data
     */
    applySorting(data, type) {
        const config = this.sortConfig[type];
        if (!config) return data;

        return [...data].sort((a, b) => {
            let aVal = a[config.column];
            let bVal = b[config.column];

            // Handle numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return config.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Handle strings
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();

            if (config.direction === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    },

    // ============================================
    // PAGINATION
    // ============================================

    /**
     * Initialize pagination
     */
    initPagination() {
        this.pagination = {
            projects: { page: 1, perPage: 10 },
            clients: { page: 1, perPage: 10 },
            quotes: { page: 1, perPage: 10 }
        };
    },

    /**
     * Paginate data
     */
    paginateData(data, type) {
        const config = this.pagination[type];
        if (!config) return data;

        const start = (config.page - 1) * config.perPage;
        const end = start + config.perPage;
        return data.slice(start, end);
    },

    /**
     * Change page
     */
    changePage(type, page) {
        this.pagination[type].page = page;
        this.refreshSection(type);
    },

    /**
     * Get total pages
     */
    getTotalPages(type, totalItems) {
        const config = this.pagination[type];
        return Math.ceil(totalItems / config.perPage);
    },

    // ============================================
    // STATISTICS & ANALYTICS
    // ============================================

    /**
     * Calculate project statistics
     */
    getProjectStats() {
        const projects = AdminCRUD.getProjects();
        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'Active').length,
            completed: projects.filter(p => p.status === 'Completed').length,
            planning: projects.filter(p => p.status === 'Planning').length,
            avgProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0
        };
    },

    /**
     * Calculate client statistics
     */
    getClientStats() {
        const clients = AdminCRUD.getClients();
        return {
            total: clients.length,
            corporate: clients.filter(c => c.type === 'Corporate').length,
            government: clients.filter(c => c.type === 'Government').length,
            individual: clients.filter(c => c.type === 'Individual').length
        };
    },

    /**
     * Calculate quote statistics
     */
    getQuoteStats() {
        const quotes = AdminCRUD.getQuotes();
        return {
            total: quotes.length,
            pending: quotes.filter(q => q.status === 'Pending').length,
            contacted: quotes.filter(q => q.status === 'Contacted').length,
            quoted: quotes.filter(q => q.status === 'Quoted').length,
            completed: quotes.filter(q => q.status === 'Completed').length,
            declined: quotes.filter(q => q.status === 'Declined').length
        };
    },

    // ============================================
    // RENDER HELPERS
    // ============================================

    /**
     * Render filtered projects
     */
    renderFilteredProjects(projects) {
        if (typeof renderProjects === 'function') {
            // Temporarily override the projects array
            const originalProjects = window.projects;
            window.projects = projects;
            renderProjects();
            window.projects = originalProjects;
        }
    },

    /**
     * Render filtered clients
     */
    renderFilteredClients(clients) {
        if (typeof renderClients === 'function') {
            const originalClients = window.clients;
            window.clients = clients;
            renderClients();
            window.clients = originalClients;
        }
    },

    /**
     * Render filtered quotes
     */
    renderFilteredQuotes(quotes) {
        if (typeof renderQuotes === 'function') {
            const originalQuotes = window.quotes;
            window.quotes = quotes;
            renderQuotes();
            window.quotes = originalQuotes;
        }
    },

    /**
     * Refresh section
     */
    refreshSection(type) {
        switch(type) {
            case 'projects':
                if (typeof renderProjects === 'function') {
                    window.projects = AdminCRUD.getProjects();
                    renderProjects();
                }
                break;
            case 'clients':
                if (typeof renderClients === 'function') {
                    window.clients = AdminCRUD.getClients();
                    renderClients();
                }
                break;
            case 'quotes':
                if (typeof renderQuotes === 'function') {
                    window.quotes = AdminCRUD.getQuotes();
                    renderQuotes();
                }
                break;
        }
    },

    // ============================================
    // NOTIFICATIONS
    // ============================================

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ============================================
    // QUICK ACTIONS
    // ============================================

    /**
     * Quick add project - Opens the project modal form
     * Updated to use modal forms instead of prompt()
     */
    quickAddProject() {
        // Use the modal form instead of prompt
        if (typeof openAddProjectModal === 'function') {
            openAddProjectModal();
        } else {
            console.error('openAddProjectModal function not found');
            this.showToast('Unable to open project form', 'error');
        }
    },

    /**
     * Quick add client - Opens the client modal form
     * Updated to use modal forms instead of prompt()
     */
    quickAddClient() {
        // Use the modal form instead of prompt
        // Note: Client modal may not be implemented yet
        // For now, show a message directing users to the clients section
        this.showToast('Please use the Clients section to add new clients', 'info');
        this.refreshSection('clients');
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminEnhancements;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AdminEnhancements = AdminEnhancements;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-dashboard')) {
            // Wait for AdminCRUD to be ready
            setTimeout(() => {
                AdminEnhancements.init();
            }, 500);
        }
    });
}
