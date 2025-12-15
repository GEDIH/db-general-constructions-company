/**
 * Quote Management Module
 * Handles quote request management in admin dashboard
 */

const QuoteManagement = {
  currentFilter: 'all',
  allQuotes: [],
  filteredQuotes: [],

  /**
   * Initialize quote management
   */
  init() {
    this.loadQuotes();
    this.updateStats();
    this.renderTable();
    this.setupEventListeners();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.quote-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.filterQuotes(filter);
        
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Search input
    const searchInput = document.getElementById('quoteSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuotes();
      });
    }
  },

  /**
   * Load quotes from storage
   */
  loadQuotes() {
    this.allQuotes = StorageUtil.get('db_quote_requests', []);
    
    // If no quotes exist, create sample data
    if (this.allQuotes.length === 0) {
      this.createSampleQuotes();
      this.allQuotes = StorageUtil.get('db_quote_requests', []);
    }
    
    this.filteredQuotes = [...this.allQuotes];
  },

  /**
   * Create sample quote data for demonstration
   */
  createSampleQuotes() {
    const sampleQuotes = [
      {
        id: 'quote_' + Date.now() + '_1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+251-911-123-456',
        service: 'Residential Construction',
        location: 'Addis Ababa',
        budget: '5M ETB',
        message: 'I need a quote for building a 3-bedroom house in Bole area.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: [],
        timeline: [
          {
            id: 'timeline_1',
            action: 'Quote request submitted',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'System'
          }
        ]
      },
      {
        id: 'quote_' + Date.now() + '_2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+251-911-234-567',
        service: 'Commercial Building',
        location: 'Bahir Dar',
        budget: '15M ETB',
        message: 'Looking for a contractor to build a 5-story office building.',
        status: 'contacted',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: [
          {
            id: 'note_1',
            text: 'Called client, scheduled site visit for next week',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          }
        ],
        timeline: [
          {
            id: 'timeline_1',
            action: 'Quote request submitted',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'System'
          },
          {
            id: 'timeline_2',
            action: 'Status changed to Contacted',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          }
        ]
      },
      {
        id: 'quote_' + Date.now() + '_3',
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        phone: '+251-911-345-678',
        service: 'Renovation',
        location: 'Dire Dawa',
        budget: '3M ETB',
        message: 'Need to renovate an existing warehouse.',
        status: 'quoted',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: [
          {
            id: 'note_1',
            text: 'Site inspection completed',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          },
          {
            id: 'note_2',
            text: 'Quote sent via email',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          }
        ],
        timeline: [
          {
            id: 'timeline_1',
            action: 'Quote request submitted',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'System'
          },
          {
            id: 'timeline_2',
            action: 'Status changed to Contacted',
            timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          },
          {
            id: 'timeline_3',
            action: 'Status changed to Quoted',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
          }
        ]
      }
    ];

    StorageUtil.set('db_quote_requests', sampleQuotes);
  },

  /**
   * Update statistics
   */
  updateStats() {
    const total = this.allQuotes.length;
    const pending = this.allQuotes.filter(q => q.status === 'pending').length;
    const contacted = this.allQuotes.filter(q => q.status === 'contacted').length;
    const quoted = this.allQuotes.filter(q => q.status === 'quoted').length;
    const completed = this.allQuotes.filter(q => q.status === 'completed').length;
    const declined = this.allQuotes.filter(q => q.status === 'declined').length;

    document.getElementById('totalQuotesCount').textContent = total;
    document.getElementById('pendingQuotesCount').textContent = pending;
    document.getElementById('contactedQuotesCount').textContent = contacted;
    document.getElementById('quotedQuotesCount').textContent = quoted;
    document.getElementById('completedQuotesCount').textContent = completed;
    document.getElementById('declinedQuotesCount').textContent = declined;
  },

  /**
   * Filter quotes by status
   */
  filterQuotes(filter) {
    this.currentFilter = filter;
    
    if (filter === 'all') {
      this.filteredQuotes = [...this.allQuotes];
    } else {
      this.filteredQuotes = this.allQuotes.filter(q => q.status === filter);
    }
    
    this.renderTable();
  },

  /**
   * Search quotes
   */
  searchQuotes() {
    const searchTerm = document.getElementById('quoteSearchInput').value.toLowerCase();
    
    if (!searchTerm) {
      this.filterQuotes(this.currentFilter);
      return;
    }

    this.filteredQuotes = this.allQuotes.filter(quote => {
      const matchesFilter = this.currentFilter === 'all' || quote.status === this.currentFilter;
      const matchesSearch = 
        quote.name.toLowerCase().includes(searchTerm) ||
        quote.email.toLowerCase().includes(searchTerm) ||
        quote.service.toLowerCase().includes(searchTerm) ||
        quote.location.toLowerCase().includes(searchTerm);
      
      return matchesFilter && matchesSearch;
    });
    
    this.renderTable();
  },

  /**
   * Render quotes table
   */
  renderTable() {
    const tbody = document.getElementById('quotesTableBody');
    
    if (this.filteredQuotes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            <i class="fas fa-file-invoice fa-3x mb-3 d-block"></i>
            No quote requests found
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredQuotes.map(quote => {
      const statusBadge = this.getStatusBadge(quote.status);
      const date = new Date(quote.createdAt).toLocaleDateString();
      
      return `
        <tr>
          <td>
            <strong>${quote.name}</strong><br>
            <small class="text-muted">${quote.email}</small><br>
            <small class="text-muted">${quote.phone}</small>
          </td>
          <td>${quote.service}</td>
          <td>${quote.location}</td>
          <td>${quote.budget}</td>
          <td>${date}</td>
          <td>${statusBadge}</td>
          <td class="table-actions">
            <button class="btn btn-sm btn-primary" title="View Details" 
                    onclick="QuoteManagement.viewQuote('${quote.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-success" title="Update Status" 
                    onclick="QuoteManagement.showUpdateStatusModal('${quote.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-info" title="Add Note" 
                    onclick="QuoteManagement.showAddNoteModal('${quote.id}')">
              <i class="fas fa-comment"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Get status badge HTML
   */
  getStatusBadge(status) {
    const badges = {
      pending: '<span class="badge bg-warning text-dark">Pending</span>',
      contacted: '<span class="badge bg-info">Contacted</span>',
      quoted: '<span class="badge bg-primary">Quoted</span>',
      completed: '<span class="badge bg-success">Completed</span>',
      declined: '<span class="badge bg-secondary">Declined</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
  },

  /**
   * View quote details
   */
  viewQuote(quoteId) {
    const quote = this.allQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    const modalBody = document.getElementById('quoteDetailsBody');
    
    // Build timeline HTML
    const timelineHtml = quote.timeline.map(item => {
      const date = new Date(item.timestamp).toLocaleString();
      return `
        <div class="timeline-item mb-3">
          <div class="d-flex">
            <div class="timeline-marker bg-primary text-white rounded-circle me-3" 
                 style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i class="fas fa-circle" style="font-size: 8px;"></i>
            </div>
            <div class="flex-grow-1">
              <strong>${item.action}</strong><br>
              <small class="text-muted">${date} - ${item.user}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Build notes HTML
    const notesHtml = quote.notes.length > 0 ? quote.notes.map(note => {
      const date = new Date(note.timestamp).toLocaleString();
      return `
        <div class="alert alert-info mb-2">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="mb-1">${note.text}</p>
              <small class="text-muted">${date} - ${note.user}</small>
            </div>
          </div>
        </div>
      `;
    }).join('') : '<p class="text-muted">No notes yet</p>';

    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6 class="fw-bold mb-3"><i class="fas fa-user me-2"></i>Client Information</h6>
          <table class="table table-sm">
            <tr>
              <th width="40%">Name:</th>
              <td>${quote.name}</td>
            </tr>
            <tr>
              <th>Email:</th>
              <td><a href="mailto:${quote.email}">${quote.email}</a></td>
            </tr>
            <tr>
              <th>Phone:</th>
              <td><a href="tel:${quote.phone}">${quote.phone}</a></td>
            </tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold mb-3"><i class="fas fa-info-circle me-2"></i>Project Details</h6>
          <table class="table table-sm">
            <tr>
              <th width="40%">Service:</th>
              <td>${quote.service}</td>
            </tr>
            <tr>
              <th>Location:</th>
              <td>${quote.location}</td>
            </tr>
            <tr>
              <th>Budget:</th>
              <td>${quote.budget}</td>
            </tr>
            <tr>
              <th>Status:</th>
              <td>${this.getStatusBadge(quote.status)}</td>
            </tr>
            <tr>
              <th>Date:</th>
              <td>${new Date(quote.createdAt).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-12">
          <h6 class="fw-bold mb-2"><i class="fas fa-comment-alt me-2"></i>Message</h6>
          <div class="alert alert-light">
            ${quote.message}
          </div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-md-6">
          <h6 class="fw-bold mb-3"><i class="fas fa-sticky-note me-2"></i>Notes</h6>
          ${notesHtml}
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold mb-3"><i class="fas fa-history me-2"></i>Timeline</h6>
          <div class="timeline">
            ${timelineHtml}
          </div>
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-12">
          <div class="btn-group w-100">
            <button class="btn btn-success" onclick="QuoteManagement.showUpdateStatusModal('${quote.id}'); bootstrap.Modal.getInstance(document.getElementById('quoteDetailsModal')).hide();">
              <i class="fas fa-edit me-2"></i>Update Status
            </button>
            <button class="btn btn-info" onclick="QuoteManagement.showAddNoteModal('${quote.id}'); bootstrap.Modal.getInstance(document.getElementById('quoteDetailsModal')).hide();">
              <i class="fas fa-comment me-2"></i>Add Note
            </button>
            <button class="btn btn-primary" onclick="window.location.href='mailto:${quote.email}'">
              <i class="fas fa-envelope me-2"></i>Email Client
            </button>
          </div>
        </div>
      </div>
    `;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('quoteDetailsModal'));
    modal.show();
  },

  /**
   * Show update status modal
   */
  showUpdateStatusModal(quoteId) {
    const quote = this.allQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    document.getElementById('statusQuoteId').value = quoteId;
    document.getElementById('statusSelect').value = quote.status;
    document.getElementById('statusNote').value = '';

    const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    modal.show();
  },

  /**
   * Save status update
   */
  saveStatusUpdate() {
    const quoteId = document.getElementById('statusQuoteId').value;
    const newStatus = document.getElementById('statusSelect').value;
    const note = document.getElementById('statusNote').value.trim();

    const quote = this.allQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    const oldStatus = quote.status;
    
    // Update status
    quote.status = newStatus;

    // Add timeline entry
    const currentUser = AuthUtil.getCurrentUser();
    const userName = currentUser ? currentUser.name : 'Admin';
    
    quote.timeline.push({
      id: 'timeline_' + Date.now(),
      action: `Status changed from ${oldStatus} to ${newStatus}`,
      timestamp: new Date().toISOString(),
      user: userName
    });

    // Add note if provided
    if (note) {
      quote.notes.push({
        id: 'note_' + Date.now(),
        text: note,
        timestamp: new Date().toISOString(),
        user: userName
      });

      quote.timeline.push({
        id: 'timeline_' + Date.now() + '_note',
        action: 'Note added',
        timestamp: new Date().toISOString(),
        user: userName
      });
    }

    // Save to storage
    StorageUtil.set('db_quote_requests', this.allQuotes);

    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('update_quote_status', 'quote', quoteId, {
        oldStatus,
        newStatus,
        note
      });
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
    modal.hide();

    // Show success message
    alert('Quote status updated successfully!');

    // Refresh display
    this.loadQuotes();
    this.updateStats();
    this.renderTable();
  },

  /**
   * Show add note modal
   */
  showAddNoteModal(quoteId) {
    document.getElementById('noteQuoteId').value = quoteId;
    document.getElementById('noteText').value = '';

    const modal = new bootstrap.Modal(document.getElementById('addNoteModal'));
    modal.show();
  },

  /**
   * Save note
   */
  saveNote() {
    const quoteId = document.getElementById('noteQuoteId').value;
    const noteText = document.getElementById('noteText').value.trim();

    if (!noteText) {
      alert('Please enter a note');
      return;
    }

    const quote = this.allQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    // Add note
    const currentUser = AuthUtil.getCurrentUser();
    const userName = currentUser ? currentUser.name : 'Admin';
    
    quote.notes.push({
      id: 'note_' + Date.now(),
      text: noteText,
      timestamp: new Date().toISOString(),
      user: userName
    });

    // Add timeline entry
    quote.timeline.push({
      id: 'timeline_' + Date.now(),
      action: 'Note added',
      timestamp: new Date().toISOString(),
      user: userName
    });

    // Save to storage
    StorageUtil.set('db_quote_requests', this.allQuotes);

    // Log action
    if (typeof AdminDashboard !== 'undefined') {
      AdminDashboard.logAction('add_quote_note', 'quote', quoteId, {
        note: noteText
      });
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
    modal.hide();

    // Show success message
    alert('Note added successfully!');

    // Refresh display
    this.loadQuotes();
    this.renderTable();
  },

  /**
   * Get statistics for all quotes
   */
  getStatistics() {
    return {
      total: this.allQuotes.length,
      pending: this.allQuotes.filter(q => q.status === 'pending').length,
      contacted: this.allQuotes.filter(q => q.status === 'contacted').length,
      quoted: this.allQuotes.filter(q => q.status === 'quoted').length,
      completed: this.allQuotes.filter(q => q.status === 'completed').length,
      declined: this.allQuotes.filter(q => q.status === 'declined').length
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuoteManagement;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.QuoteManagement = QuoteManagement;
}
