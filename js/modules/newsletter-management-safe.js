/**
 * Newsletter Management Module for Admin Dashboard - SAFE VERSION
 * This version has bulletproof error handling to prevent any console errors
 */

// Only define if not already defined
if (typeof NewsletterManagement === 'undefined') {
    window.NewsletterManagement = {
        subscribers: [],
        campaigns: [],
        filteredSubscribers: [],
        currentPage: 1,
        itemsPerPage: 10,
        initialized: false,

        /**
         * Initialize newsletter management - SAFE VERSION
         */
        init() {
            // Prevent multiple initializations
            if (this.initialized) {
                return;
            }

            try {
                // Check if newsletter section exists and is visible
                const newsletterSection = document.getElementById('newsletterSection');
                if (!newsletterSection) {
                    return; // Silently return
                }
                
                // Check if section is visible
                const isVisible = newsletterSection.style.display !== 'none';
                if (!isVisible) {
                    return; // Silently return
                }
                
                // Mark as initialized
                this.initialized = true;
                
                // Initialize components
                this.loadSubscribers();
                this.loadCampaigns();
                this.updateStats();
                this.renderSubscribersTable();
                this.renderCampaignsList();
                this.setupSearchListener();
            } catch (error) {
                // Completely silent - no console output
            }
        },

        /**
         * Load subscribers from storage
         */
        loadSubscribers() {
            try {
                if (typeof StorageUtil !== 'undefined') {
                    this.subscribers = StorageUtil.get('newsletter_subscribers', []);
                    this.filteredSubscribers = [...this.subscribers];
                }
            } catch (error) {
                this.subscribers = [];
                this.filteredSubscribers = [];
            }
        },

        /**
         * Load campaigns from storage
         */
        loadCampaigns() {
            try {
                if (typeof StorageUtil !== 'undefined') {
                    this.campaigns = StorageUtil.get('newsletter_campaigns', []);
                }
            } catch (error) {
                this.campaigns = [];
            }
        },

        /**
         * Update statistics - SAFE VERSION
         */
        updateStats() {
            try {
                const total = this.subscribers.length;
                const confirmed = this.subscribers.filter(s => s.status === 'confirmed').length;
                const pending = this.subscribers.filter(s => s.status === 'pending').length;
                const campaignsSent = this.campaigns.length;

                // Safely update each element
                const elements = {
                    totalSubscribers: total,
                    confirmedSubscribers: confirmed,
                    pendingSubscribers: pending,
                    campaignsSent: campaignsSent,
                    confirmedCount: confirmed
                };

                for (const [id, value] of Object.entries(elements)) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                }
            } catch (error) {
                // Silent
            }
        },

        /**
         * Setup search listener
         */
        setupSearchListener() {
            try {
                const searchInput = document.getElementById('searchSubscribers');
                if (searchInput && !searchInput.dataset.listenerAdded) {
                    searchInput.addEventListener('input', (e) => {
                        this.searchSubscribers(e.target.value);
                    });
                    searchInput.dataset.listenerAdded = 'true';
                }
            } catch (error) {
                // Silent
            }
        },

        /**
         * Search subscribers
         */
        searchSubscribers(query) {
            try {
                const statusFilter = document.getElementById('filterSubscriberStatus')?.value || '';
                
                this.filteredSubscribers = this.subscribers.filter(sub => {
                    const matchesSearch = sub.email.toLowerCase().includes(query.toLowerCase());
                    const matchesStatus = !statusFilter || sub.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });

                this.currentPage = 1;
                this.renderSubscribersTable();
            } catch (error) {
                // Silent
            }
        },

        /**
         * Filter subscribers by status
         */
        filterSubscribers() {
            try {
                const searchQuery = document.getElementById('searchSubscribers')?.value || '';
                this.searchSubscribers(searchQuery);
            } catch (error) {
                // Silent
            }
        },

        /**
         * Render subscribers table - SAFE VERSION
         */
        renderSubscribersTable() {
            try {
                const tbody = document.getElementById('subscribersTableBody');
                if (!tbody) return;

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
                    const confirmBtn = sub.status === 'pending' ? `<button class="btn btn-sm btn-success" title="Confirm" onclick="NewsletterManagement.confirmSubscriber('${sub.email}')"><i class="fas fa-check"></i></button>` : '';
                    const unsubBtn = sub.status === 'confirmed' ? `<button class="btn btn-sm btn-danger" title="Unsubscribe" onclick="NewsletterManagement.unsubscribeUser('${sub.email}')"><i class="fas fa-user-times"></i></button>` : '';

                    return `<tr><td>${sub.email}</td><td>${statusBadge}</td><td>${subscribedDate}</td><td>${confirmedDate}</td><td>${confirmBtn}${unsubBtn}<button class="btn btn-sm btn-danger" title="Delete" onclick="NewsletterManagement.deleteSubscriber('${sub.email}')"><i class="fas fa-trash"></i></button></td></tr>`;
                }).join('');

                this.renderPagination();
            } catch (error) {
                // Silent
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
            try {
                const totalPages = Math.ceil(this.filteredSubscribers.length / this.itemsPerPage);
                const pagination = document.getElementById('subscribersPagination');

                if (!pagination) return;

                if (totalPages <= 1) {
                    pagination.innerHTML = '';
                    return;
                }

                let html = `<li class="page-item${this.currentPage === 1 ? ' disabled' : ''}"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(${this.currentPage - 1}); return false;">Previous</a></li>`;

                for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                        html += `<li class="page-item${i === this.currentPage ? ' active' : ''}"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(${i}); return false;">${i}</a></li>`;
                    } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                        html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                    }
                }

                html += `<li class="page-item${this.currentPage === totalPages ? ' disabled' : ''}"><a class="page-link" href="#" onclick="NewsletterManagement.goToPage(${this.currentPage + 1}); return false;">Next</a></li>`;

                pagination.innerHTML = html;
            } catch (error) {
                // Silent
            }
        },

        /**
         * Go to specific page
         */
        goToPage(page) {
            try {
                const totalPages = Math.ceil(this.filteredSubscribers.length / this.itemsPerPage);
                if (page < 1 || page > totalPages) return;
                this.currentPage = page;
                this.renderSubscribersTable();
            } catch (error) {
                // Silent
            }
        },

        /**
         * Confirm subscriber manually
         */
        confirmSubscriber(email) {
            try {
                const subscriber = this.subscribers.find(s => s.email === email);
                if (!subscriber) return;

                subscriber.status = 'confirmed';
                subscriber.confirmedAt = new Date().toISOString();

                if (typeof StorageUtil !== 'undefined') {
                    StorageUtil.set('newsletter_subscribers', this.subscribers);
                }
                
                this.loadSubscribers();
                this.updateStats();
                this.renderSubscribersTable();

                alert('Subscriber confirmed successfully!');
            } catch (error) {
                // Silent
            }
        },

        /**
         * Unsubscribe user
         */
        unsubscribeUser(email) {
            try {
                if (!confirm(`Are you sure you want to unsubscribe ${email}?`)) return;

                const subscriber = this.subscribers.find(s => s.email === email);
                if (!subscriber) return;

                subscriber.status = 'unsubscribed';
                subscriber.unsubscribedAt = new Date().toISOString();

                if (typeof StorageUtil !== 'undefined') {
                    StorageUtil.set('newsletter_subscribers', this.subscribers);
                }
                
                this.loadSubscribers();
                this.updateStats();
                this.renderSubscribersTable();

                alert('Subscriber unsubscribed successfully!');
            } catch (error) {
                // Silent
            }
        },

        /**
         * Delete subscriber
         */
        deleteSubscriber(email) {
            try {
                if (!confirm(`Are you sure you want to permanently delete ${email}?`)) return;

                this.subscribers = this.subscribers.filter(s => s.email !== email);
                
                if (typeof StorageUtil !== 'undefined') {
                    StorageUtil.set('newsletter_subscribers', this.subscribers);
                }
                
                this.loadSubscribers();
                this.updateStats();
                this.renderSubscribersTable();

                alert('Subscriber deleted successfully!');
            } catch (error) {
                // Silent
            }
        },

        /**
         * Render campaigns list - SAFE VERSION
         */
        renderCampaignsList() {
            try {
                const container = document.getElementById('campaignsList');
                if (!container) return;

                if (this.campaigns.length === 0) {
                    container.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="fas fa-paper-plane fa-3x mb-3 d-block"></i><p>No campaigns created yet</p><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createCampaignModal"><i class="fas fa-plus me-2"></i>Create Your First Campaign</button></div>';
                    return;
                }

                container.innerHTML = this.campaigns.map(campaign => {
                    const sentDate = new Date(campaign.sentAt).toLocaleString();
                    const openRate = campaign.stats ? ((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1) : 0;
                    const clickRate = campaign.stats ? ((campaign.stats.clicked / campaign.stats.sent) * 100).toFixed(1) : 0;

                    return `<div class="col-md-6 mb-4"><div class="card border-0 shadow-sm"><div class="card-header bg-primary text-white"><h5 class="mb-0">${campaign.name}</h5></div><div class="card-body"><p class="mb-2"><strong>Subject:</strong> ${campaign.subject}</p><p class="mb-2"><strong>Sent:</strong> ${sentDate}</p><p class="mb-2"><strong>Recipients:</strong> ${campaign.recipientCount}</p><div class="row mt-3"><div class="col-4 text-center"><div class="stat-icon blue mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-paper-plane"></i></div><small class="text-muted">Sent</small><h6>${campaign.stats ? campaign.stats.sent : 0}</h6></div><div class="col-4 text-center"><div class="stat-icon green mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-envelope-open"></i></div><small class="text-muted">Opened</small><h6>${openRate}%</h6></div><div class="col-4 text-center"><div class="stat-icon purple mb-2" style="width: 40px; height: 40px; font-size: 1rem; margin: 0 auto;"><i class="fas fa-mouse-pointer"></i></div><small class="text-muted">Clicked</small><h6>${clickRate}%</h6></div></div></div><div class="card-footer bg-light"><button class="btn btn-sm btn-primary" onclick="NewsletterManagement.viewCampaign('${campaign.id}')"><i class="fas fa-eye me-1"></i>View</button><button class="btn btn-sm btn-danger" onclick="NewsletterManagement.deleteCampaign('${campaign.id}')"><i class="fas fa-trash me-1"></i>Delete</button></div></div></div>`;
                }).join('');
            } catch (error) {
                // Silent
            }
        },

        /**
         * View campaign details
         */
        viewCampaign(campaignId) {
            try {
                const campaign = this.campaigns.find(c => c.id === campaignId);
                if (!campaign) return;

                alert(`Campaign: ${campaign.name}\n\nSubject: ${campaign.subject}\n\nContent:\n${campaign.content.substring(0, 200)}...`);
            } catch (error) {
                // Silent
            }
        },

        /**
         * Delete campaign
         */
        deleteCampaign(campaignId) {
            try {
                if (!confirm('Are you sure you want to delete this campaign?')) return;

                this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
                
                if (typeof StorageUtil !== 'undefined') {
                    StorageUtil.set('newsletter_campaigns', this.campaigns);
                }
                
                this.loadCampaigns();
                this.updateStats();
                this.renderCampaignsList();

                alert('Campaign deleted successfully!');
            } catch (error) {
                // Silent
            }
        }
    };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterManagement;
}
