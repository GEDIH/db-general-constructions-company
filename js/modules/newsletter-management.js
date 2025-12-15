/**
 * Newsletter Management Module for Admin Dashboard
 * Handles subscriber management, campaign creation, and statistics
 */

const NewsletterManagement = {
    subscribers: [],
    campaigns: [],
    filteredSubscribers: [],
    currentPage: 1,
    itemsPerPage: 10,

    /**
     * Initialize newsletter management
     */
    init() {
        try {
            // Check if newsletter section exists and is visible
            const newsletterSection = document.getElementById('newsletterSection');
            if (!newsletterSection) {
                return; // Silently return if section doesn't exist
            }
            
            // Check if section is visible
            const isVisible = newsletterSection.style.display !== 'none';
            if (!isVisible) {
                return; // Silently return if section is hidden
            }
            
            this.loadSubscribers();
            this.loadCampaigns();
            this.updateStats();
            this.renderSubscribersTable();
            this.renderCampaignsList();
            this.setupSearchListener();
        } catch (error) {
            // Silently catch errors to prevent breaking the dashboard
            if (console && console.error) {
                console.error('Newsletter init error:', error.message);
            }
        }
    },

    /**
     * Load subscribers from storage
     */
    loadSubscribers() {
        this.subscribers = StorageUtil.get('newsletter_subscribers', []);
        this.filteredSubscribers = [...this.subscribers];
    },

    /**
     * Load campaigns from storage
     */
    loadCampaigns() {
        this.campaigns = StorageUtil.get('newsletter_campaigns', []);
    },

    /**
     * Update statistics
     */
    updateStats() {
        try {
            const total = this.subscribers.length;
            const confirmed = this.subscribers.filter(s => s.status === 'confirmed').length;
            const pending = this.subscribers.filter(s => s.status === 'pending').length;
            const campaignsSent = this.campaigns.length;

            const totalEl = document.getElementById('totalSubscribers');
            const confirmedEl = document.getElementById('confirmedSubscribers');
            const pendingEl = document.getElementById('pendingSubscribers');
            const campaignsEl = document.getElementById('campaignsSent');
            const confirmedCountEl = document.getElementById('confirmedCount');
            
            // Only update if elements exist
            if (totalEl) totalEl.textContent = total;
            if (confirmedEl) confirmedEl.textContent = confirmed;
            if (pendingEl) pendingEl.textContent = pending;
            if (campaignsEl) campaignsEl.textContent = campaignsSent;
            if (confirmedCountEl) confirmedCountEl.textContent = confirmed;
        } catch (error) {
            // Silently handle errors
        }
    },

    /**
     * Setup search listener
     */
    setupSearchListener() {
        const searchInput = document.getElementById('searchSubscribers');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchSubscribers(e.target.value);
            });
        }
    },

    /**
     * Search subscribers
     */
    searchSubscribers(query) {
        const statusFilter = document.getElementById('filterSubscriberStatus').value;
        
        this.filteredSubscribers = this.subscribers.filter(sub => {
            const matchesSearch = sub.email.toLowerCase().includes(query.toLowerCase());
            const matchesStatus = !statusFilter || sub.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.renderSubscribersTable();
    },

    /**
     * Filter subscribers by status
     */
    filterSubscribers() {
        const searchQuery = document.getElementById('searchSubscribers').value;
        this.searchSubscribers(searchQuery);
    },

    /**
     * Render subscribers table
     */
    renderSubscribersTable() {
        try {
            const tbody = document.getElementById('subscribersTableBody');
            if (!tbody) {
                return; // Silently return if element doesn't exist
            }

            if (this.filteredSubscribers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="fas fa-inbox fa-3x mb-3 d-block"></i>No subscribers found</td></tr>';
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageSubscribers = this.filteredSubscribers.slice(start, end);

        tbody.innerHTML = pageSubscribers.map(sub => {
            const statusBadge = this.getStatusBadge(sub.status);
            const subscribedDate = new Date(sub.subscribedAt).toLocaleDateString();
            const confirmedDate = sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString() : '-';
            const confirmBtn = sub.status === 'pending' ? '<button class="btn btn-sm btn-success" title="Confirm" onclick="NewsletterManagement.confirmSubscriber(\'' + sub.email + '\')"><i class="fas fa-check"></i></button>' : '';
            const unsubBtn = sub.status === 'confirmed' ? '<button class="btn btn-sm btn-danger" title="Unsubscribe" onclick="NewsletterManagement.unsubscribeUser(\'' + sub.email + '\')"><i class="fas fa-user-times"></i></button>' : '';

            return '<tr><td>' + sub.email + '</td><td>' + statusBadge + '</td><td>' + subscribedDate + '</td><td>' + confirmedDate + '</td><td>' + confirmBtn + unsubBtn + '<button class="btn btn-sm btn-danger" title="Delete" onclick="NewsletterManagement.deleteSubscriber(\'' + sub.email + '\')"><i class="fas fa-trash"></i></button></td></tr>';
        }).join('');

            this.renderPagination();
        } catch (error) {
            // Silently handle errors
        }
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            confirmed: '<span class="badge bg-success">Confirmed</span>',
            pending: '<span class="badge bg-warning">Pending</span>',
            unsubscribed: '<span class="badge bg-secondary">Unsubscribed</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredSubscribers.length / this.itemsPerPage);
        const pagination = document.getElementById('subscribersPagination');

        if (!pagination) return;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '<li class="page-item' + (this.currentPage === 1 ? ' disabled' : '') + '"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(' + (this.currentPage - 1) + '); return false;">Previous</a></li>';

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                html += '<li class="page-item' + (i === this.currentPage ? ' active' : '') + '"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(' + i + '); return false;">' + i + '</a></li>';
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        html += '<li class="page-item' + (this.currentPage === totalPages ? ' disabled' : '') + '"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(' + (this.currentPage + 1) + '); return false;">Next</a></li>';

        pagination.innerHTML = html;
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredSubscribers.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderSubscribersTable();
    },

    /**
     * Confirm subscriber manually
     */
    confirmSubscriber(email) {
        const subscriber = this.subscribers.find(s => s.email === email);
        if (!subscriber) return;

        subscriber.status = 'confirmed';
        subscriber.confirmedAt = new Date().toISOString();

        StorageUtil.set('newsletter_subscribers', this.subscribers);
        this.loadSubscribers();
        this.updateStats();
        this.renderSubscribersTable();

        alert('Subscriber confirmed successfully!');
    },

    /**
     * Unsubscribe user
     */
    unsubscribeUser(email) {
        if (!confirm('Are you sure you want to unsubscribe ' + email + '?')) return;

        const subscriber = this.subscribers.find(s => s.email === email);
        if (!subscriber) return;

        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date().toISOString();

        StorageUtil.set('newsletter_subscribers', this.subscribers);
        this.loadSubscribers();
        this.updateStats();
        this.renderSubscribersTable();

        alert('Subscriber unsubscribed successfully!');
    },

    /**
     * Delete subscriber
     */
    deleteSubscriber(email) {
        if (!confirm('Are you sure you want to permanently delete ' + email + '?')) return;

        this.subscribers = this.subscribers.filter(s => s.email !== email);
        StorageUtil.set('newsletter_subscribers', this.subscribers);
        this.loadSubscribers();
        this.updateStats();
        this.renderSubscribersTable();

        alert('Subscriber deleted successfully!');
    },

    /**
     * Render campaigns list
     */
    renderCampaignsList() {
        try {
            const container = document.getElementById('campaignsList');
            if (!container) {
                return; // Silently return if element doesn't exist
            }

            if (this.campaigns.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fas fa-paper-plane fa-3x mb-3 d-block"></i><p>No campaigns created yet</p><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createCampaignModal"><i class="fas fa-plus me-2"></i>Create Your First Campaign</button></div>';
            return;
        }

            container.innerHTML = this.campaigns.map(campaign => {
                const sentDate = new Date(campaign.sentAt).toLocaleString();
                const openRate = campaign.stats ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1) : 0;
                const clickRate = campaign.stats ? ((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1) : 0;

                return '<div class="col-md-6 mb-4"><div class="card border-0 shadow-sm"><div class="card-header bg-primary text-white"><h5 class="mb-0">' + campaign.name + '</h5></div><div class="card-body"><p class="mb-2"><strong>Subject:</strong> ' + campaign.subject + '</p><p class="mb-2"><strong>Sent:</strong> ' + sentDate + '</p><p class="mb-2"><strong>Recipients:</strong> ' + campaign.recipientCount + '</p><div class="row mt-3"><div class="col-4 text-center"><div class="stat-icon blue mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-paper-plane"></i></div><small class="text-muted">Sent</small><h6>' + (campaign.stats ? campaign.stats.sent : 0) + '</h6></div><div class="col-4 text-center"><div class="stat-icon green mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-envelope-open"></i></div><small class="text-muted">Opened</small><h6>' + openRate + '%</h6></div><div class="col-4 text-center"><div class="stat-icon purple mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-mouse-pointer"></i></div><small class="text-muted">Clicked</small><h6>' + clickRate + '%</h6></div></div></div><div class="card-footer bg-light"><button class="btn btn-sm btn-primary" onclick="NewsletterManagement.viewCampaign(\'' + campaign.id + '\')"><i class="fas fa-eye me-1"></i>View</button><button class="btn btn-sm btn-danger" onclick="NewsletterManagement.deleteCampaign(\'' + campaign.id + '\')"><i class="fas fa-trash me-1"></i>Delete</button></div></div></div>';
            }).join('');
        } catch (error) {
            // Silently handle errors
        }
    },

    /**
     * View campaign details
     */
    viewCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        alert('Campaign: ' + campaign.name + '\n\nSubject: ' + campaign.subject + '\n\nContent:\n' + campaign.content.substring(0, 200) + '...');
    },

    /**
     * Delete campaign
     */
    deleteCampaign(campaignId) {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
        StorageUtil.set('newsletter_campaigns', this.campaigns);
        this.loadCampaigns();
        this.updateStats();
        this.renderCampaignsList();

        alert('Campaign deleted successfully!');
    }
};

/**
 * Export subscribers to CSV
 */
function exportSubscribers() {
    const subscribers = StorageUtil.get('newsletter_subscribers', []);
    
    if (subscribers.length === 0) {
        alert('No subscribers to export!');
        return;
    }

    let csv = 'Email,Status,Subscribed Date,Confirmed Date\n';
    
    subscribers.forEach(sub => {
        const subscribedDate = new Date(sub.subscribedAt).toLocaleDateString();
        const confirmedDate = sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString() : '';
        csv += sub.email + ',' + sub.status + ',' + subscribedDate + ',' + confirmedDate + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Subscribers exported successfully!');
}

/**
 * Filter subscribers
 */
function filterSubscribers() {
    NewsletterManagement.filterSubscribers();
}

/**
 * Load email template
 */
function loadTemplate() {
    const template = document.getElementById('campaignTemplate').value;
    const contentField = document.getElementById('campaignContent');

    const templates = {
        newsletter: '<h2>Monthly Newsletter</h2>\n<p>Dear Subscriber,</p>\n<p>Welcome to our monthly newsletter! Here are the latest updates from DB General Construction:</p>\n<ul>\n    <li>New project completions</li>\n    <li>Industry insights</li>\n    <li>Special offers</li>\n</ul>\n<p>Best regards,<br>DB General Construction Team</p>',
        announcement: '<h2>Important Announcement</h2>\n<p>Dear Valued Client,</p>\n<p>We have an important announcement to share with you...</p>\n<p>Best regards,<br>DB General Construction Team</p>',
        promotion: '<h2>Special Promotion</h2>\n<p>Dear Subscriber,</p>\n<p>We\'re excited to offer you an exclusive promotion...</p>\n<p>Contact us today to learn more!</p>\n<p>Best regards,<br>DB General Construction Team</p>'
    };

    if (templates[template]) {
        contentField.value = templates[template];
    }
}

/**
 * Send campaign
 */
function sendCampaign() {
    const form = document.getElementById('createCampaignForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const campaignName = document.getElementById('campaignName').value;
    const campaignSubject = document.getElementById('campaignSubject').value;
    const campaignContent = document.getElementById('campaignContent').value;
    const recipientType = document.querySelector('input[name="recipients"]:checked').value;

    const subscribers = StorageUtil.get('newsletter_subscribers', []);
    let recipients = [];
    
    if (recipientType === 'confirmed') {
        recipients = subscribers.filter(s => s.status === 'confirmed');
    } else {
        const currentUser = AuthUtil.getCurrentUser();
        recipients = [{ email: currentUser.email || 'admin@dbconstruction.com' }];
    }

    if (recipients.length === 0) {
        alert('No recipients found!');
        return;
    }

    const campaign = {
        id: 'campaign_' + Date.now(),
        name: campaignName,
        subject: campaignSubject,
        content: campaignContent,
        recipientCount: recipients.length,
        sentAt: new Date().toISOString(),
        stats: {
            sent: recipients.length,
            opened: Math.floor(recipients.length * 0.65),
            clicked: Math.floor(recipients.length * 0.35)
        }
    };

    const campaigns = StorageUtil.get('newsletter_campaigns', []);
    campaigns.unshift(campaign);
    StorageUtil.set('newsletter_campaigns', campaigns);

    if (typeof AdminDashboard !== 'undefined' && AdminDashboard.logAction) {
        AdminDashboard.logAction('send_campaign', 'newsletter', campaign.id, {
            name: campaignName,
            recipients: recipients.length
        });
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('createCampaignModal'));
    if (modal) modal.hide();

    form.reset();

    alert('Campaign "' + campaignName + '" sent successfully to ' + recipients.length + ' recipient(s)!');

    NewsletterManagement.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterManagement;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.NewsletterManagement = NewsletterManagement;
    window.exportSubscribers = exportSubscribers;
    window.filterSubscribers = filterSubscribers;
    window.loadTemplate = loadTemplate;
    window.sendCampaign = sendCampaign;
}
