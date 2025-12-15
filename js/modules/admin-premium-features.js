/**
 * Admin Premium Features Module
 * Advanced features: Auto-complete, Drag & Drop, Print, Advanced Charts, etc.
 */

const AdminPremiumFeatures = {
    /**
     * Initialize all premium features
     */
    init() {
        this.initAutoComplete();
        this.initDragAndDrop();
        this.initPrintFeatures();
        this.initAdvancedCharts();
        this.initDataValidation();
        this.initAutoBackup();
        this.initQuickEdit();
        this.initBatchImport();
        this.initAdvancedSearch();
        this.initDataComparison();
        console.log('Admin Premium Features initialized');
    },

    // ============================================
    // AUTO-COMPLETE
    // ============================================

    initAutoComplete() {
        // Auto-complete for client names in project forms
        this.setupAutoComplete('clientInput', () => {
            return AdminCRUD.getClients().map(c => c.name);
        });

        // Auto-complete for team member names
        this.setupAutoComplete('teamMemberInput', () => {
            return AdminCRUD.getTeamMembers().map(t => t.name);
        });
    },

    setupAutoComplete(inputId, dataSource) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            if (value.length < 2) return;

            const suggestions = dataSource().filter(item => 
                item.toLowerCase().includes(value)
            );

            this.showAutoCompleteSuggestions(input, suggestions);
        });
    },

    showAutoCompleteSuggestions(input, suggestions) {
        // Remove existing suggestions
        const existing = document.querySelector('.autocomplete-suggestions');
        if (existing) existing.remove();

        if (suggestions.length === 0) return;

        const div = document.createElement('div');
        div.className = 'autocomplete-suggestions';
        div.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
        `;

        suggestions.slice(0, 5).forEach(suggestion => {
            const item = document.createElement('div');
            item.textContent = suggestion;
            item.style.cssText = 'padding: 8px 12px; cursor: pointer;';
            item.onmouseover = () => item.style.background = '#f0f0f0';
            item.onmouseout = () => item.style.background = 'white';
            item.onclick = () => {
                input.value = suggestion;
                div.remove();
            };
            div.appendChild(item);
        });

        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(div);
    },

    // ============================================
    // DRAG & DROP
    // ============================================

    initDragAndDrop() {
        // Enable drag and drop for reordering items
        this.enableDragAndDrop('.sortable-list');
    },

    enableDragAndDrop(selector) {
        const lists = document.querySelectorAll(selector);
        lists.forEach(list => {
            list.addEventListener('dragstart', this.handleDragStart.bind(this));
            list.addEventListener('dragover', this.handleDragOver.bind(this));
            list.addEventListener('drop', this.handleDrop.bind(this));
        });
    },

    handleDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        e.target.style.opacity = '0.4';
    },

    handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    },

    handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        // Handle drop logic here
        return false;
    },

    // ============================================
    // PRINT FEATURES
    // ============================================

    initPrintFeatures() {
        // Add print functionality
    },

    printSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<link rel="stylesheet" href="css/bootstrap.min.css">');
        printWindow.document.write('<style>@media print { body { margin: 20px; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(section.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    },

    printReport(type) {
        let data = [];
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

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                <p>Total Records: ${data.length}</p>
                <button onclick="window.print()">Print</button>
                <table>
                    <thead><tr>${Object.keys(data[0] || {}).map(k => `<th>${k}</th>`).join('')}</tr></thead>
                    <tbody>${data.map(item => `<tr>${Object.values(item).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // ============================================
    // ADVANCED CHARTS
    // ============================================

    initAdvancedCharts() {
        // Initialize advanced chart features
        this.chartColors = {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8'
        };
    },

    createPieChart(canvasId, data, labels) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: Object.values(this.chartColors)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    createBarChart(canvasId, data, labels) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Count',
                    data: data,
                    backgroundColor: this.chartColors.primary
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    // ============================================
    // DATA VALIDATION
    // ============================================

    initDataValidation() {
        // Add validation rules
        this.validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            url: /^https?:\/\/.+/,
            number: /^\d+$/,
            currency: /^\d+(\.\d{1,2})?$/
        };
    },

    validateField(value, type) {
        if (!value) return { valid: false, message: 'Field is required' };

        const rule = this.validationRules[type];
        if (!rule) return { valid: true };

        const valid = rule.test(value);
        return {
            valid,
            message: valid ? '' : `Invalid ${type} format`
        };
    },

    validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            const result = this.validateField(value, rule);
            
            if (!result.valid) {
                errors[field] = result.message;
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    },

    // ============================================
    // AUTO-BACKUP
    // ============================================

    initAutoBackup() {
        // Auto-backup every 30 minutes
        setInterval(() => {
            this.performAutoBackup();
        }, 30 * 60 * 1000);
    },

    performAutoBackup() {
        try {
            const backup = AdminAdvancedCRUD.backupAllData();
            localStorage.setItem('admin_auto_backup', JSON.stringify(backup));
            localStorage.setItem('admin_auto_backup_time', new Date().toISOString());
            console.log('Auto-backup completed');
        } catch (error) {
            console.error('Auto-backup failed:', error);
        }
    },

    restoreAutoBackup() {
        const backup = localStorage.getItem('admin_auto_backup');
        const backupTime = localStorage.getItem('admin_auto_backup_time');
        
        if (!backup) {
            alert('No auto-backup found');
            return false;
        }

        if (confirm(`Restore backup from ${new Date(backupTime).toLocaleString()}?`)) {
            try {
                const data = JSON.parse(backup);
                AdminAdvancedCRUD.restoreFromBackup(data);
                return true;
            } catch (error) {
                alert('Failed to restore backup: ' + error.message);
                return false;
            }
        }
        return false;
    },

    // ============================================
    // QUICK EDIT
    // ============================================

    initQuickEdit() {
        // Enable inline editing
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('editable')) {
                this.enableInlineEdit(e.target);
            }
        });
    },

    enableInlineEdit(element) {
        const originalValue = element.textContent;
        const input = document.createElement('input');
        input.value = originalValue;
        input.style.cssText = element.style.cssText;
        
        input.onblur = () => {
            element.textContent = input.value;
            element.style.display = '';
            input.remove();
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') {
                element.textContent = originalValue;
                element.style.display = '';
                input.remove();
            }
        };
        
        element.style.display = 'none';
        element.parentElement.insertBefore(input, element);
        input.focus();
    },

    // ============================================
    // BATCH IMPORT
    // ============================================

    initBatchImport() {
        // Setup batch import functionality
    },

    importFromCSV(file, type) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(v => v.trim());
                const obj = {};
                
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                
                data.push(obj);
            }

            this.processBatchImport(data, type);
        };

        reader.readAsText(file);
    },

    processBatchImport(data, type) {
        let imported = 0;
        let failed = 0;

        data.forEach(item => {
            try {
                switch(type) {
                    case 'projects':
                        AdminCRUD.addProject(item);
                        break;
                    case 'clients':
                        AdminCRUD.addClient(item);
                        break;
                    case 'quotes':
                        AdminCRUD.addQuote(item);
                        break;
                }
                imported++;
            } catch (error) {
                failed++;
                console.error('Import failed for item:', item, error);
            }
        });

        alert(`Import complete!\nImported: ${imported}\nFailed: ${failed}`);
    },

    // ============================================
    // ADVANCED SEARCH
    // ============================================

    initAdvancedSearch() {
        // Setup advanced search with multiple criteria
    },

    advancedSearch(type, criteria) {
        let items = [];
        
        switch(type) {
            case 'projects':
                items = AdminCRUD.getProjects();
                break;
            case 'clients':
                items = AdminCRUD.getClients();
                break;
            case 'quotes':
                items = AdminCRUD.getQuotes();
                break;
        }

        return items.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                if (!value) return true;
                
                const itemValue = String(item[key] || '').toLowerCase();
                const searchValue = String(value).toLowerCase();
                
                return itemValue.includes(searchValue);
            });
        });
    },

    // ============================================
    // DATA COMPARISON
    // ============================================

    initDataComparison() {
        // Setup data comparison features
    },

    compareData(type, id1, id2) {
        let item1, item2;

        switch(type) {
            case 'projects':
                item1 = AdminCRUD.getProject(id1);
                item2 = AdminCRUD.getProject(id2);
                break;
            case 'clients':
                item1 = AdminCRUD.getClient(id1);
                item2 = AdminCRUD.getClient(id2);
                break;
        }

        if (!item1 || !item2) return null;

        const differences = {};
        const allKeys = new Set([...Object.keys(item1), ...Object.keys(item2)]);

        allKeys.forEach(key => {
            if (item1[key] !== item2[key]) {
                differences[key] = {
                    item1: item1[key],
                    item2: item2[key]
                };
            }
        });

        return differences;
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    generateUniqueId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    formatCurrency(amount, currency = 'ETB') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'ETB' ? 'USD' : currency
        }).format(amount).replace('$', currency + ' ');
    },

    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString();
        } else if (format === 'long') {
            return d.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } else if (format === 'time') {
            return d.toLocaleString();
        }
        
        return d.toISOString();
    },

    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    },

    generateReport(type, format = 'summary') {
        const data = {
            projects: AdminCRUD.getProjects(),
            clients: AdminCRUD.getClients(),
            quotes: AdminCRUD.getQuotes(),
            invoices: AdminCRUD.getInvoices()
        };

        const report = {
            generated: new Date().toISOString(),
            type: type,
            format: format,
            data: data[type] || [],
            summary: this.generateSummary(type, data[type] || [])
        };

        return report;
    },

    generateSummary(type, data) {
        const summary = {
            total: data.length,
            active: 0,
            completed: 0,
            pending: 0
        };

        data.forEach(item => {
            const status = (item.status || '').toLowerCase();
            if (status.includes('active')) summary.active++;
            if (status.includes('completed')) summary.completed++;
            if (status.includes('pending')) summary.pending++;
        });

        return summary;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPremiumFeatures;
}

if (typeof window !== 'undefined') {
    window.AdminPremiumFeatures = AdminPremiumFeatures;
}

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-dashboard')) {
            setTimeout(() => {
                AdminPremiumFeatures.init();
            }, 800);
        }
    });
}
