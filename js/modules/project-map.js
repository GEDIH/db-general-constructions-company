/**
 * Project Map Module
 * Displays an interactive map of completed construction projects across Ethiopia
 */

class ProjectMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = [];
    this.markerClusterGroup = null;
    this.projects = [];
    this.currentFilter = 'all';
    this.loadingIndicator = document.getElementById('loading-indicator');
    
    this.initializeMap();
    this.loadProjectMarkers();
    this.setupEventListeners();
  }

  /**
   * Initialize the Leaflet map centered on Ethiopia
   */
  initializeMap() {
    const center = CONFIG.MAP.CENTER;
    const zoom = CONFIG.MAP.DEFAULT_ZOOM;
    
    // Create map instance
    this.map = L.map(this.containerId).setView([center.lat, center.lng], zoom);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 5
    }).addTo(this.map);
    
    // Initialize marker cluster group
    this.markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: CONFIG.MAP.MARKER_CLUSTER_DISTANCE,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });
    
    this.map.addLayer(this.markerClusterGroup);
    
    // Add map event listeners for viewport updates
    this.map.on('moveend', () => this.updateViewportMarkers());
    this.map.on('zoomend', () => this.updateViewportMarkers());
  }

  /**
   * Load project data and create markers
   */
  async loadProjectMarkers() {
    this.showLoading(true);
    
    try {
      // Fetch project data
      this.projects = await this.fetchProjectData();
      
      // Create markers for all projects
      this.createMarkers(this.projects);
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error loading project markers:', error);
      this.showLoading(false);
      alert('Failed to load project data. Please try again.');
    }
  }

  /**
   * Fetch project data from storage or API
   */
  async fetchProjectData() {
    // Try to get from localStorage first
    const storedProjects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS);
    
    if (storedProjects && storedProjects.length > 0) {
      return storedProjects;
    }
    
    // Return mock data for development
    return this.getMockProjectData();
  }

  /**
   * Get mock project data for development
   */
  getMockProjectData() {
    return [
      {
        id: 'proj-001',
        title: 'Addis Ababa Commercial Complex',
        description: 'Modern 15-story commercial building in the heart of Addis Ababa',
        category: ['commercial'],
        location: { 
          lat: 9.0320, 
          lng: 38.7469, 
          address: 'Bole, Addis Ababa' 
        },
        images: ['Images/card1.jpg'],
        completionDate: new Date('2023-06-15'),
        status: 'completed'
      },
      {
        id: 'proj-002',
        title: 'Bahir Dar Residential Estate',
        description: 'Luxury residential complex with 50 units near Lake Tana',
        category: ['residential'],
        location: { 
          lat: 11.5742, 
          lng: 37.3615, 
          address: 'Bahir Dar, Amhara Region' 
        },
        images: ['Images/card2.jpg'],
        completionDate: new Date('2023-08-20'),
        status: 'completed'
      },
      {
        id: 'proj-003',
        title: 'Hawassa Industrial Park',
        description: 'State-of-the-art industrial facility for manufacturing',
        category: ['industrial'],
        location: { 
          lat: 7.0621, 
          lng: 38.4766, 
          address: 'Hawassa, SNNPR' 
        },
        images: ['Images/card3.jpg'],
        completionDate: new Date('2023-09-10'),
        status: 'completed'
      },
      {
        id: 'proj-004',
        title: 'Mekelle Shopping Center',
        description: 'Three-story shopping center with modern amenities',
        category: ['commercial'],
        location: { 
          lat: 13.4967, 
          lng: 39.4753, 
          address: 'Mekelle, Tigray Region' 
        },
        images: ['Images/gallery1.jpg'],
        completionDate: new Date('2023-07-05'),
        status: 'completed'
      },
      {
        id: 'proj-005',
        title: 'Dire Dawa Housing Project',
        description: 'Affordable housing development with 100 units',
        category: ['residential'],
        location: { 
          lat: 9.5930, 
          lng: 41.8661, 
          address: 'Dire Dawa' 
        },
        images: ['Images/gallery2.jpg'],
        completionDate: new Date('2023-05-25'),
        status: 'completed'
      },
      {
        id: 'proj-006',
        title: 'Gondar Hotel Complex',
        description: 'Luxury hotel with conference facilities',
        category: ['commercial'],
        location: { 
          lat: 12.6090, 
          lng: 37.4470, 
          address: 'Gondar, Amhara Region' 
        },
        images: ['Images/gallery3.jpg'],
        completionDate: new Date('2023-10-15'),
        status: 'completed'
      },
      {
        id: 'proj-007',
        title: 'Jimma Warehouse Facility',
        description: 'Large-scale warehouse and distribution center',
        category: ['industrial'],
        location: { 
          lat: 7.6769, 
          lng: 36.8344, 
          address: 'Jimma, Oromia Region' 
        },
        images: ['Images/gallery4.jpg'],
        completionDate: new Date('2023-04-30'),
        status: 'completed'
      },
      {
        id: 'proj-008',
        title: 'Adama Residential Towers',
        description: 'Twin residential towers with 200 apartments',
        category: ['residential'],
        location: { 
          lat: 8.5400, 
          lng: 39.2675, 
          address: 'Adama, Oromia Region' 
        },
        images: ['Images/gallery5.jpg'],
        completionDate: new Date('2023-11-20'),
        status: 'completed'
      },
      {
        id: 'proj-009',
        title: 'Addis Ababa Office Tower',
        description: 'Premium office space in Bole district',
        category: ['commercial'],
        location: { 
          lat: 9.0100, 
          lng: 38.7600, 
          address: 'Bole, Addis Ababa' 
        },
        images: ['Images/card1.jpg'],
        completionDate: new Date('2023-03-15'),
        status: 'completed'
      },
      {
        id: 'proj-010',
        title: 'Dessie Manufacturing Plant',
        description: 'Modern manufacturing facility with advanced equipment',
        category: ['industrial'],
        location: { 
          lat: 11.1300, 
          lng: 39.6333, 
          address: 'Dessie, Amhara Region' 
        },
        images: ['Images/card2.jpg'],
        completionDate: new Date('2023-12-01'),
        status: 'completed'
      }
    ];
  }

  /**
   * Create markers for projects
   */
  createMarkers(projects) {
    // Clear existing markers
    this.markerClusterGroup.clearLayers();
    this.markers = [];
    
    projects.forEach(project => {
      if (project.location && project.location.lat && project.location.lng) {
        const marker = this.createMarker(project);
        this.markers.push({ marker, project });
        this.markerClusterGroup.addLayer(marker);
      }
    });
  }

  /**
   * Create a single marker for a project
   */
  createMarker(project) {
    const { lat, lng } = project.location;
    
    // Create custom icon based on category
    const icon = this.getCustomIcon(project.category[0]);
    
    // Create marker
    const marker = L.marker([lat, lng], { icon });
    
    // Create popup content
    const popupContent = this.createPopupContent(project);
    
    // Bind popup to marker
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'project-popup'
    });
    
    // Add click handler
    marker.on('click', () => this.handleMarkerClick(project));
    
    return marker;
  }

  /**
   * Get custom icon based on project category
   */
  getCustomIcon(category) {
    const iconColors = {
      residential: '#28a745',
      commercial: '#007bff',
      industrial: '#ffc107',
      default: '#6c757d'
    };
    
    const color = iconColors[category] || iconColors.default;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }

  /**
   * Create popup content HTML
   */
  createPopupContent(project) {
    const thumbnail = project.images && project.images.length > 0 
      ? project.images[0] 
      : 'Images/placeholder.jpg';
    
    return `
      <div class="project-popup-content">
        <img src="${thumbnail}" alt="${project.title}" class="popup-thumbnail" onerror="this.src='Images/card1.jpg'">
        <div class="popup-title">${project.title}</div>
        <div class="popup-description">${project.description}</div>
        <a href="#" class="popup-details-link" data-project-id="${project.id}">View Details</a>
      </div>
    `;
  }

  /**
   * Handle marker click event
   */
  handleMarkerClick(project) {
    console.log('Marker clicked:', project.title);
    // Popup will be shown automatically by Leaflet
  }

  /**
   * Show project popup
   */
  showProjectPopup(projectId) {
    const markerData = this.markers.find(m => m.project.id === projectId);
    if (markerData) {
      const { marker, project } = markerData;
      
      // Pan to marker and open popup
      this.map.setView(marker.getLatLng(), 12);
      marker.openPopup();
      
      return {
        thumbnail: project.images && project.images.length > 0 ? project.images[0] : null,
        name: project.title,
        description: project.description
      };
    }
    return null;
  }

  /**
   * Cluster markers for co-located projects
   */
  clusterMarkers() {
    // Clustering is handled automatically by the markerClusterGroup
    // This method can be used to reconfigure clustering if needed
    this.markerClusterGroup.refreshClusters();
  }

  /**
   * Filter projects by location/region
   */
  filterByLocation(region) {
    // Implementation for region-based filtering
    const filteredProjects = this.projects.filter(project => 
      project.location.address.toLowerCase().includes(region.toLowerCase())
    );
    
    this.createMarkers(filteredProjects);
  }

  /**
   * Update visible markers based on viewport
   */
  updateViewportMarkers() {
    if (!this.map) return;
    
    const bounds = this.map.getBounds();
    let visibleCount = 0;
    
    this.markers.forEach(({ marker, project }) => {
      const latLng = marker.getLatLng();
      if (bounds.contains(latLng)) {
        visibleCount++;
      }
    });
    
    console.log(`Visible markers in viewport: ${visibleCount}`);
    return visibleCount;
  }

  /**
   * Navigate to project details page
   */
  navigateToProjectDetails(projectId) {
    // Check if project gallery page exists
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      // Navigate to project detail page
      window.location.href = `project-gallery.html?id=${projectId}`;
      return true;
    }
    return false;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        this.filterByCategory(category);
        
        // Update active button
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
    
    // Set initial active button
    if (filterButtons.length > 0) {
      filterButtons[0].classList.add('active');
    }
    
    // Popup link clicks (using event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-details-link')) {
        e.preventDefault();
        const projectId = e.target.dataset.projectId;
        this.navigateToProjectDetails(projectId);
      }
    });
  }

  /**
   * Filter projects by category
   */
  filterByCategory(category) {
    this.currentFilter = category;
    
    let filteredProjects = this.projects;
    if (category !== 'all') {
      filteredProjects = this.projects.filter(project => 
        project.category.includes(category)
      );
    }
    
    this.createMarkers(filteredProjects);
  }

  /**
   * Show/hide loading indicator
   */
  showLoading(show) {
    if (this.loadingIndicator) {
      if (show) {
        this.loadingIndicator.classList.add('active');
      } else {
        this.loadingIndicator.classList.remove('active');
      }
    }
  }

  /**
   * Get all markers in the current viewport
   */
  getVisibleMarkers() {
    if (!this.map) return [];
    
    const bounds = this.map.getBounds();
    return this.markers.filter(({ marker }) => {
      const latLng = marker.getLatLng();
      return bounds.contains(latLng);
    });
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectMap;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.ProjectMap = ProjectMap;
}
