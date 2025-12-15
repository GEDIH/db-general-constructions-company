/**
 * Advanced CRUD Operations for All Admin Panels
 * Extends AdminCRUD with more features
 */

const AdminAdvancedCRUD = {
    /**
     * Initialize advanced CRUD
     */
    init() {
        this.initDocuments();
        this.initAnalytics();
        this.initSettings();
        this.initNotifications();
    },

    // ============================================
    // DOCUMENTS CRUD
    // ============================================

    STORAGE_KEYS: {
        DOCUMENTS: 'db_admin_documents',
        ANALYTICS: 'db_admin_analytics',
        SETTINGS: 'db_admin_settings',
        NOTIFICATIONS: 'db_admin_notifications',
        TASKS: 'db_admin_tasks',
        NOTES: 'db_admin_notes',
        CATEGORIES: 'db_admin_categories',
        TAGS: 'db_admin_tags'
    },

    initDocuments() {
        const defaultDocs = [
            { id: 1, name: 'Project Contract - Tower.pdf', type: 'Contract', size: '2.5 MB', uploadDate: '2025-12-01', category: 'Legal', tags: ['contract', 'tower'] },
            { id: 2, name: 'Blueprint - Hospital.dwg', type: 'Blueprint', size: '15.8 MB', uploadDate: '2025-11-28', category: 'Design', tags: ['blueprint', 'hospital'] }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.DOCUMENTS)) {
            StorageUtil.set(this.STORAGE_KEYS.DOCUMENTS, defaultDocs);
        }
    },

    getDocuments() {
        return StorageUtil.get(this.STORAGE_KEYS.DOCUMENTS, []);
    },

    addDocument(docData) {
        const docs = this.getDocuments();
        const newId = docs.length > 0 ? Math.max(...docs.map(d => d.id)) + 1 : 1;
        
        const newDoc = {
            id: newId,
            name: docData.name,
            type: docData.type || 'Document',
            size: docData.size || '0 KB',
            uploadDate: docData.uploadDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
            category: docData.category || 'General',
            tags: docData.tags || [],
            uploadedBy: docData.uploadedBy || 'Admin'
        };
        
        docs.push(newDoc);
        StorageUtil.set(this.STORAGE_KEYS.DOCUMENTS, docs);
        this.logAction('create', 'document', newId, newDoc);
        return newDoc;
    },

    updateDocument(id, updates) {
        const docs = this.getDocuments();
        const index = docs.findIndex(d => d.id === id);
        
        if (index !== -1) {
            docs[index] = { ...docs[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.DOCUMENTS, docs);
            this.logAction('update', 'document', id, updates);
            return docs[index];
        }
        return null;
    },

    deleteDocument(id) {
        const docs = this.getDocuments();
        const filtered = docs.filter(d => d.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.DOCUMENTS, filtered);
        this.logAction('delete', 'document', id);
        return true;
    },

    // ============================================
    // TASKS/TODO CRUD
    // ============================================

    initTasks() {
        const defaultTasks = [
            { id: 1, title: 'Review Hospital Blueprint', description: 'Check architectural plans', priority: 'High', status: 'Pending', assignedTo: 'ENG. DALE', dueDate: '2025-12-10', project: 'Sheger Hospital' },
            { id: 2, title: 'Client Meeting - Tower Project', description: 'Discuss progress', priority: 'Medium', status: 'In Progress', assignedTo: 'MOTI ELIAS', dueDate: '2025-12-08', project: 'Commercial Tower' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.TASKS)) {
            StorageUtil.set(this.STORAGE_KEYS.TASKS, defaultTasks);
        }
    },

    getTasks() {
        return StorageUtil.get(this.STORAGE_KEYS.TASKS, []);
    },

    addTask(taskData) {
        const tasks = this.getTasks();
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        
        const newTask = {
            id: newId,
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'Medium',
            status: taskData.status || 'Pending',
            assignedTo: taskData.assignedTo || 'Unassigned',
            dueDate: taskData.dueDate || '',
            project: taskData.project || '',
            createdDate: new Date().toISOString(),
            completedDate: null
        };
        
        tasks.push(newTask);
        StorageUtil.set(this.STORAGE_KEYS.TASKS, tasks);
        this.logAction('create', 'task', newId, newTask);
        return newTask;
    },

    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        
        if (index !== -1) {
            if (updates.status === 'Completed' && tasks[index].status !== 'Completed') {
                updates.completedDate = new Date().toISOString();
            }
            tasks[index] = { ...tasks[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.TASKS, tasks);
            this.logAction('update', 'task', id, updates);
            return tasks[index];
        }
        return null;
    },

    deleteTask(id) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.TASKS, filtered);
        this.logAction('delete', 'task', id);
        return true;
    },

    // ============================================
    // NOTES CRUD
    // ============================================

    initNotes() {
        const defaultNotes = [
            { id: 1, title: 'Meeting Notes - ABC Corp', content: 'Discussed budget and timeline', category: 'Meeting', tags: ['meeting', 'budget'], date: '2025-12-03', project: 'Commercial Tower' },
            { id: 2, title: 'Safety Inspection Findings', content: 'All safety protocols followed', category: 'Inspection', tags: ['safety', 'inspection'], date: '2025-12-02', project: 'Sheger Hospital' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.NOTES)) {
            StorageUtil.set(this.STORAGE_KEYS.NOTES, defaultNotes);
        }
    },

    getNotes() {
        return StorageUtil.get(this.STORAGE_KEYS.NOTES, []);
    },

    addNote(noteData) {
        const notes = this.getNotes();
        const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
        
        const newNote = {
            id: newId,
            title: noteData.title,
            content: noteData.content || '',
            category: noteData.category || 'General',
            tags: noteData.tags || [],
            date: noteData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
            project: noteData.project || '',
            author: noteData.author || 'Admin',
            lastModified: new Date().toISOString()
        };
        
        notes.push(newNote);
        StorageUtil.set(this.STORAGE_KEYS.NOTES, notes);
        this.logAction('create', 'note', newId, newNote);
        return newNote;
    },

    updateNote(id, updates) {
        const notes = this.getNotes();
        const index = notes.findIndex(n => n.id === id);
        
        if (index !== -1) {
            updates.lastModified = new Date().toISOString();
            notes[index] = { ...notes[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.NOTES, notes);
            this.logAction('update', 'note', id, updates);
            return notes[index];
        }
        return null;
    },

    deleteNote(id) {
        const notes = this.getNotes();
        const filtered = notes.filter(n => n.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.NOTES, filtered);
        this.logAction('delete', 'note', id);
        return true;
    },

    // ============================================
    // CATEGORIES CRUD
    // ============================================

    initCategories() {
        const defaultCategories = [
            { id: 1, name: 'Residential', description: 'Residential construction projects', color: '#28a745', icon: 'home', count: 0 },
            { id: 2, name: 'Commercial', description: 'Commercial buildings', color: '#007bff', icon: 'building', count: 0 },
            { id: 3, name: 'Industrial', description: 'Industrial facilities', color: '#ffc107', icon: 'industry', count: 0 }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.CATEGORIES)) {
            StorageUtil.set(this.STORAGE_KEYS.CATEGORIES, defaultCategories);
        }
    },

    getCategories() {
        return StorageUtil.get(this.STORAGE_KEYS.CATEGORIES, []);
    },

    addCategory(categoryData) {
        const categories = this.getCategories();
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        
        const newCategory = {
            id: newId,
            name: categoryData.name,
            description: categoryData.description || '',
            color: categoryData.color || '#6c757d',
            icon: categoryData.icon || 'folder',
            count: 0
        };
        
        categories.push(newCategory);
        StorageUtil.set(this.STORAGE_KEYS.CATEGORIES, categories);
        this.logAction('create', 'category', newId, newCategory);
        return newCategory;
    },

    updateCategory(id, updates) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.CATEGORIES, categories);
            this.logAction('update', 'category', id, updates);
            return categories[index];
        }
        return null;
    },

    deleteCategory(id) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.CATEGORIES, filtered);
        this.logAction('delete', 'category', id);
        return true;
    },

    // ============================================
    // ANALYTICS CRUD
    // ============================================

    initAnalytics() {
        const defaultAnalytics = {
            pageViews: {},
            visitors: {},
            conversions: {},
            revenue: {}
        };
        
        if (!StorageUtil.get(this.STORAGE_KEYS.ANALYTICS)) {
            StorageUtil.set(this.STORAGE_KEYS.ANALYTICS, defaultAnalytics);
        }
    },

    trackPageView(page) {
        const analytics = StorageUtil.get(this.STORAGE_KEYS.ANALYTICS, {});
        const today = new Date().toISOString().split('T')[0];
        
        if (!analytics.pageViews) analytics.pageViews = {};
        if (!analytics.pageViews[today]) analytics.pageViews[today] = {};
        if (!analytics.pageViews[today][page]) analytics.pageViews[today][page] = 0;
        
        analytics.pageViews[today][page]++;
        StorageUtil.set(this.STORAGE_KEYS.ANALYTICS, analytics);
    },

    trackVisitor() {
        const analytics = StorageUtil.get(this.STORAGE_KEYS.ANALYTICS, {});
        const today = new Date().toISOString().split('T')[0];
        
        if (!analytics.visitors) analytics.visitors = {};
        if (!analytics.visitors[today]) analytics.visitors[today] = 0;
        
        analytics.visitors[today]++;
        StorageUtil.set(this.STORAGE_KEYS.ANALYTICS, analytics);
    },

    getAnalytics(startDate, endDate) {
        return StorageUtil.get(this.STORAGE_KEYS.ANALYTICS, {});
    },

    // ============================================
    // SETTINGS CRUD
    // ============================================

    initSettings() {
        const defaultSettings = {
            general: {
                siteName: 'DB General Construction',
                siteEmail: 'info@dbconstruction.com',
                sitePhone: '+251-911-590-12',
                timezone: 'Africa/Addis_Ababa',
                language: 'en'
            },
            notifications: {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                notifyOnNewInquiry: true,
                notifyOnNewQuote: true,
                notifyOnProjectUpdate: true
            },
            security: {
                sessionTimeout: 30,
                requireStrongPassword: true,
                twoFactorAuth: false,
                loginAttempts: 5
            },
            display: {
                theme: 'light',
                itemsPerPage: 10,
                dateFormat: 'MM/DD/YYYY',
                currency: 'ETB'
            }
        };
        
        if (!StorageUtil.get(this.STORAGE_KEYS.SETTINGS)) {
            StorageUtil.set(this.STORAGE_KEYS.SETTINGS, defaultSettings);
        }
    },

    getSettings() {
        return StorageUtil.get(this.STORAGE_KEYS.SETTINGS, {});
    },

    updateSettings(section, updates) {
        const settings = this.getSettings();
        if (settings[section]) {
            settings[section] = { ...settings[section], ...updates };
            StorageUtil.set(this.STORAGE_KEYS.SETTINGS, settings);
            this.logAction('update', 'settings', section, updates);
            return settings[section];
        }
        return null;
    },

    // ============================================
    // NOTIFICATIONS CRUD
    // ============================================

    initNotifications() {
        const defaultNotifications = [
            { id: 1, title: 'New Quote Request', message: 'Ahmed Hassan requested a quote', type: 'quote', read: false, date: new Date().toISOString(), link: '#quotes' },
            { id: 2, title: 'Project Update', message: 'Commercial Tower reached 80% completion', type: 'project', read: false, date: new Date().toISOString(), link: '#projects' }
        ];
        
        if (!StorageUtil.get(this.STORAGE_KEYS.NOTIFICATIONS)) {
            StorageUtil.set(this.STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
        }
    },

    getNotifications() {
        return StorageUtil.get(this.STORAGE_KEYS.NOTIFICATIONS, []);
    },

    addNotification(notifData) {
        const notifications = this.getNotifications();
        const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
        
        const newNotif = {
            id: newId,
            title: notifData.title,
            message: notifData.message,
            type: notifData.type || 'info',
            read: false,
            date: new Date().toISOString(),
            link: notifData.link || '#'
        };
        
        notifications.unshift(newNotif);
        
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.splice(50);
        }
        
        StorageUtil.set(this.STORAGE_KEYS.NOTIFICATIONS, notifications);
        return newNotif;
    },

    markNotificationAsRead(id) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === id);
        
        if (index !== -1) {
            notifications[index].read = true;
            StorageUtil.set(this.STORAGE_KEYS.NOTIFICATIONS, notifications);
            return notifications[index];
        }
        return null;
    },

    markAllNotificationsAsRead() {
        const notifications = this.getNotifications();
        notifications.forEach(n => n.read = true);
        StorageUtil.set(this.STORAGE_KEYS.NOTIFICATIONS, notifications);
        return true;
    },

    deleteNotification(id) {
        const notifications = this.getNotifications();
        const filtered = notifications.filter(n => n.id !== id);
        StorageUtil.set(this.STORAGE_KEYS.NOTIFICATIONS, filtered);
        return true;
    },

    getUnreadCount() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    },

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    logAction(action, targetType, targetId, details = {}) {
        if (typeof AuditLog !== 'undefined') {
            AuditLog.logAction(action, targetType, targetId, details);
        }
    },

    // Duplicate detection
    findDuplicates(type) {
        let items = [];
        switch(type) {
            case 'projects': items = AdminCRUD.getProjects(); break;
            case 'clients': items = AdminCRUD.getClients(); break;
            case 'quotes': items = AdminCRUD.getQuotes(); break;
        }

        const duplicates = [];
        const seen = new Map();

        items.forEach(item => {
            const key = item.name?.toLowerCase() || item.email?.toLowerCase();
            if (key) {
                if (seen.has(key)) {
                    duplicates.push({ original: seen.get(key), duplicate: item });
                } else {
                    seen.set(key, item);
                }
            }
        });

        return duplicates;
    },

    // Merge duplicates
    mergeDuplicates(type, id1, id2, keepId) {
        // Implementation for merging duplicate records
        console.log(`Merging ${type} ${id1} and ${id2}, keeping ${keepId}`);
    },

    // Archive old records
    archiveOldRecords(type, daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        let items = [];
        switch(type) {
            case 'projects': items = AdminCRUD.getProjects(); break;
            case 'invoices': items = AdminCRUD.getInvoices(); break;
        }

        const archived = items.filter(item => {
            const itemDate = new Date(item.date || item.startDate);
            return itemDate < cutoffDate;
        });

        return archived;
    },

    // Backup all data
    backupAllData() {
        const backup = {
            timestamp: new Date().toISOString(),
            projects: AdminCRUD.getProjects(),
            clients: AdminCRUD.getClients(),
            team: AdminCRUD.getTeamMembers(),
            inquiries: AdminCRUD.getInquiries(),
            quotes: AdminCRUD.getQuotes(),
            blog: AdminCRUD.getBlogPosts(),
            invoices: AdminCRUD.getInvoices(),
            schedule: AdminCRUD.getScheduleEvents(),
            documents: this.getDocuments(),
            tasks: this.getTasks(),
            notes: this.getNotes(),
            categories: this.getCategories(),
            settings: this.getSettings()
        };

        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return backup;
    },

    // Restore from backup
    restoreFromBackup(backupData) {
        if (confirm('This will replace all current data. Are you sure?')) {
            try {
                if (backupData.projects) StorageUtil.set(AdminCRUD.STORAGE_KEYS.PROJECTS, backupData.projects);
                if (backupData.clients) StorageUtil.set(AdminCRUD.STORAGE_KEYS.CLIENTS, backupData.clients);
                if (backupData.team) StorageUtil.set(AdminCRUD.STORAGE_KEYS.TEAM_MEMBERS, backupData.team);
                if (backupData.inquiries) StorageUtil.set(AdminCRUD.STORAGE_KEYS.INQUIRIES, backupData.inquiries);
                if (backupData.quotes) StorageUtil.set(AdminCRUD.STORAGE_KEYS.QUOTES, backupData.quotes);
                if (backupData.blog) StorageUtil.set(AdminCRUD.STORAGE_KEYS.BLOG_POSTS, backupData.blog);
                if (backupData.invoices) StorageUtil.set(AdminCRUD.STORAGE_KEYS.INVOICES, backupData.invoices);
                if (backupData.schedule) StorageUtil.set(AdminCRUD.STORAGE_KEYS.SCHEDULE, backupData.schedule);
                if (backupData.documents) StorageUtil.set(this.STORAGE_KEYS.DOCUMENTS, backupData.documents);
                if (backupData.tasks) StorageUtil.set(this.STORAGE_KEYS.TASKS, backupData.tasks);
                if (backupData.notes) StorageUtil.set(this.STORAGE_KEYS.NOTES, backupData.notes);
                if (backupData.categories) StorageUtil.set(this.STORAGE_KEYS.CATEGORIES, backupData.categories);
                if (backupData.settings) StorageUtil.set(this.STORAGE_KEYS.SETTINGS, backupData.settings);

                alert('✅ Data restored successfully!');
                window.location.reload();
                return true;
            } catch (error) {
                alert('❌ Error restoring data: ' + error.message);
                return false;
            }
        }
        return false;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAdvancedCRUD;
}

if (typeof window !== 'undefined') {
    window.AdminAdvancedCRUD = AdminAdvancedCRUD;
}

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('admin-dashboard')) {
            setTimeout(() => {
                AdminAdvancedCRUD.init();
            }, 600);
        }
    });
}
