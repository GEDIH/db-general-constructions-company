/**
 * Enhanced Admin CRUD Module
 * Advanced features for all admin panels
 */

const AdminCRUDEnhanced = (function() {
    'use strict';

    // ============================================
    // ADVANCED FEATURES
    // ============================================

    /**
     * Bulk Operations
     */
    const bulkOperations = {
        // Bulk delete items
        bulkDelete: function(entityType, ids) {
            if (!confirm(`Are you sure you want to delete ${ids.length} items?`)) {
                return false;
            }

            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            items = items.filter(item => !ids.includes(item.id));
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            this.logAction('bulk_delete', entityType, { count: ids.length });
            return true;
        },

        // Bulk update status
        bulkUpdateStatus: function(entityType, ids, status) {
            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            items = items.map(item => {
                if (ids.includes(item.id)) {
                    item.status = status;
                    item.updatedAt = new Date().toISOString();
                }
                return item;
            });
            
            localStorage.setItem(storageKey, JSON.stringify(items));
            this.logAction('bulk_update_status', entityType, { count: ids.length, status });
            return true;
        },

        // Bulk export
        bulkExport: function(entityType, ids, format = 'json') {
            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const selectedItems = items.filter(item => ids.includes(item.id));
            
            if (format === 'json') {
                return this.exportToJSON(selectedItems, `${entityType}_bulk_export`);
            } else if (format === 'csv') {
                return this.exportToCSV(selectedItems, `${entityType}_bulk_export`);
            }
        },

        logAction: function(action, entity, data) {
            const log = {
                action,
                entity,
                data,
                timestamp: new Date().toISOString(),
                user: 'admin'
            };
            
            let logs = JSON.parse(localStorage.getItem('admin_action_logs') || '[]');
            logs.unshift(log);
            logs = logs.slice(0, 100); // Keep last 100 logs
            localStorage.setItem('admin_action_logs', JSON.stringify(logs));
        },

        exportToJSON: function(data, filename) {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        exportToCSV: function(data, filename) {
            if (data.length === 0) return;
            
            const headers = Object.keys(data[0]);
            const csv = [
                headers.join(','),
                ...data.map(row => headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    /**
     * Advanced Search & Filter
     */
    const searchFilter = {
        // Advanced search with multiple criteria
        advancedSearch: function(entityType, criteria) {
            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            return items.filter(item => {
                return Object.keys(criteria).every(key => {
                    const criteriaValue = criteria[key];
                    const itemValue = item[key];
                    
                    if (criteriaValue === null || criteriaValue === undefined || criteriaValue === '') {
                        return true;
                    }
                    
                    if (typeof criteriaValue === 'string') {
                        return String(itemValue).toLowerCase().includes(criteriaValue.toLowerCase());
                    }
                    
                    return itemValue === criteriaValue;
                });
            });
        },

        // Filter by date range
        filterByDateRange: function(entityType, startDate, endDate, dateField = 'createdAt') {
            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            return items.filter(item => {
                const itemDate = new Date(item[dateField]);
                return itemDate >= start && itemDate <= end;
            });
        },

        // Sort items
        sortItems: function(items, field, order = 'asc') {
            return items.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                
                if (order === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        },

        // Paginate items
        paginate: function(items, page = 1, perPage = 10) {
            const start = (page - 1) * perPage;
            const end = start + perPage;
            
            return {
                items: items.slice(start, end),
                total: items.length,
                page,
                perPage,
                totalPages: Math.ceil(items.length / perPage)
            };
        }
    };

    /**
     * Data Validation
     */
    const validation = {
        // Validate project data
        validateProject: function(data) {
            const errors = [];
            
            if (!data.name || data.name.trim() === '') {
                errors.push('Project name is required');
            }
            
            if (!data.client || data.client.trim() === '') {
                errors.push('Client name is required');
            }
            
            if (!data.status) {
                errors.push('Status is required');
            }
            
            if (data.budget && isNaN(parseFloat(data.budget))) {
                errors.push('Budget must be a valid number');
            }
            
            if (data.progress && (data.progress < 0 || data.progress > 100)) {
                errors.push('Progress must be between 0 and 100');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        },

        // Validate client data
        validateClient: function(data) {
            const errors = [];
            
            if (!data.name || data.name.trim() === '') {
                errors.push('Client name is required');
            }
            
            if (!data.email || !this.isValidEmail(data.email)) {
                errors.push('Valid email is required');
            }
            
            if (!data.phone || data.phone.trim() === '') {
                errors.push('Phone number is required');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        },

        // Validate email
        isValidEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        // Validate phone
        isValidPhone: function(phone) {
            const re = /^[\d\s\-\+\(\)]+$/;
            return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
        }
    };

    /**
     * Data Import/Export
     */
    const importExport = {
        // Import from JSON
        importFromJSON: function(entityType, jsonData) {
            try {
                const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
                
                if (!Array.isArray(data)) {
                    throw new Error('Data must be an array');
                }
                
                const storageKey = `admin_${entityType}`;
                let existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                // Add imported items with new IDs
                data.forEach(item => {
                    const newItem = {
                        ...item,
                        id: Date.now() + Math.random(),
                        importedAt: new Date().toISOString()
                    };
                    existingItems.push(newItem);
                });
                
                localStorage.setItem(storageKey, JSON.stringify(existingItems));
                
                return {
                    success: true,
                    count: data.length
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Export all data
        exportAll: function(entityType, format = 'json') {
            const storageKey = `admin_${entityType}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            if (format === 'json') {
                bulkOperations.exportToJSON(items, `${entityType}_full_export`);
            } else if (format === 'csv') {
                bulkOperations.exportToCSV(items, `${entityType}_full_export`);
            }
        }
    };

    /**
     * Statistics & Analytics
     */
    const analytics = {
        // Get entity statistics
        getStatistics: function(entityType) {
            const storageKey = `admin_${entityType}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const stats = {
                total: items.length,
                byStatus: {},
                recent: items.slice(0, 5),
                oldest: items.slice(-5)
            };
            
            // Count by status
            items.forEach(item => {
                const status = item.status || 'Unknown';
                stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            });
            
            return stats;
        },

        // Get trends
        getTrends: function(entityType, days = 30) {
            const storageKey = `admin_${entityType}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const recentItems = items.filter(item => {
                const itemDate = new Date(item.createdAt);
                return itemDate >= cutoffDate;
            });
            
            return {
                total: items.length,
                recent: recentItems.length,
                growth: items.length > 0 ? (recentItems.length / items.length * 100).toFixed(2) : 0
            };
        }
    };

    /**
     * Duplicate Detection
     */
    const duplicateDetection = {
        // Find duplicates
        findDuplicates: function(entityType, field) {
            const storageKey = `admin_${entityType}`;
            const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            const seen = {};
            const duplicates = [];
            
            items.forEach(item => {
                const value = item[field];
                if (seen[value]) {
                    duplicates.push(item);
                } else {
                    seen[value] = true;
                }
            });
            
            return duplicates;
        },

        // Merge duplicates
        mergeDuplicates: function(entityType, keepId, removeIds) {
            const storageKey = `admin_${entityType}`;
            let items = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            items = items.filter(item => !removeIds.includes(item.id));
            localStorage.setItem(storageKey, JSON.stringify(items));
            
            return true;
        }
    };

    /**
     * Backup & Restore
     */
    const backupRestore = {
        // Create backup
        createBackup: function() {
            const backup = {
                timestamp: new Date().toISOString(),
                data: {}
            };
            
            const entities = ['projects', 'clients', 'team_members', 'inquiries', 
                            'blog_posts', 'invoices', 'schedule_events', 'quotes'];
            
            entities.forEach(entity => {
                const storageKey = `admin_${entity}`;
                backup.data[entity] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            });
            
            const json = JSON.stringify(backup, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return true;
        },

        // Restore from backup
        restoreBackup: function(backupData) {
            try {
                const backup = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
                
                if (!backup.data) {
                    throw new Error('Invalid backup format');
                }
                
                Object.keys(backup.data).forEach(entity => {
                    const storageKey = `admin_${entity}`;
                    localStorage.setItem(storageKey, JSON.stringify(backup.data[entity]));
                });
                
                return {
                    success: true,
                    timestamp: backup.timestamp
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    };

    // Public API
    return {
        bulkOperations,
        searchFilter,
        validation,
        importExport,
        analytics,
        duplicateDetection,
        backupRestore
    };
})();

// Make available globally
window.AdminCRUDEnhanced = AdminCRUDEnhanced;
