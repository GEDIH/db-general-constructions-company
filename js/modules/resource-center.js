/**
 * Resource Center Module
 * Manages downloadable resources with categorization, search, and access control
 */

class ResourceCenter {
  constructor(containerId) {
    this.containerId = containerId;
    this.resources = [];
    this.filteredResources = [];
    this.currentCategory = 'all';
    this.currentView = 'grid';
    this.searchQuery = '';
    this.pendingDownload = null;
    
    this.init();
  }

  /**
   * Initialize the resource center
   */
  async init() {
    this.showLoading(true);
    
    try {
      await this.loadResources();
      this.setupEventListeners();
      this.displayResources();
      this.updateCategoryCounts();
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error initializing resource center:', error);
      this.showLoading(false);
      this.showError('Failed to load resources. Please try again.');
    }
  }

  /**
   * Load resources from storage or data source
   */
  async loadResources() {
    // Try to get from localStorage first
    const storedResources = StorageUtil.get(CONFIG.STORAGE_KEYS.RESOURCES);
    
    if (storedResources && storedResources.length > 0) {
      this.resources = storedResources;
    } else {
      // Load mock data for development
      this.resources = this.getMockResourceData();
      // Save to storage
      StorageUtil.set(CONFIG.STORAGE_KEYS.RESOURCES, this.resources);
    }
    
    this.filteredResources = [...this.resources];
    return this.resources;
  }

  /**
   * Get mock resource data for development
   */
  getMockResourceData() {
    return [
      {
        id: 'res-001',
        title: 'Company Brochure 2024',
        description: 'Comprehensive overview of our services, projects, and capabilities',
        category: 'brochures',
        fileType: 'pdf',
        fileSize: 2.5,
        filePath: '/downloads/brochure-2024.pdf',
        isRestricted: false,
        downloadCount: 145,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'res-002',
        title: 'Construction Safety Guidelines',
        description: 'Essential safety protocols and procedures for construction sites',
        category: 'safety',
        fileType: 'pdf',
        fileSize: 1.8,
        filePath: '/downloads/safety-guidelines.pdf',
        isRestricted: false,
        downloadCount: 289,
        createdAt: new Date('2024-01-10')
      },
      {
        id: 'res-003',
        title: 'Project Portfolio 2023',
        description: 'Complete portfolio of projects completed in 2023 with photos and details',
        category: 'portfolios',
        fileType: 'pdf',
        fileSize: 15.3,
        filePath: '/downloads/portfolio-2023.pdf',
        isRestricted: true,
        downloadCount: 67,
        createdAt: new Date('2024-01-05')
      },
      {
        id: 'res-004',
        title: 'Technical Specifications Template',
        description: 'Standard template for project technical specifications',
        category: 'technical',
        fileType: 'doc',
        fileSize: 0.5,
        filePath: '/downloads/tech-specs-template.docx',
        isRestricted: false,
        downloadCount: 112,
        createdAt: new Date('2024-02-01')
      },
      {
        id: 'res-005',
        title: 'Quote Request Form',
        description: 'Fillable PDF form for submitting project quote requests',
        category: 'forms',
        fileType: 'pdf',
        fileSize: 0.3,
        filePath: '/downloads/quote-request-form.pdf',
        isRestricted: false,
        downloadCount: 234,
        createdAt: new Date('2024-01-20')
      },
      {
        id: 'res-006',
        title: 'Material Cost Estimation Guide',
        description: 'Detailed guide for estimating material costs in construction projects',
        category: 'technical',
        fileType: 'xls',
        fileSize: 1.2,
        filePath: '/downloads/material-cost-guide.xlsx',
        isRestricted: true,
        downloadCount: 89,
        createdAt: new Date('2024-02-10')
      },
      {
        id: 'res-007',
        title: 'Emergency Response Plan',
        description: 'Comprehensive emergency response procedures for construction sites',
        category: 'safety',
        fileType: 'pdf',
        fileSize: 2.1,
        filePath: '/downloads/emergency-response.pdf',
        isRestricted: false,
        downloadCount: 156,
        createdAt: new Date('2024-01-25')
      },
      {
        id: 'res-008',
        title: 'Client Onboarding Checklist',
        description: 'Step-by-step checklist for new client onboarding process',
        category: 'forms',
        fileType: 'pdf',
        fileSize: 0.4,
        filePath: '/downloads/onboarding-checklist.pdf',
        isRestricted: false,
        downloadCount: 78,
        createdAt: new Date('2024-02-05')
      },
      {
        id: 'res-009',
        title: 'Residential Projects Showcase',
        description: 'Portfolio of residential construction projects with case studies',
        category: 'portfolios',
        fileType: 'pdf',
        fileSize: 12.7,
        filePath: '/downloads/residential-showcase.pdf',
        isRestricted: true,
        downloadCount: 45,
        createdAt: new Date('2024-02-15')
      },
      {
        id: 'res-010',
        title: 'Services Overview Brochure',
        description: 'Detailed overview of all construction services we offer',
        category: 'brochures',
        fileType: 'pdf',
        fileSize: 3.2,
        filePath: '/downloads/services-brochure.pdf',
        isRestricted: false,
        downloadCount: 198,
        createdAt: new Date('2024-01-30')
      },
      {
        id: 'res-011',
        title: 'Quality Assurance Standards',
        description: 'Our quality assurance standards and inspection procedures',
        category: 'technical',
        fileType: 'pdf',
        fileSize: 1.9,
        filePath: '/downloads/qa-standards.pdf',
        isRestricted: false,
        downloadCount: 134,
        createdAt: new Date('2024-02-08')
      },
      {
        id: 'res-012',
        title: 'Project Timeline Template',
        description: 'Excel template for creating detailed project timelines',
        category: 'forms',
        fileType: 'xls',
        fileSize: 0.6,
        filePath: '/downloads/timeline-template.xlsx',
        isRestricted: false,
        downloadCount: 167,
        createdAt: new Date('2024-02-12')
      }
    ];
  }

  /**
   * Display resources in the current view
   */
  displayResources() {
    const container = document.getElementById('resource-grid');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Check if there are resources to display
    if (this.filteredResources.length === 0) {
      container.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
      this.updateResultsCount(0);
      return;
    }
    
    container.style.display = this.currentView === 'grid' ? 'grid' : 'block';
    if (noResults) noResults.style.display = 'none';
    
    // Create resource cards
    this.filteredResources.forEach(resource => {
      const card = this.createResourceCard(resource);
      // Only append if appendChild is available
      if (container && typeof container.appendChild === 'function') {
        container.appendChild(card);
      }
    });
    
    this.updateResultsCount(this.filteredResources.length);
  }

  /**
   * Create a resource card element
   */
  createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.dataset.resourceId = resource.id;
    
    const iconClass = this.getFileTypeIcon(resource.fileType);
    const iconColorClass = resource.fileType;
    
    card.innerHTML = `
      <div class="resource-icon ${iconColorClass}">
        <i class="${iconClass}"></i>
      </div>
      <div class="resource-content">
        <div class="resource-title">${resource.title}</div>
        <div class="resource-description">${resource.description}</div>
        <div class="resource-meta">
          <span><i class="fas fa-file"></i> ${resource.fileType.toUpperCase()}</span>
          <span><i class="fas fa-hdd"></i> ${resource.fileSize} MB</span>
          ${resource.isRestricted ? '<span class="restricted-badge"><i class="fas fa-lock"></i> Restricted</span>' : ''}
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="download-count-badge">
            <i class="fas fa-download"></i> ${resource.downloadCount} downloads
          </span>
          <button class="download-btn" data-resource-id="${resource.id}">
            <i class="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    `;
    
    return card;
  }

  /**
   * Get Font Awesome icon class for file type
   */
  getFileTypeIcon(fileType) {
    const icons = {
      pdf: 'fas fa-file-pdf',
      doc: 'fas fa-file-word',
      docx: 'fas fa-file-word',
      xls: 'fas fa-file-excel',
      xlsx: 'fas fa-file-excel',
      img: 'fas fa-file-image',
      jpg: 'fas fa-file-image',
      png: 'fas fa-file-image',
      zip: 'fas fa-file-archive'
    };
    
    return icons[fileType.toLowerCase()] || 'fas fa-file';
  }

  /**
   * Filter resources by category
   */
  filterByCategory(category) {
    this.currentCategory = category;
    this.applyFilters();
  }

  /**
   * Search resources by query
   */
  searchResources(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  /**
   * Apply all active filters
   */
  applyFilters() {
    this.filteredResources = this.resources.filter(resource => {
      // Category filter
      const categoryMatch = this.currentCategory === 'all' || resource.category === this.currentCategory;
      
      // Search filter
      const searchMatch = !this.searchQuery || 
        resource.title.toLowerCase().includes(this.searchQuery) ||
        resource.description.toLowerCase().includes(this.searchQuery) ||
        resource.category.toLowerCase().includes(this.searchQuery);
      
      return categoryMatch && searchMatch;
    });
    
    this.displayResources();
  }

  /**
   * Update category counts
   */
  updateCategoryCounts() {
    const categories = ['all', 'brochures', 'safety', 'portfolios', 'technical', 'forms'];
    
    categories.forEach(category => {
      const count = category === 'all' 
        ? this.resources.length 
        : this.resources.filter(r => r.category === category).length;
      
      const countElement = document.getElementById(`count-${category}`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
  }

  /**
   * Update results count display
   */
  updateResultsCount(count) {
    const countElement = document.getElementById('visible-count');
    if (countElement) {
      countElement.textContent = count;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Category filter
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        
        // Update active state
        categoryItems.forEach(i => i.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Filter resources
        this.filterByCategory(category);
      });
    });
    
    // Search
    const searchInput = document.getElementById('resource-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchResources(e.target.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchResources(e.target.value);
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        if (searchInput) {
          this.searchResources(searchInput.value);
        }
      });
    }
    
    // View toggle
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const container = document.getElementById('resource-container');
    
    if (gridViewBtn) {
      gridViewBtn.addEventListener('click', () => {
        this.currentView = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        container.classList.remove('list-view');
        container.classList.add('grid-view');
        this.displayResources();
      });
    }
    
    if (listViewBtn) {
      listViewBtn.addEventListener('click', () => {
        this.currentView = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        container.classList.remove('grid-view');
        container.classList.add('list-view');
        this.displayResources();
      });
    }
    
    // Download buttons (using event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('download-btn') || e.target.closest('.download-btn')) {
        const btn = e.target.classList.contains('download-btn') ? e.target : e.target.closest('.download-btn');
        const resourceId = btn.dataset.resourceId;
        this.handleDownload(resourceId);
      }
    });
    
    // Email gate modal submit
    const submitEmailBtn = document.getElementById('submit-email-btn');
    if (submitEmailBtn) {
      submitEmailBtn.addEventListener('click', () => {
        this.handleEmailSubmit();
      });
    }
  }

  /**
   * Handle resource download
   */
  handleDownload(resourceId) {
    const resource = this.resources.find(r => r.id === resourceId);
    
    if (!resource) {
      console.error('Resource not found:', resourceId);
      return;
    }
    
    // Check if resource is restricted
    if (resource.isRestricted) {
      this.pendingDownload = resource;
      this.showEmailGate();
    } else {
      this.downloadResource(resource);
    }
  }

  /**
   * Show email gate modal for restricted resources
   */
  showEmailGate() {
    const modal = new bootstrap.Modal(document.getElementById('emailGateModal'));
    modal.show();
    
    // Clear previous input
    const emailInput = document.getElementById('gate-email');
    if (emailInput) {
      emailInput.value = '';
      emailInput.classList.remove('is-invalid');
    }
  }

  /**
   * Handle email submission for restricted resources
   */
  handleEmailSubmit() {
    const emailInput = document.getElementById('gate-email');
    const emailError = document.getElementById('email-error');
    
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    
    // Validate email
    if (!ValidationUtil.validateEmail(email)) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Please enter a valid email address.';
      return;
    }
    
    emailInput.classList.remove('is-invalid');
    
    // Store email for tracking
    this.storeEmailForTracking(email, this.pendingDownload.id);
    
    // Send download link via email
    this.requestRestrictedResource(this.pendingDownload.id, email);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('emailGateModal'));
    modal.hide();
  }

  /**
   * Store email for tracking purposes
   */
  storeEmailForTracking(email, resourceId) {
    if (typeof StorageUtil === 'undefined') return;
    
    const trackingKey = 'resource_email_tracking';
    const tracking = StorageUtil.get(trackingKey) || [];
    
    tracking.push({
      email: email,
      resourceId: resourceId,
      timestamp: new Date().toISOString()
    });
    
    StorageUtil.set(trackingKey, tracking);
  }

  /**
   * Request restricted resource (sends email with download link)
   */
  requestRestrictedResource(resourceId, email) {
    const resource = this.resources.find(r => r.id === resourceId);
    
    if (!resource) return;
    
    // Check if StorageUtil is available
    const Storage = typeof StorageUtil !== 'undefined' ? StorageUtil :
                    (typeof window !== 'undefined' && window.StorageUtil) || null;
    
    if (!Storage) {
      console.error('StorageUtil not available');
      return;
    }
    
    // Generate unique download token
    const token = this.generateDownloadToken();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);
    
    // Store token
    const tokenKey = 'download_tokens';
    const tokens = Storage.get(tokenKey) || {};
    tokens[token] = {
      resourceId: resourceId,
      email: email,
      expiresAt: expirationTime.toISOString(),
      used: false
    };
    Storage.set(tokenKey, tokens);
    
    // Simulate sending email
    console.log(`Email sent to ${email} with download link for ${resource.title}`);
    console.log(`Download token: ${token}`);
    console.log(`Token expires at: ${expirationTime.toISOString()}`);
    
    // Show confirmation
    if (typeof this.showDownloadConfirmation === 'function') {
      this.showDownloadConfirmation(
        `A download link has been sent to ${email}. The link will expire in 24 hours.`
      );
    }
    
    // Track download count
    this.trackDownload(resourceId);
  }

  /**
   * Generate unique download token
   */
  generateDownloadToken() {
    return 'dl_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Download resource (non-restricted)
   */
  downloadResource(resource) {
    console.log(`Downloading resource: ${resource.title}`);
    console.log(`File path: ${resource.filePath}`);
    
    // Record download start time for performance tracking
    const downloadStartTime = Date.now();
    
    // Simulate download (in real implementation, this would trigger actual file download)
    // Create a temporary link element to trigger download
    if (typeof document !== 'undefined' && document.createElement && document.body) {
      const link = document.createElement('a');
      link.href = resource.filePath;
      link.download = resource.title;
      
      // Trigger download only if appendChild is available
      if (typeof document.body.appendChild === 'function') {
        document.body.appendChild(link);
        link.click();
        if (typeof document.body.removeChild === 'function') {
          document.body.removeChild(link);
        }
      }
    }
    
    // Track download
    this.trackDownload(resource.id);
    
    // Calculate download initiation time
    const downloadTime = Date.now() - downloadStartTime;
    console.log(`Download initiated in ${downloadTime}ms`);
    
    // Ensure download initiates within 2 seconds (requirement 10.2)
    if (downloadTime > 2000) {
      console.warn(`Download initiation took ${downloadTime}ms, exceeding 2 second requirement`);
    }
    
    // Show confirmation
    if (typeof this.showDownloadConfirmation === 'function') {
      this.showDownloadConfirmation(`Your download of "${resource.title}" has started successfully!`);
    }
    
    return downloadTime;
  }

  /**
   * Track download count
   */
  trackDownload(resourceId) {
    const resource = this.resources.find(r => r.id === resourceId);
    
    if (resource) {
      resource.downloadCount++;
      
      // Update in storage if StorageUtil is available
      if (typeof StorageUtil !== 'undefined') {
        StorageUtil.set(CONFIG.STORAGE_KEYS.RESOURCES, this.resources);
      }
      
      // Update display if methods are available
      if (typeof this.displayResources === 'function') {
        this.displayResources();
      }
      if (typeof this.updateCategoryCounts === 'function') {
        this.updateCategoryCounts();
      }
    }
  }

  /**
   * Show download confirmation modal
   */
  showDownloadConfirmation(message) {
    const messageElement = document.getElementById('download-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('downloadConfirmModal'));
    modal.show();
  }

  /**
   * Show loading spinner
   */
  showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    const container = document.getElementById('resource-grid');
    
    if (spinner) {
      spinner.style.display = show ? 'block' : 'none';
    }
    
    if (container) {
      container.style.display = show ? 'none' : '';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    alert(message);
  }

  /**
   * Sort resources by criteria
   */
  sortResources(criteria) {
    switch (criteria) {
      case 'name':
        this.filteredResources.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        this.filteredResources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'downloads':
        this.filteredResources.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'size':
        this.filteredResources.sort((a, b) => a.fileSize - b.fileSize);
        break;
    }
    
    this.displayResources();
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResourceCenter;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ResourceCenter = ResourceCenter;
}
