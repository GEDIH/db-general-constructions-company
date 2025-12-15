/**
 * Enhanced Project Gallery Module
 * Provides advanced project browsing with filtering, search, and detail views
 */

class ProjectGallery {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }
    
    this.projects = [];
    this.filteredProjects = [];
    this.selectedCategories = [];
    this.searchQuery = '';
    this.currentProjectIndex = -1;
    
    this.init();
  }

  /**
   * Initialize the gallery
   */
  async init() {
    await this.loadProjects();
    this.render();
    this.setupIntersectionObserver();
  }

  /**
   * Load projects from API or fallback to mock data
   */
  async loadProjects() {
    try {
      // Try to load from API first
      if (typeof API !== 'undefined' && API.projects) {
        console.log('Loading projects from API...');
        const response = await API.projects.getAll();
        
        // Handle both 'projects' and 'data' response formats
        const projectsData = response.projects || response.data || [];
        
        if (response.success && projectsData.length > 0) {
          // Transform API data to gallery format
          this.projects = this.transformAPIProjects(projectsData);
          console.log(`Loaded ${this.projects.length} projects from database`);
        } else {
          throw new Error('No projects in database');
        }
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('Failed to load from API, using mock data:', error);
      
      // Fallback to localStorage or mock data
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.PROJECTS);
      
      if (stored) {
        this.projects = JSON.parse(stored);
      } else {
        // Initialize with mock data
        this.projects = this.getMockProjects();
        localStorage.setItem(CONFIG.STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      }
    }
    
    this.filteredProjects = [...this.projects];
  }

  /**
   * Transform API project data to gallery format
   */
  transformAPIProjects(apiProjects) {
    return apiProjects.map(project => ({
      id: `proj-${project.project_id}`,
      title: project.project_name,
      description: project.description || 'No description available',
      category: [project.project_type || 'other'],
      location: {
        lat: 9.0320,
        lng: 38.7469,
        address: project.location || 'Addis Ababa, Ethiopia'
      },
      images: [
        project.thumbnail_image || 'Images/gallery1.jpg',
        'Images/gallery2.jpg',
        'Images/gallery3.jpg'
      ],
      thumbnail: project.thumbnail_image || 'Images/gallery1.jpg',
      completionDate: project.actual_completion_date || project.estimated_completion_date || new Date(),
      duration: this.calculateDuration(project.start_date, project.actual_completion_date),
      size: parseFloat(project.size) || 0,
      client: project.client_name || 'Confidential Client',
      features: this.extractFeatures(project.description),
      cost: parseFloat(project.budget) || 0,
      specifications: {
        totalArea: `${project.size || 0} sqm`,
        status: project.status
      },
      testimonial: null,
      tags: [project.project_type, project.status].filter(Boolean),
      status: project.status || 'completed',
      virtualTourId: null
    }));
  }

  /**
   * Calculate project duration in months
   */
  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 12;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    return Math.max(1, months);
  }

  /**
   * Extract features from description
   */
  extractFeatures(description) {
    if (!description) return ['Quality Construction', 'Professional Service'];
    
    // Simple feature extraction - can be enhanced
    return ['Quality Construction', 'On-Time Delivery', 'Professional Service'];
  }

  /**
   * Get mock project data
   */
  getMockProjects() {
    return [
      {
        id: 'proj-001',
        title: 'Modern Office Complex',
        description: 'A state-of-the-art 15-story office building in Addis Ababa featuring sustainable design and smart building technology.',
        category: ['commercial', 'office'],
        location: { lat: 9.0320, lng: 38.7469, address: 'Bole, Addis Ababa' },
        images: ['Images/gallery1.jpg', 'Images/gallery2.jpg', 'Images/gallery3.jpg'],
        thumbnail: 'Images/gallery1.jpg',
        completionDate: new Date('2023-06-15'),
        duration: 24,
        size: 12000,
        client: 'Ethiopian Business Group',
        features: ['Smart HVAC', 'Solar Panels', 'Underground Parking', 'Green Roof'],
        cost: 85000000,
        specifications: {
          floors: 15,
          totalArea: '12,000 sqm',
          parkingSpaces: 200,
          energyRating: 'A+'
        },
        testimonial: {
          text: 'DB Construction delivered an exceptional building that exceeded our expectations.',
          author: 'John Doe',
          position: 'CEO, Ethiopian Business Group'
        },
        tags: ['modern', 'sustainable', 'office', 'commercial'],
        status: 'completed',
        virtualTourId: null
      },
      {
        id: 'proj-002',
        title: 'Luxury Residential Villa',
        description: 'An elegant 5-bedroom villa with contemporary design, infinity pool, and panoramic city views.',
        category: ['residential', 'luxury'],
        location: { lat: 9.0354, lng: 38.7636, address: 'Old Airport, Addis Ababa' },
        images: ['Images/gallery4.jpg', 'Images/gallery5.jpg', 'Images/gallery1.jpg'],
        thumbnail: 'Images/gallery4.jpg',
        completionDate: new Date('2023-09-20'),
        duration: 18,
        size: 850,
        client: 'Private Client',
        features: ['Infinity Pool', 'Home Theater', 'Smart Home System', 'Landscaped Garden'],
        cost: 35000000,
        specifications: {
          bedrooms: 5,
          bathrooms: 6,
          totalArea: '850 sqm',
          plotSize: '1,200 sqm'
        },
        testimonial: {
          text: 'Our dream home became a reality thanks to the exceptional craftsmanship and attention to detail.',
          author: 'Sarah Johnson',
          position: 'Homeowner'
        },
        tags: ['luxury', 'villa', 'residential', 'modern'],
        status: 'completed',
        virtualTourId: 'tour-001'
      },
      {
        id: 'proj-003',
        title: 'Industrial Warehouse Complex',
        description: 'A 20,000 sqm logistics and warehousing facility with modern loading docks and climate control.',
        category: ['industrial', 'warehouse'],
        location: { lat: 8.9806, lng: 38.7578, address: 'Kaliti, Addis Ababa' },
        images: ['Images/gallery2.jpg', 'Images/gallery3.jpg', 'Images/gallery4.jpg'],
        thumbnail: 'Images/gallery2.jpg',
        completionDate: new Date('2023-03-10'),
        duration: 16,
        size: 20000,
        client: 'National Logistics Corp',
        features: ['Climate Control', 'Loading Docks', 'Security System', 'Office Space'],
        cost: 95000000,
        specifications: {
          warehouseArea: '18,000 sqm',
          officeArea: '2,000 sqm',
          loadingDocks: 24,
          clearanceHeight: '12m'
        },
        testimonial: {
          text: 'The facility was completed on time and within budget. Excellent project management.',
          author: 'Michael Chen',
          position: 'Operations Director'
        },
        tags: ['industrial', 'warehouse', 'logistics'],
        status: 'completed',
        virtualTourId: null
      },
      {
        id: 'proj-004',
        title: 'Shopping Mall Renovation',
        description: 'Complete renovation of a 3-story shopping center including modernized facades and interior spaces.',
        category: ['commercial', 'renovation'],
        location: { lat: 9.0192, lng: 38.7525, address: 'Megenagna, Addis Ababa' },
        images: ['Images/gallery5.jpg', 'Images/gallery1.jpg', 'Images/gallery2.jpg'],
        thumbnail: 'Images/gallery5.jpg',
        completionDate: new Date('2023-11-30'),
        duration: 12,
        size: 8500,
        client: 'Retail Properties Ltd',
        features: ['Modern Facade', 'LED Lighting', 'New HVAC', 'Escalators'],
        cost: 42000000,
        specifications: {
          floors: 3,
          retailUnits: 85,
          totalArea: '8,500 sqm',
          parkingSpaces: 150
        },
        testimonial: {
          text: 'The renovation transformed our mall while keeping disruption to tenants minimal.',
          author: 'David Wilson',
          position: 'Property Manager'
        },
        tags: ['renovation', 'commercial', 'retail', 'modern'],
        status: 'completed',
        virtualTourId: null
      },
      {
        id: 'proj-005',
        title: 'Residential Apartment Complex',
        description: 'A 120-unit apartment building with amenities including gym, pool, and community spaces.',
        category: ['residential', 'apartment'],
        location: { lat: 9.0084, lng: 38.7639, address: 'CMC, Addis Ababa' },
        images: ['Images/gallery3.jpg', 'Images/gallery4.jpg', 'Images/gallery5.jpg'],
        thumbnail: 'Images/gallery3.jpg',
        completionDate: new Date('2023-08-15'),
        duration: 22,
        size: 15000,
        client: 'Urban Living Developers',
        features: ['Swimming Pool', 'Fitness Center', 'Playground', 'Underground Parking'],
        cost: 125000000,
        specifications: {
          units: 120,
          floors: 12,
          totalArea: '15,000 sqm',
          parkingSpaces: 140
        },
        testimonial: {
          text: 'Quality construction and timely delivery. Our residents are very satisfied.',
          author: 'Emma Thompson',
          position: 'Development Manager'
        },
        tags: ['residential', 'apartment', 'modern', 'amenities'],
        status: 'completed',
        virtualTourId: 'tour-002'
      },
      {
        id: 'proj-006',
        title: 'Hotel and Conference Center',
        description: 'A 200-room hotel with conference facilities, restaurants, and spa amenities.',
        category: ['commercial', 'hospitality'],
        location: { lat: 9.0250, lng: 38.7469, address: 'Bole, Addis Ababa' },
        images: ['Images/gallery1.jpg', 'Images/gallery3.jpg', 'Images/gallery5.jpg'],
        thumbnail: 'Images/gallery1.jpg',
        completionDate: new Date('2023-12-20'),
        duration: 30,
        size: 25000,
        client: 'International Hotels Group',
        features: ['Conference Halls', 'Spa', 'Restaurants', 'Rooftop Bar'],
        cost: 180000000,
        specifications: {
          rooms: 200,
          conferenceCapacity: 1000,
          totalArea: '25,000 sqm',
          restaurants: 3
        },
        testimonial: {
          text: 'An outstanding project delivered with exceptional quality and professionalism.',
          author: 'Robert Martinez',
          position: 'Regional Director'
        },
        tags: ['hotel', 'commercial', 'hospitality', 'luxury'],
        status: 'completed',
        virtualTourId: null
      }
    ];
  }

  /**
   * Render the gallery
   */
  render() {
    this.container.innerHTML = `
      <div class="gallery-header mb-4">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h2 class="mb-0">Our Projects</h2>
            <p class="text-muted">Explore our portfolio of completed construction projects</p>
          </div>
          <div class="col-md-6">
            <div class="search-box">
              <div class="input-group">
                <span class="input-group-text bg-white">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control border-start-0" 
                  id="gallery-search" 
                  placeholder="Search projects..."
                  value="${this.searchQuery}"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="gallery-filters mb-4" id="gallery-filters">
        <div class="d-flex flex-wrap gap-2">
          ${this.renderFilterButtons()}
        </div>
      </div>

      <div class="gallery-results mb-3">
        <p class="text-muted">
          Showing ${this.filteredProjects.length} of ${this.projects.length} projects
        </p>
      </div>

      <div class="gallery-grid row g-4" id="gallery-grid">
        ${this.renderProjectCards()}
      </div>

      ${this.filteredProjects.length === 0 ? this.renderNoResults() : ''}
    `;

    this.attachEventListeners();
  }

  /**
   * Render filter buttons
   */
  renderFilterButtons() {
    const categories = this.getAllCategories();
    
    let html = `
      <button 
        class="btn btn-sm ${this.selectedCategories.length === 0 ? 'btn-primary' : 'btn-outline-primary'}" 
        data-category="all"
      >
        All Projects
      </button>
    `;

    categories.forEach(category => {
      const isSelected = this.selectedCategories.includes(category);
      html += `
        <button 
          class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}" 
          data-category="${category}"
        >
          ${this.capitalizeFirst(category)}
        </button>
      `;
    });

    if (this.selectedCategories.length > 0) {
      html += `
        <button class="btn btn-sm btn-outline-danger" id="clear-filters">
          <i class="fas fa-times"></i> Clear Filters
        </button>
      `;
    }

    return html;
  }

  /**
   * Get all unique categories from projects
   */
  getAllCategories() {
    const categories = new Set();
    this.projects.forEach(project => {
      project.category.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }

  /**
   * Render project cards
   */
  renderProjectCards() {
    if (this.filteredProjects.length === 0) {
      return '';
    }

    return this.filteredProjects.map((project, index) => `
      <div class="col-md-6 col-lg-4">
        <div class="project-card" data-project-id="${project.id}" data-index="${index}">
          <div class="project-card-image">
            <img 
              data-src="${project.thumbnail}" 
              alt="${project.title}"
              class="lazy-load"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e9ecef' width='400' height='300'/%3E%3C/svg%3E"
            >
            <div class="project-card-overlay">
              <button class="btn btn-light btn-sm view-details">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
            ${project.virtualTourId ? '<span class="badge bg-info position-absolute top-0 end-0 m-2"><i class="fas fa-vr-cardboard"></i> Virtual Tour</span>' : ''}
          </div>
          <div class="project-card-body">
            <div class="project-card-categories mb-2">
              ${project.category.map(cat => `<span class="badge bg-secondary">${this.capitalizeFirst(cat)}</span>`).join(' ')}
            </div>
            <h5 class="project-card-title">${this.highlightSearchTerm(project.title)}</h5>
            <p class="project-card-description">${this.highlightSearchTerm(this.truncateText(project.description, 100))}</p>
            <div class="project-card-info">
              <div class="info-item">
                <i class="fas fa-map-marker-alt text-primary"></i>
                <span>${this.highlightSearchTerm(project.location.address)}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-calendar text-primary"></i>
                <span>${this.formatDate(project.completionDate)}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-ruler-combined text-primary"></i>
                <span>${this.formatNumber(project.size)} sqm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render no results message
   */
  renderNoResults() {
    const hasFilters = this.selectedCategories.length > 0 || this.searchQuery !== '';
    return `
      <div class="col-12">
        <div class="alert alert-info text-center">
          <i class="fas fa-info-circle fa-2x mb-3"></i>
          <h5>No projects found</h5>
          <p class="mb-0">
            ${hasFilters 
              ? 'Try adjusting your search or filters to find what you\'re looking for.' 
              : 'No projects are currently available.'}
          </p>
          ${hasFilters ? '<button class="btn btn-primary btn-sm mt-3" onclick="document.getElementById(\'clear-filters\')?.click()">Clear All Filters</button>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Setup intersection observer for lazy loading
   */
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: `${CONFIG.PERFORMANCE.IMAGE_LAZY_LOAD_THRESHOLD}px`,
      threshold: 0.01
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.classList.remove('lazy-load');
            img.classList.add('loaded');
            this.observer.unobserve(img);
          }
        }
      });
    }, options);

    // Observe all lazy-load images
    this.observeLazyImages();
  }

  /**
   * Observe lazy load images
   */
  observeLazyImages() {
    const lazyImages = this.container.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => this.observer.observe(img));
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      }, CONFIG.PERFORMANCE.DEBOUNCE_DELAY));
    }

    // Filter buttons
    const filterButtons = this.container.querySelectorAll('[data-category]');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        this.handleCategoryFilter(category);
      });
    });

    // Clear filters button
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Project cards
    const projectCards = this.container.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.view-details')) return;
        const projectId = card.getAttribute('data-project-id');
        const index = parseInt(card.getAttribute('data-index'));
        this.displayProjectDetails(projectId, index);
      });

      // Hover effect
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
      });
    });
  }

  /**
   * Handle category filter
   */
  handleCategoryFilter(category) {
    if (category === 'all') {
      this.selectedCategories = [];
    } else {
      const index = this.selectedCategories.indexOf(category);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(category);
      }
    }
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.selectedCategories = [];
    this.searchQuery = '';
    this.applyFilters();
  }

  /**
   * Apply filters and search
   */
  applyFilters() {
    this.filteredProjects = this.projects.filter(project => {
      // Category filter
      const categoryMatch = this.selectedCategories.length === 0 || 
        project.category.some(cat => this.selectedCategories.includes(cat));

      // Search filter
      const searchMatch = this.searchQuery === '' || 
        this.searchProjects(project, this.searchQuery);

      return categoryMatch && searchMatch;
    });

    this.render();
  }

  /**
   * Search projects by query
   */
  searchProjects(project, query) {
    const searchText = query.toLowerCase();
    return (
      project.title.toLowerCase().includes(searchText) ||
      project.description.toLowerCase().includes(searchText) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
      project.location.address.toLowerCase().includes(searchText)
    );
  }

  /**
   * Display project details in modal
   */
  displayProjectDetails(projectId, index) {
    this.currentProjectIndex = index;
    const project = this.filteredProjects[index];
    
    if (!project) {
      console.error('Project not found');
      return;
    }

    // Create modal if it doesn't exist
    let modal = document.getElementById('project-detail-modal');
    if (!modal) {
      modal = this.createModal();
      document.body.appendChild(modal);
    }

    // Populate modal with project details
    this.populateModal(project);

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Setup keyboard navigation
    this.setupKeyboardNavigation(modal, bsModal);
  }

  /**
   * Create modal structure
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'project-detail-modal';
    modal.tabIndex = -1;
    modal.setAttribute('aria-labelledby', 'projectDetailModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="projectDetailModalLabel"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="modal-content-container"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" id="prev-project">
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-outline-secondary" id="next-project">
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    return modal;
  }

  /**
   * Populate modal with project data
   */
  populateModal(project) {
    const modalTitle = document.getElementById('projectDetailModalLabel');
    const modalContent = document.getElementById('modal-content-container');

    modalTitle.textContent = project.title;

    modalContent.innerHTML = `
      <!-- Image Carousel -->
      <div id="projectCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
        <div class="carousel-indicators">
          ${project.images.map((_, index) => `
            <button type="button" data-bs-target="#projectCarousel" data-bs-slide-to="${index}" 
              ${index === 0 ? 'class="active" aria-current="true"' : ''} 
              aria-label="Slide ${index + 1}">
            </button>
          `).join('')}
        </div>
        <div class="carousel-inner">
          ${project.images.map((img, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${img}" class="d-block w-100" alt="${project.title} - Image ${index + 1}">
            </div>
          `).join('')}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>

      <!-- Project Information -->
      <div class="row">
        <div class="col-md-8">
          <h6 class="text-primary mb-3">Project Overview</h6>
          <p class="lead">${project.description}</p>

          <h6 class="text-primary mt-4 mb-3">Key Features</h6>
          <ul class="list-unstyled">
            ${project.features.map(feature => `
              <li class="mb-2">
                <i class="fas fa-check-circle text-success me-2"></i>
                ${feature}
              </li>
            `).join('')}
          </ul>

          ${project.testimonial ? `
            <div class="testimonial-box mt-4 p-4 bg-light rounded">
              <h6 class="text-primary mb-3">Client Testimonial</h6>
              <p class="fst-italic">"${project.testimonial.text}"</p>
              <p class="mb-0 fw-bold">- ${project.testimonial.author}</p>
              <p class="text-muted small">${project.testimonial.position}</p>
            </div>
          ` : ''}
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h6 class="mb-0">Project Specifications</h6>
            </div>
            <div class="card-body">
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Client</small>
                <strong>${project.client}</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Location</small>
                <strong>${project.location.address}</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Completion Date</small>
                <strong>${this.formatDate(project.completionDate)}</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Duration</small>
                <strong>${project.duration} months</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Total Area</small>
                <strong>${this.formatNumber(project.size)} sqm</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Project Cost</small>
                <strong>ETB ${this.formatNumber(project.cost)}</strong>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Status</small>
                <span class="badge bg-success">${this.capitalizeFirst(project.status)}</span>
              </div>
              <div class="spec-item mb-3">
                <small class="text-muted d-block">Categories</small>
                <div class="mt-1">
                  ${project.category.map(cat => `
                    <span class="badge bg-secondary me-1">${this.capitalizeFirst(cat)}</span>
                  `).join('')}
                </div>
              </div>
              ${project.virtualTourId ? `
                <div class="spec-item">
                  <button class="btn btn-info btn-sm w-100">
                    <i class="fas fa-vr-cardboard me-2"></i>
                    View Virtual Tour
                  </button>
                </div>
              ` : ''}
            </div>
          </div>

          ${Object.keys(project.specifications).length > 0 ? `
            <div class="card mt-3">
              <div class="card-header bg-secondary text-white">
                <h6 class="mb-0">Additional Details</h6>
              </div>
              <div class="card-body">
                ${Object.entries(project.specifications).map(([key, value]) => `
                  <div class="spec-item mb-2">
                    <small class="text-muted d-block">${this.capitalizeFirst(key.replace(/([A-Z])/g, ' $1'))}</small>
                    <strong>${value}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Setup navigation buttons
    this.setupNavigationButtons();
  }

  /**
   * Setup navigation buttons
   */
  setupNavigationButtons() {
    const prevBtn = document.getElementById('prev-project');
    const nextBtn = document.getElementById('next-project');

    // Disable buttons if at boundaries
    if (this.currentProjectIndex <= 0) {
      prevBtn.disabled = true;
    } else {
      prevBtn.disabled = false;
      prevBtn.onclick = () => this.navigateProject(-1);
    }

    if (this.currentProjectIndex >= this.filteredProjects.length - 1) {
      nextBtn.disabled = true;
    } else {
      nextBtn.disabled = false;
      nextBtn.onclick = () => this.navigateProject(1);
    }
  }

  /**
   * Navigate to previous/next project
   */
  navigateProject(direction) {
    const newIndex = this.currentProjectIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.filteredProjects.length) {
      this.currentProjectIndex = newIndex;
      const project = this.filteredProjects[newIndex];
      this.populateModal(project);
    }
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation(modal, bsModal) {
    const keyHandler = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.currentProjectIndex > 0) {
          this.navigateProject(-1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentProjectIndex < this.filteredProjects.length - 1) {
          this.navigateProject(1);
        }
      } else if (e.key === 'Escape') {
        bsModal.hide();
      }
    };

    // Add event listener when modal is shown
    modal.addEventListener('shown.bs.modal', () => {
      document.addEventListener('keydown', keyHandler);
    });

    // Remove event listener when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
      document.removeEventListener('keydown', keyHandler);
    });
  }

  /**
   * Filter by category
   */
  filterByCategory(categories) {
    this.selectedCategories = Array.isArray(categories) ? categories : [categories];
    this.applyFilters();
    return this.filteredProjects;
  }

  /**
   * Sort projects
   */
  sortProjects(criteria) {
    switch (criteria) {
      case 'date-desc':
        this.filteredProjects.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
        break;
      case 'date-asc':
        this.filteredProjects.sort((a, b) => new Date(a.completionDate) - new Date(b.completionDate));
        break;
      case 'title':
        this.filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'size':
        this.filteredProjects.sort((a, b) => b.size - a.size);
        break;
    }
    this.render();
  }

  /**
   * Navigate images in carousel
   */
  navigateImages(direction) {
    const carousel = document.getElementById('projectCarousel');
    if (carousel) {
      const bsCarousel = bootstrap.Carousel.getInstance(carousel) || new bootstrap.Carousel(carousel);
      if (direction === 'next') {
        bsCarousel.next();
      } else if (direction === 'prev') {
        bsCarousel.prev();
      }
    }
  }

  // Utility methods

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short' };
    return d.toLocaleDateString('en-US', options);
  }

  formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Highlight search terms in text
   */
  highlightSearchTerm(text) {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return text;
    }

    const searchText = this.searchQuery.trim();
    const regex = new RegExp(`(${this.escapeRegex(searchText)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * Escape special regex characters
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectGallery;
}
