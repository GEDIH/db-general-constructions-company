/**
 * Audit Log Module
 * Handles logging of critical admin actions and provides audit log viewer
 */

const AuditLog = {
  /**
   * Log an admin action
   * @param {string} action - Action type (create, update, delete, etc.)
   * @param {string} targetType - Type of target (project, user, content, etc.)
   * @param {string} targetId - ID of the target
   * @param {object} details - Additional details about the action
   * @returns {object} - The created log entry
   */
  logAction(action, targetType, targetId, details = {}) {
    const currentUser = AuthUtil.getCurrentUser();
    if (!currentUser) {
      console.warn('Cannot log action: No authenticated user');
      return null;
    }

    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    
    const logEntry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      adminId: currentUser.id,
      adminName: currentUser.name || currentUser.username,
      adminEmail: currentUser.email,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1', // Would be actual IP in production
      userAgent: navigator.userAgent
    };
    
    auditLog.unshift(logEntry);
    
    // Keep only last 1000 entries to prevent storage overflow
    if (auditLog.length > 1000) {
      auditLog.splice(1000);
    }
    
    StorageUtil.set(CONFIG.STORAGE_KEYS.AUDIT_LOG, auditLog);
    
    return logEntry;
  },

  /**
   * Get all audit log entries
   * @param {object} filters - Optional filters
   * @returns {array} - Array of log entries
   */
  getAuditLog(filters = {}) {
    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    
    let filtered = [...auditLog];
    
    // Apply filters
    if (filters.action) {
      filtered = filtered.filter(entry => entry.action === filters.action);
    }
    
    if (filters.targetType) {
      filtered = filtered.filter(entry => entry.targetType === filters.targetType);
    }
    
    if (filters.adminId) {
      filtered = filtered.filter(entry => entry.adminId === filters.adminId);
    }
    
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= endDate);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.adminName.toLowerCase().includes(searchLower) ||
        entry.action.toLowerCase().includes(searchLower) ||
        entry.targetType.toLowerCase().includes(searchLower) ||
        entry.targetId.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.details).toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  },

  /**
   * Get audit log entries with pagination
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Number of entries per page
   * @param {object} filters - Optional filters
   * @returns {object} - Paginated results with metadata
   */
  getAuditLogPaginated(page = 1, pageSize = 20, filters = {}) {
    const allEntries = this.getAuditLog(filters);
    const totalEntries = allEntries.length;
    const totalPages = Math.ceil(totalEntries / pageSize);
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const entries = allEntries.slice(startIndex, endIndex);
    
    return {
      entries,
      pagination: {
        currentPage: page,
        pageSize,
        totalEntries,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  },

  /**
   * Get audit log statistics
   * @returns {object} - Statistics about audit log
   */
  getStatistics() {
    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    
    const stats = {
      totalEntries: auditLog.length,
      actionCounts: {},
      targetTypeCounts: {},
      adminCounts: {},
      recentActivity: []
    };
    
    // Count actions by type
    auditLog.forEach(entry => {
      // Count actions
      stats.actionCounts[entry.action] = (stats.actionCounts[entry.action] || 0) + 1;
      
      // Count target types
      stats.targetTypeCounts[entry.targetType] = (stats.targetTypeCounts[entry.targetType] || 0) + 1;
      
      // Count by admin
      stats.adminCounts[entry.adminName] = (stats.adminCounts[entry.adminName] || 0) + 1;
    });
    
    // Get recent activity (last 10 entries)
    stats.recentActivity = auditLog.slice(0, 10);
    
    return stats;
  },

  /**
   * Export audit log to CSV
   * @param {object} filters - Optional filters
   * @returns {string} - CSV string
   */
  exportToCSV(filters = {}) {
    const entries = this.getAuditLog(filters);
    
    // CSV headers
    const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Target Type', 'Target ID', 'Details', 'IP Address'];
    
    // Convert entries to CSV rows
    const rows = entries.map(entry => [
      new Date(entry.timestamp).toLocaleString(),
      entry.adminName,
      entry.adminEmail,
      entry.action,
      entry.targetType,
      entry.targetId,
      JSON.stringify(entry.details),
      entry.ipAddress
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },

  /**
   * Download audit log as CSV file
   * @param {object} filters - Optional filters
   */
  downloadCSV(filters = {}) {
    const csv = this.exportToCSV(filters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Clear old audit log entries
   * @param {number} daysToKeep - Number of days to keep (default 90)
   * @returns {number} - Number of entries removed
   */
  clearOldEntries(daysToKeep = 90) {
    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filtered = auditLog.filter(entry => 
      new Date(entry.timestamp) >= cutoffDate
    );
    
    const removedCount = auditLog.length - filtered.length;
    
    if (removedCount > 0) {
      StorageUtil.set(CONFIG.STORAGE_KEYS.AUDIT_LOG, filtered);
    }
    
    return removedCount;
  },

  /**
   * Format action type for display
   * @param {string} action - Action type
   * @returns {string} - Formatted action
   */
  formatAction(action) {
    const actionMap = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'archive': 'Archived',
      'restore': 'Restored',
      'publish': 'Published',
      'unpublish': 'Unpublished',
      'login': 'Logged In',
      'logout': 'Logged Out',
      'upload': 'Uploaded',
      'download': 'Downloaded',
      'send': 'Sent',
      'approve': 'Approved',
      'reject': 'Rejected'
    };
    
    return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);
  },

  /**
   * Get action badge class for styling
   * @param {string} action - Action type
   * @returns {string} - Bootstrap badge class
   */
  getActionBadgeClass(action) {
    const badgeMap = {
      'create': 'bg-success',
      'update': 'bg-primary',
      'delete': 'bg-danger',
      'archive': 'bg-warning',
      'restore': 'bg-info',
      'publish': 'bg-success',
      'unpublish': 'bg-secondary',
      'login': 'bg-info',
      'logout': 'bg-secondary',
      'upload': 'bg-primary',
      'download': 'bg-info',
      'send': 'bg-primary',
      'approve': 'bg-success',
      'reject': 'bg-danger'
    };
    
    return badgeMap[action] || 'bg-secondary';
  },

  /**
   * Initialize audit log viewer UI
   * @param {string} containerId - ID of container element
   */
  initViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Audit log container not found:', containerId);
      return;
    }
    
    this.renderViewer(container);
    this.attachEventListeners(container);
  },

  /**
   * Render audit log viewer
   * @param {HTMLElement} container - Container element
   */
  renderViewer(container, page = 1, filters = {}) {
    const result = this.getAuditLogPaginated(page, 20, filters);
    const stats = this.getStatistics();
    
    container.innerHTML = `
      <div class="audit-log-viewer">
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card border-0 bg-primary text-white">
              <div class="card-body text-center">
                <h3>${stats.totalEntries}</h3>
                <p class="mb-0">Total Entries</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-success text-white">
              <div class="card-body text-center">
                <h3>${Object.keys(stats.adminCounts).length}</h3>
                <p class="mb-0">Active Admins</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-warning text-white">
              <div class="card-body text-center">
                <h3>${Object.keys(stats.actionCounts).length}</h3>
                <p class="mb-0">Action Types</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 bg-info text-white">
              <div class="card-body text-center">
                <h3>${Object.keys(stats.targetTypeCounts).length}</h3>
                <p class="mb-0">Target Types</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <input type="text" class="form-control" id="auditSearchInput" 
                       placeholder="Search..." value="${filters.search || ''}">
              </div>
              <div class="col-md-2">
                <select class="form-select" id="auditActionFilter">
                  <option value="">All Actions</option>
                  ${Object.keys(stats.actionCounts).map(action => 
                    `<option value="${action}" ${filters.action === action ? 'selected' : ''}>${this.formatAction(action)}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select" id="auditTargetTypeFilter">
                  <option value="">All Types</option>
                  ${Object.keys(stats.targetTypeCounts).map(type => 
                    `<option value="${type}" ${filters.targetType === type ? 'selected' : ''}>${type}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="col-md-2">
                <input type="date" class="form-control" id="auditStartDate" 
                       placeholder="Start Date" value="${filters.startDate || ''}">
              </div>
              <div class="col-md-2">
                <input type="date" class="form-control" id="auditEndDate" 
                       placeholder="End Date" value="${filters.endDate || ''}">
              </div>
              <div class="col-md-1">
                <button class="btn btn-outline-secondary w-100" id="auditExportBtn" title="Export to CSV">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Audit Log Table -->
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target Type</th>
                    <th>Target ID</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  ${result.entries.length === 0 ? `
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                        No audit log entries found
                      </td>
                    </tr>
                  ` : result.entries.map(entry => `
                    <tr>
                      <td>
                        <small>${new Date(entry.timestamp).toLocaleString()}</small>
                      </td>
                      <td>
                        <strong>${entry.adminName}</strong><br>
                        <small class="text-muted">${entry.adminEmail}</small>
                      </td>
                      <td>
                        <span class="badge ${this.getActionBadgeClass(entry.action)}">
                          ${this.formatAction(entry.action)}
                        </span>
                      </td>
                      <td><span class="badge bg-secondary">${entry.targetType}</span></td>
                      <td><code>${entry.targetId}</code></td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="AuditLog.showDetails('${entry.id}')">
                          <i class="fas fa-info-circle"></i> View
                        </button>
                      </td>
                      <td><small>${entry.ipAddress}</small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            ${result.pagination.totalPages > 1 ? `
              <nav class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item ${!result.pagination.hasPreviousPage ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${page - 1}">Previous</a>
                  </li>
                  ${Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map(p => `
                    <li class="page-item ${p === page ? 'active' : ''}">
                      <a class="page-link" href="#" data-page="${p}">${p}</a>
                    </li>
                  `).join('')}
                  <li class="page-item ${!result.pagination.hasNextPage ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${page + 1}">Next</a>
                  </li>
                </ul>
              </nav>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Attach event listeners to audit log viewer
   * @param {HTMLElement} container - Container element
   */
  attachEventListeners(container) {
    // Search input
    const searchInput = container.querySelector('#auditSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.applyFilters(container);
      });
    }
    
    // Action filter
    const actionFilter = container.querySelector('#auditActionFilter');
    if (actionFilter) {
      actionFilter.addEventListener('change', () => {
        this.applyFilters(container);
      });
    }
    
    // Target type filter
    const targetTypeFilter = container.querySelector('#auditTargetTypeFilter');
    if (targetTypeFilter) {
      targetTypeFilter.addEventListener('change', () => {
        this.applyFilters(container);
      });
    }
    
    // Date filters
    const startDateInput = container.querySelector('#auditStartDate');
    const endDateInput = container.querySelector('#auditEndDate');
    if (startDateInput) {
      startDateInput.addEventListener('change', () => {
        this.applyFilters(container);
      });
    }
    if (endDateInput) {
      endDateInput.addEventListener('change', () => {
        this.applyFilters(container);
      });
    }
    
    // Export button
    const exportBtn = container.querySelector('#auditExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const filters = this.getFiltersFromUI(container);
        this.downloadCSV(filters);
      });
    }
    
    // Pagination links
    const paginationLinks = container.querySelectorAll('.pagination .page-link');
    paginationLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(link.getAttribute('data-page'));
        if (page && page > 0) {
          const filters = this.getFiltersFromUI(container);
          this.renderViewer(container, page, filters);
          this.attachEventListeners(container);
        }
      });
    });
  },

  /**
   * Get filters from UI inputs
   * @param {HTMLElement} container - Container element
   * @returns {object} - Filters object
   */
  getFiltersFromUI(container) {
    const filters = {};
    
    const searchInput = container.querySelector('#auditSearchInput');
    if (searchInput && searchInput.value) {
      filters.search = searchInput.value;
    }
    
    const actionFilter = container.querySelector('#auditActionFilter');
    if (actionFilter && actionFilter.value) {
      filters.action = actionFilter.value;
    }
    
    const targetTypeFilter = container.querySelector('#auditTargetTypeFilter');
    if (targetTypeFilter && targetTypeFilter.value) {
      filters.targetType = targetTypeFilter.value;
    }
    
    const startDateInput = container.querySelector('#auditStartDate');
    if (startDateInput && startDateInput.value) {
      filters.startDate = startDateInput.value;
    }
    
    const endDateInput = container.querySelector('#auditEndDate');
    if (endDateInput && endDateInput.value) {
      filters.endDate = endDateInput.value;
    }
    
    return filters;
  },

  /**
   * Apply filters and re-render viewer
   * @param {HTMLElement} container - Container element
   */
  applyFilters(container) {
    const filters = this.getFiltersFromUI(container);
    this.renderViewer(container, 1, filters);
    this.attachEventListeners(container);
  },

  /**
   * Show details modal for a log entry
   * @param {string} entryId - Log entry ID
   */
  showDetails(entryId) {
    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    const entry = auditLog.find(e => e.id === entryId);
    
    if (!entry) {
      alert('Log entry not found');
      return;
    }
    
    const modalHtml = `
      <div class="modal fade" id="auditDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Audit Log Details</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <table class="table table-bordered">
                <tr>
                  <th width="30%">Timestamp</th>
                  <td>${new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Admin Name</th>
                  <td>${entry.adminName}</td>
                </tr>
                <tr>
                  <th>Admin Email</th>
                  <td>${entry.adminEmail}</td>
                </tr>
                <tr>
                  <th>Action</th>
                  <td><span class="badge ${this.getActionBadgeClass(entry.action)}">${this.formatAction(entry.action)}</span></td>
                </tr>
                <tr>
                  <th>Target Type</th>
                  <td>${entry.targetType}</td>
                </tr>
                <tr>
                  <th>Target ID</th>
                  <td><code>${entry.targetId}</code></td>
                </tr>
                <tr>
                  <th>IP Address</th>
                  <td>${entry.ipAddress}</td>
                </tr>
                <tr>
                  <th>User Agent</th>
                  <td><small>${entry.userAgent}</small></td>
                </tr>
                <tr>
                  <th>Details</th>
                  <td><pre class="mb-0">${JSON.stringify(entry.details, null, 2)}</pre></td>
                </tr>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('auditDetailsModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('auditDetailsModal'));
    modal.show();
    
    // Clean up after modal is hidden
    document.getElementById('auditDetailsModal').addEventListener('hidden.bs.modal', function() {
      this.remove();
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuditLog;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.AuditLog = AuditLog;
}
