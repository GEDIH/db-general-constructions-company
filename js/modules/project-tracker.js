/**
 * Project Tracker Module
 * Handles client project dashboard functionality including project data loading,
 * timeline visualization, progress tracking, and document management
 */

class ProjectTracker {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentUser = null;
    this.currentProject = null;
    this.projects = [];
    this.init();
  }

  /**
   * Initialize the project tracker
   * Loads user data, fetches projects, and renders dashboard
   */
  async init() {
    // Load current user from session
    this.currentUser = this.getCurrentUser();
    
    // Load user's projects from storage/API
    this.loadProjects();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Render initial dashboard with loaded data
    this.renderDashboard();
    
    // Fetch fresh data from API in background
    try {
      await this.refreshProjectData();
    } catch (error) {
      console.error('Error refreshing project data:', error);
    }
  }

  /**
   * Refresh project data from API
   * Fetches latest project information and updates display
   */
  async refreshProjectData() {
    try {
      const freshProjects = await this.fetchProjectData();
      if (freshProjects && freshProjects.length > 0) {
        this.projects = freshProjects;
        this.saveProjects();
        this.renderDashboard();
      }
    } catch (error) {
      console.error('Error refreshing project data:', error);
      // Don't throw - allow fallback to localStorage data
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Load projects for the current user
   * Fetches project data from mock API and populates dashboard
   */
  loadProjects() {
    // Get projects from localStorage
    const projectsStr = localStorage.getItem('userProjects');
    if (projectsStr) {
      try {
        const allProjects = JSON.parse(projectsStr);
        // Filter projects for current user
        if (this.currentUser && this.currentUser.projectIds) {
          this.projects = allProjects.filter(p => 
            this.currentUser.projectIds.includes(p.id)
          );
        } else {
          this.projects = allProjects;
        }
      } catch (e) {
        console.error('Error loading projects:', e);
        this.projects = this.getMockProjects();
      }
    } else {
      // Use mock data if no projects in storage
      this.projects = this.getMockProjects();
      // Save mock data to storage for persistence
      this.saveProjects();
    }
  }

  /**
   * Fetch project data from backend API
   * @param {string} projectId - Optional project ID to fetch specific project
   * @returns {Promise} - Project data
   */
  async fetchProjectData(projectId = null) {
    try {
      // Check if API utility is available
      if (typeof API === 'undefined' || !API.service) {
        console.warn('API utility not available, using localStorage data');
        if (projectId) {
          return this.projects.find(p => p.id === projectId) || null;
        }
        return this.projects;
      }

      if (projectId) {
        // Fetch specific project details
        const response = await API.service.get(`client-projects.php?project_id=${projectId}`);
        if (response.success) {
          return response.data;
        }
        return null;
      } else {
        // Fetch all projects for current user
        if (!this.currentUser || !this.currentUser.id) {
          console.warn('No user ID available, using localStorage data');
          return this.projects;
        }

        const response = await API.service.get(`client-projects.php?client_id=${this.currentUser.id}`);
        if (response.success) {
          return response.data;
        }
        return this.projects;
      }
    } catch (error) {
      console.error('Error fetching project data from API:', error);
      // Fallback to localStorage data
      if (projectId) {
        return this.projects.find(p => p.id === projectId) || null;
      }
      return this.projects;
    }
  }

  /**
   * Get mock project data for development/testing
   */
  getMockProjects() {
    return [
      {
        id: 'PRJ-2024-045',
        title: 'Residential Villa Construction',
        description: 'Modern 3-bedroom villa with contemporary design',
        status: 'in-progress',
        completionPercentage: 65,
        startDate: '2025-01-15',
        estimatedCompletion: '2025-06-30',
        budget: 2500000,
        location: 'Addis Ababa, Ethiopia',
        milestones: [
          {
            id: 'm1',
            title: 'Site Preparation',
            status: 'completed',
            date: '2025-01-20',
            description: 'Land clearing and leveling completed'
          },
          {
            id: 'm2',
            title: 'Foundation Work',
            status: 'completed',
            date: '2025-02-15',
            description: 'Foundation laid and cured'
          },
          {
            id: 'm3',
            title: 'Structural Framework',
            status: 'in-progress',
            date: '2025-03-30',
            description: 'Building structural framework'
          },
          {
            id: 'm4',
            title: 'Roofing',
            status: 'pending',
            date: '2025-04-30',
            description: 'Roof installation'
          },
          {
            id: 'm5',
            title: 'Interior Finishing',
            status: 'pending',
            date: '2025-06-15',
            description: 'Interior work and finishing'
          }
        ],
        updates: [
          {
            id: 'u1',
            date: '2025-12-03T10:30:00',
            title: 'Structural Framework Progress',
            description: 'Second floor framework 80% complete. On schedule for milestone completion.',
            author: 'Project Manager'
          },
          {
            id: 'u2',
            date: '2025-12-02T14:15:00',
            title: 'Material Delivery',
            description: 'Roofing materials delivered to site. Quality inspection passed.',
            author: 'Site Supervisor'
          },
          {
            id: 'u3',
            date: '2025-12-01T09:00:00',
            title: 'Safety Inspection',
            description: 'Monthly safety inspection completed. All safety protocols in compliance.',
            author: 'Safety Officer'
          }
        ]
      },
      {
        id: 'PRJ-2024-032',
        title: 'Office Renovation',
        description: 'Complete renovation of 500 sqm office space',
        status: 'in-progress',
        completionPercentage: 40,
        startDate: '2025-02-01',
        estimatedCompletion: '2025-04-15',
        budget: 850000,
        location: 'Bole, Addis Ababa',
        milestones: [
          {
            id: 'm1',
            title: 'Demolition',
            status: 'completed',
            date: '2025-02-05',
            description: 'Old fixtures and walls removed'
          },
          {
            id: 'm2',
            title: 'Electrical & Plumbing',
            status: 'in-progress',
            date: '2025-02-28',
            description: 'Updating electrical and plumbing systems'
          },
          {
            id: 'm3',
            title: 'Drywall & Painting',
            status: 'pending',
            date: '2025-03-20',
            description: 'New walls and painting'
          },
          {
            id: 'm4',
            title: 'Flooring & Fixtures',
            status: 'pending',
            date: '2025-04-10',
            description: 'Install flooring and fixtures'
          }
        ],
        updates: [
          {
            id: 'u1',
            date: '2025-12-02T16:45:00',
            title: 'Electrical Work Update',
            description: 'New electrical panel installed. Wiring 60% complete.',
            author: 'Electrical Contractor'
          },
          {
            id: 'u2',
            date: '2025-11-30T11:20:00',
            title: 'Plumbing Progress',
            description: 'All new plumbing lines installed and tested. No leaks detected.',
            author: 'Plumbing Contractor'
          }
        ]
      }
    ];
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Project selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-project-id]')) {
        const projectId = e.target.closest('[data-project-id]').dataset.projectId;
        this.loadProjectData(projectId);
      }
    });
  }

  /**
   * Load specific project data and populate dashboard
   * Fetches project data from mock API and displays it
   * @param {string} projectId - Project ID to load
   */
  async loadProjectData(projectId) {
    try {
      // Fetch project data from mock API
      const project = await this.fetchProjectData(projectId);
      
      if (project) {
        this.currentProject = project;
        
        // Update progress if needed based on milestones
        if (project.milestones && project.milestones.length > 0) {
          const calculatedProgress = this.calculateProgressFromMilestones(project);
          if (Math.abs(calculatedProgress - project.completionPercentage) > 5) {
            project.completionPercentage = calculatedProgress;
            this.saveProjects();
          }
        }
        
        this.renderProjectDetails();
      } else {
        console.error('Project not found:', projectId);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }

  /**
   * Render project details (legacy method for compatibility)
   */
  renderProjectDetails() {
    if (this.currentProject) {
      this.showProjectDetailModal(this.currentProject);
    }
  }

  /**
   * Render the main dashboard
   */
  renderDashboard() {
    if (!this.container) return;

    const activeProjects = this.projects.filter(p => p.status === 'in-progress');
    const totalProgress = activeProjects.length > 0
      ? Math.round(activeProjects.reduce((sum, p) => sum + p.completionPercentage, 0) / activeProjects.length)
      : 0;

    // Render overview section with projects
    const overviewSection = document.getElementById('overview-section');
    if (overviewSection) {
      this.renderProjectsOverview(overviewSection);
    }

    // Render projects section
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      this.renderProjectsList(projectsSection);
    }
  }

  /**
   * Render projects overview in dashboard
   * Populates dashboard with project information including progress bars and timelines
   */
  renderProjectsOverview(container) {
    const projectsCard = container.querySelector('.dashboard-card');
    if (!projectsCard) return;

    const activeProjects = this.projects.filter(p => p.status === 'in-progress');
    
    let projectsHTML = '';
    activeProjects.forEach(project => {
      projectsHTML += this.renderProjectCard(project);
    });

    // Update the projects section
    const projectsContainer = projectsCard.querySelector('.mb-4')?.parentElement;
    if (projectsContainer) {
      projectsContainer.innerHTML = projectsHTML + `
        <button class="btn btn-primary" onclick="document.querySelector('[data-section=&quot;projects&quot;]').click()">
          <i class="fas fa-eye me-2"></i>View All Projects
        </button>
      `;
    }

    // Update stat cards with actual data
    this.updateStatCards();

    // Render recent updates
    this.renderRecentUpdates(container);
  }

  /**
   * Update stat cards with actual project data
   */
  updateStatCards() {
    const activeProjects = this.projects.filter(p => p.status === 'in-progress');
    const completedProjects = this.projects.filter(p => p.status === 'completed');
    
    // Count unread messages (mock data)
    const unreadMessages = 3;

    // Update active projects count
    const activeProjectsCard = document.querySelector('.stat-card h3');
    if (activeProjectsCard) {
      activeProjectsCard.textContent = activeProjects.length;
    }

    // Update pending payments count (mock - would come from payment system)
    const pendingPaymentsCard = document.querySelectorAll('.stat-card h3')[1];
    if (pendingPaymentsCard) {
      // Calculate pending payments based on project milestones
      const pendingPayments = activeProjects.filter(p => p.completionPercentage >= 25).length;
      pendingPaymentsCard.textContent = pendingPayments;
    }

    // Update messages count
    const messagesCard = document.querySelectorAll('.stat-card h3')[2];
    if (messagesCard) {
      messagesCard.textContent = unreadMessages;
    }
  }

  /**
   * Render a single project card with progress bar calculation
   * Displays project status, completion percentage, and timeline
   */
  renderProjectCard(project) {
    const statusClass = this.getStatusClass(project.status);
    const statusText = this.getStatusText(project.status);
    const progressColor = this.getProgressColor(project.completionPercentage);
    
    // Calculate progress bar percentage (ensure it's between 0-100)
    const progressPercentage = Math.min(Math.max(project.completionPercentage || 0, 0), 100);

    return `
      <div class="mb-4" data-project-id="${project.id}">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h6 class="mb-1">${project.title}</h6>
            <small class="text-muted">Project ID: #${project.id}</small>
          </div>
          <span class="project-status ${statusClass}">${statusText}</span>
        </div>
        <div class="progress">
          <div class="progress-bar progress-bar-custom ${progressColor}" role="progressbar" 
               style="width: ${progressPercentage}%"
               aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100">
            ${progressPercentage}%
          </div>
        </div>
        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">Started: ${this.formatDate(project.startDate)}</small>
          <small class="text-muted">Est. Completion: ${this.formatDate(project.estimatedCompletion)}</small>
        </div>
      </div>
    `;
  }

  /**
   * Render recent updates timeline
   * Displays timeline milestones with dates and status from all projects
   */
  renderRecentUpdates(container) {
    const activityCard = container.querySelector('.dashboard-card:last-child');
    if (!activityCard) return;

    // Collect all updates from all projects
    const allUpdates = [];
    this.projects.forEach(project => {
      if (project.updates) {
        project.updates.forEach(update => {
          allUpdates.push({
            ...update,
            projectId: project.id,
            projectTitle: project.title
          });
        });
      }
      
      // Also include milestone updates
      if (project.milestones) {
        project.milestones.forEach(milestone => {
          if (milestone.status === 'completed') {
            allUpdates.push({
              id: milestone.id,
              date: milestone.date,
              title: `Milestone: ${milestone.title}`,
              description: milestone.description,
              projectId: project.id,
              projectTitle: project.title,
              type: 'milestone'
            });
          }
        });
      }
    });

    // Sort by date (most recent first)
    allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Take top 5 updates
    const recentUpdates = allUpdates.slice(0, 5);

    const timelineHTML = recentUpdates.length > 0 ? recentUpdates.map(update => `
      <div class="timeline-item">
        <div class="timeline-date">${this.formatDateTime(update.date)}</div>
        <div class="timeline-content">
          <strong>${update.title}</strong>
          <p class="mb-0 small text-muted">${update.description}</p>
          <small class="text-primary">${update.projectTitle}</small>
        </div>
      </div>
    `).join('') : '<p class="text-muted">No recent updates</p>';

    const timeline = activityCard.querySelector('.timeline');
    if (timeline) {
      timeline.innerHTML = timelineHTML;
    }
  }

  /**
   * Render projects list
   */
  renderProjectsList(container) {
    const tableBody = container.querySelector('tbody');
    if (!tableBody) return;

    const projectsHTML = this.projects.map(project => {
      const statusClass = this.getStatusClass(project.status);
      const statusText = this.getStatusText(project.status);
      const progressColor = this.getProgressColor(project.completionPercentage);

      return `
        <tr data-project-id="${project.id}">
          <td>#${project.id}</td>
          <td>${project.title}</td>
          <td><span class="project-status ${statusClass}">${statusText}</span></td>
          <td>
            <div class="progress" style="height: 20px;">
              <div class="progress-bar ${progressColor}" style="width: ${project.completionPercentage}%">
                ${project.completionPercentage}%
              </div>
            </div>
          </td>
          <td>ETB ${this.formatCurrency(project.budget)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="projectTracker.viewProjectDetails('${project.id}')">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = projectsHTML;
  }

  /**
   * View project details (opens modal or navigates to detail page)
   */
  viewProjectDetails(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    this.currentProject = project;
    this.showProjectDetailModal(project);
  }

  /**
   * Show project detail modal
   */
  showProjectDetailModal(project) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('projectDetailModal');
    if (!modal) {
      modal = this.createProjectDetailModal();
      document.body.appendChild(modal);
    }

    // Populate modal with project data
    this.populateProjectDetailModal(modal, project);

    // Show modal using Bootstrap
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  /**
   * Create project detail modal
   */
  createProjectDetailModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'projectDetailModal';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="projectDetailModalTitle"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="projectDetailModalBody">
            <!-- Content will be populated dynamically -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    return modal;
  }

  /**
   * Populate project detail modal with data
   */
  populateProjectDetailModal(modal, project) {
    const title = modal.querySelector('#projectDetailModalTitle');
    const body = modal.querySelector('#projectDetailModalBody');

    title.textContent = project.title;

    const statusClass = this.getStatusClass(project.status);
    const statusText = this.getStatusText(project.status);

    body.innerHTML = `
      <div class="row">
        <div class="col-md-8">
          <!-- Project Overview -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-info-circle me-2"></i>Project Overview</h6>
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>Project ID:</strong> #${project.id}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Status:</strong> <span class="project-status ${statusClass}">${statusText}</span>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Location:</strong> ${project.location}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Budget:</strong> ETB ${this.formatCurrency(project.budget)}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Start Date:</strong> ${this.formatDate(project.startDate)}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Est. Completion:</strong> ${this.formatDate(project.estimatedCompletion)}
              </div>
              <div class="col-12 mb-3">
                <strong>Description:</strong><br>
                ${project.description}
              </div>
            </div>
          </div>

          <!-- Progress -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-chart-line me-2"></i>Completion Progress</h6>
            <div class="progress" style="height: 30px;">
              <div class="progress-bar progress-bar-custom ${this.getProgressColor(project.completionPercentage)}" 
                   role="progressbar" style="width: ${project.completionPercentage}%">
                ${project.completionPercentage}%
              </div>
            </div>
          </div>

          <!-- Timeline Milestones -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-tasks me-2"></i>Project Milestones</h6>
            ${this.renderMilestones(project.milestones)}
          </div>

          <!-- Project Documents -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-file-alt me-2"></i>Project Documents</h6>
            ${this.renderProjectDocuments(project)}
          </div>
        </div>

        <div class="col-md-4">
          <!-- Recent Updates -->
          <div class="mb-4">
            <h6 class="text-primary mb-3"><i class="fas fa-bell me-2"></i>Recent Updates</h6>
            ${this.renderUpdates(project.updates)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render project documents in modal
   * @param {object} project - Project object
   * @returns {string} - HTML string for documents
   */
  renderProjectDocuments(project) {
    if (!project.documents || project.documents.length === 0) {
      return '<p class="text-muted">No documents uploaded yet</p>';
    }

    return `
      <div class="list-group">
        ${project.documents.slice(0, 5).map(doc => {
          const icon = this.getDocumentIcon(doc.type);
          const size = this.formatFileSize(doc.size);
          
          return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="fas ${icon} me-2 text-primary"></i>
                <div>
                  <div class="small fw-bold">${doc.name}</div>
                  <small class="text-muted">${size} • ${this.formatDate(doc.uploadDate)}</small>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary" onclick="projectTracker.downloadDocument('${doc.id}', '${project.id}')">
                <i class="fas fa-download"></i>
              </button>
            </div>
          `;
        }).join('')}
        ${project.documents.length > 5 ? `<p class="text-muted small mt-2 mb-0">+ ${project.documents.length - 5} more documents</p>` : ''}
      </div>
    `;
  }

  /**
   * Get document icon based on file type
   * @param {string} type - MIME type
   * @returns {string} - Font Awesome icon class
   */
  getDocumentIcon(type) {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-image';
    if (type.includes('word')) return 'fa-file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'fa-file-excel';
    if (type.includes('text')) return 'fa-file-alt';
    return 'fa-file';
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Render project milestones with dates and status
   * Displays timeline visualization with milestone status indicators
   */
  renderMilestones(milestones) {
    if (!milestones || milestones.length === 0) {
      return '<p class="text-muted">No milestones available</p>';
    }

    return `
      <div class="timeline">
        ${milestones.map(milestone => {
          const icon = milestone.status === 'completed' ? 'fa-check-circle text-success' :
                      milestone.status === 'in-progress' ? 'fa-spinner text-primary' :
                      'fa-circle text-muted';
          
          return `
            <div class="timeline-item">
              <div class="timeline-date">
                <i class="fas ${icon} me-2"></i>${this.formatDate(milestone.date)}
              </div>
              <div class="timeline-content">
                <strong>${milestone.title}</strong>
                <p class="mb-0 small text-muted">${milestone.description}</p>
                <span class="badge bg-${this.getMilestoneStatusColor(milestone.status)} mt-2">
                  ${milestone.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Render project updates
   */
  renderUpdates(updates) {
    if (!updates || updates.length === 0) {
      return '<p class="text-muted">No updates available</p>';
    }

    return `
      <div class="list-group">
        ${updates.map(update => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <strong class="small">${update.title}</strong>
              <small class="text-muted">${this.formatDateTime(update.date)}</small>
            </div>
            <p class="mb-1 small">${update.description}</p>
            <small class="text-primary"><i class="fas fa-user me-1"></i>${update.author}</small>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status) {
    const statusMap = {
      'in-progress': 'status-active',
      'active': 'status-active',
      'pending': 'status-pending',
      'completed': 'status-completed'
    };
    return statusMap[status] || 'status-pending';
  }

  /**
   * Get status text
   */
  getStatusText(status) {
    const textMap = {
      'in-progress': 'Active',
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed'
    };
    return textMap[status] || 'Unknown';
  }

  /**
   * Calculate progress bar percentage based on milestones
   * @param {object} project - Project object with milestones
   * @returns {number} - Calculated progress percentage
   */
  calculateProgressFromMilestones(project) {
    if (!project.milestones || project.milestones.length === 0) {
      return project.completionPercentage || 0;
    }

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = project.milestones.filter(m => m.status === 'in-progress').length;

    // Calculate percentage: completed milestones + half credit for in-progress
    const progress = ((completedMilestones + (inProgressMilestones * 0.5)) / totalMilestones) * 100;
    
    return Math.round(progress);
  }

  /**
   * Get progress bar color based on percentage
   */
  getProgressColor(percentage) {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 50) return 'bg-primary';
    if (percentage >= 25) return 'bg-info';
    return 'bg-warning';
  }

  /**
   * Get milestone status color
   */
  getMilestoneStatusColor(status) {
    const colorMap = {
      'completed': 'success',
      'in-progress': 'primary',
      'pending': 'secondary'
    };
    return colorMap[status] || 'secondary';
  }

  /**
   * Format date string
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Format date and time string
   */
  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return this.formatDate(dateStr);
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Update project progress (called by admin)
   */
  updateProgress(projectId, updateData) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return false;

    // Update project data
    if (updateData.completionPercentage !== undefined) {
      project.completionPercentage = updateData.completionPercentage;
    }

    if (updateData.status) {
      project.status = updateData.status;
    }

    if (updateData.milestone) {
      const milestone = project.milestones.find(m => m.id === updateData.milestone.id);
      if (milestone) {
        Object.assign(milestone, updateData.milestone);
      }
    }

    if (updateData.newUpdate) {
      if (!project.updates) {
        project.updates = [];
      }
      project.updates.unshift({
        id: 'u' + Date.now(),
        date: new Date().toISOString(),
        ...updateData.newUpdate
      });
    }

    // Save to localStorage
    this.saveProjects();

    // Re-render dashboard
    this.renderDashboard();

    return true;
  }

  /**
   * Save projects to localStorage
   */
  saveProjects() {
    try {
      localStorage.setItem('userProjects', JSON.stringify(this.projects));
    } catch (e) {
      console.error('Error saving projects:', e);
    }
  }

  /**
   * Get timeline data for a project
   */
  getTimeline(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return null;

    return {
      milestones: project.milestones || [],
      updates: project.updates || []
    };
  }

  /**
   * Upload document to project
   * Validates file, converts to base64, and stores in LocalStorage
   * @param {string} projectId - Project ID to associate document with
   * @param {File} file - File object to upload
   * @returns {Promise<object|null>} - Document object or null if failed
   */
  async uploadDocument(projectId, file) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Find project
      const project = this.projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Initialize documents array if needed
      if (!project.documents) {
        project.documents = [];
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Create document object
      const document = {
        id: 'doc' + Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        projectId: projectId,
        data: base64Data
      };

      // Add to project documents
      project.documents.push(document);
      
      // Save to localStorage
      this.saveProjects();

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   * Checks file type and size constraints
   * @param {File} file - File to validate
   * @returns {object} - Validation result with valid flag and error message
   */
  validateFile(file) {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Allowed types: PDF, Images (JPG, PNG, GIF), Word, Excel, Text'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit'
      };
    }

    return { valid: true };
  }

  /**
   * Convert file to base64 string
   * @param {File} file - File to convert
   * @returns {Promise<string>} - Base64 encoded string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get documents for a project
   * @param {string} projectId - Project ID
   * @returns {array} - Array of document objects
   */
  getProjectDocuments(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    return project && project.documents ? project.documents : [];
  }

  /**
   * Delete document from project
   * @param {string} projectId - Project ID
   * @param {string} documentId - Document ID to delete
   * @returns {boolean} - Success status
   */
  deleteDocument(projectId, documentId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project || !project.documents) {
      return false;
    }

    const index = project.documents.findIndex(d => d.id === documentId);
    if (index === -1) {
      return false;
    }

    project.documents.splice(index, 1);
    this.saveProjects();
    return true;
  }

  /**
   * Download document
   * @param {string} documentId - Document ID to download
   * @param {string} projectId - Project ID
   */
  downloadDocument(documentId, projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project || !project.documents) {
      console.error('Project or documents not found');
      return;
    }

    const document = project.documents.find(d => d.id === documentId);
    if (!document) {
      console.error('Document not found');
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = document.data;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Initialize project tracker when DOM is ready
let projectTracker;
document.addEventListener('DOMContentLoaded', () => {
  // Initialize project tracker if we're on the dashboard page
  if (document.getElementById('overview-section')) {
    projectTracker = new ProjectTracker('overview-section');
  }
});
