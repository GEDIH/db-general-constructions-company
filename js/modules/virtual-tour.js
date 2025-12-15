/**
 * Virtual Tour Viewer Module
 * Provides 360-degree panoramic image viewing with interactive hotspots
 * Uses Pannellum library for WebGL-based panoramic rendering
 */

class VirtualTour {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.viewer = null;
    this.currentTourId = null;
    this.tours = this.loadTours();
    this.isWebGLSupported = this.checkBrowserSupport();
    
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }
    
    this.init();
  }

  /**
   * Initialize the virtual tour viewer
   */
  init() {
    // Show compatibility message
    this.showCompatibilityStatus();
    
    if (!this.isWebGLSupported) {
      this.loadFallback();
      return;
    }
    
    // Create viewer container
    this.createViewerContainer();
  }
  
  /**
   * Show browser compatibility status
   */
  showCompatibilityStatus() {
    if (!this.isWebGLSupported) {
      console.warn('Virtual Tour: WebGL is not supported in this browser. Fallback mode will be used.');
    } else {
      console.log('Virtual Tour: WebGL is supported. Interactive 360° viewer is available.');
    }
  }

  /**
   * Create the viewer container structure
   */
  createViewerContainer() {
    this.container.innerHTML = `
      <div class="virtual-tour-wrapper">
        <div id="panorama-viewer" class="panorama-viewer"></div>
        <div class="tour-controls">
          <button id="fullscreen-btn" class="btn btn-primary" title="Toggle Fullscreen">
            <i class="fas fa-expand"></i>
          </button>
        </div>
        <div class="navigation-arrows">
          <button id="prev-scene-btn" class="nav-arrow nav-arrow-left" title="Previous Scene">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button id="next-scene-btn" class="nav-arrow nav-arrow-right" title="Next Scene">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="scene-thumbnails" id="scene-thumbnails"></div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('prev-scene-btn')?.addEventListener('click', () => this.navigate('prev'));
    document.getElementById('next-scene-btn')?.addEventListener('click', () => this.navigate('next'));
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
  }
  
  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    if (!this.viewer) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        this.navigate('prev');
        break;
      case 'ArrowRight':
        this.navigate('next');
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          this.toggleFullscreen();
        }
        break;
    }
  }

  /**
   * Load tour data from storage or configuration
   */
  loadTours() {
    // Check localStorage first
    const storedTours = localStorage.getItem('virtualTours');
    if (storedTours) {
      return JSON.parse(storedTours);
    }
    
    // Default sample tours
    return {
      'tour-1': {
        id: 'tour-1',
        name: 'Modern Office Building',
        scenes: [
          {
            id: 'scene-1',
            title: 'Lobby',
            panorama: 'Images/gallery1.jpg', // Using existing images as placeholders
            hotSpots: [
              {
                id: 'hotspot-1',
                pitch: -10,
                yaw: 45,
                type: 'info',
                text: 'Reception Area',
                description: 'Modern reception desk with marble finish'
              }
            ]
          },
          {
            id: 'scene-2',
            title: 'Conference Room',
            panorama: 'Images/gallery2.jpg',
            hotSpots: [
              {
                id: 'hotspot-2',
                pitch: 0,
                yaw: 90,
                type: 'info',
                text: 'Conference Table',
                description: 'Custom-built conference table seating 12 people'
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Load a specific tour by ID
   * @param {string} tourId - The ID of the tour to load
   */
  loadTour(tourId) {
    if (!this.isWebGLSupported) {
      this.loadFallback();
      return;
    }
    
    const tour = this.tours[tourId];
    if (!tour) {
      console.error(`Tour with id "${tourId}" not found`);
      return;
    }
    
    this.currentTourId = tourId;
    
    // Load first scene
    if (tour.scenes && tour.scenes.length > 0) {
      this.loadScene(tour.scenes[0]);
      this.renderThumbnails(tour.scenes);
    }
  }

  /**
   * Load a specific scene
   * @param {object} scene - Scene configuration object
   */
  loadScene(scene) {
    // Add fade transition
    const viewerElement = document.getElementById('panorama-viewer');
    if (viewerElement) {
      viewerElement.style.opacity = '0';
      viewerElement.style.transition = 'opacity 0.5s ease';
    }
    
    // Destroy existing viewer if present
    if (this.viewer) {
      this.viewer.destroy();
    }
    
    // Check if Pannellum is loaded
    if (typeof pannellum === 'undefined') {
      console.error('Pannellum library not loaded');
      this.loadFallback();
      return;
    }
    
    // Create hotspots configuration
    const hotSpots = scene.hotSpots.map(hotspot => ({
      id: hotspot.id,
      pitch: hotspot.pitch,
      yaw: hotspot.yaw,
      type: hotspot.type,
      text: hotspot.text,
      clickHandlerFunc: () => this.showHotspot(hotspot.id)
    }));
    
    // Initialize Pannellum viewer with smooth transition
    this.viewer = pannellum.viewer('panorama-viewer', {
      type: 'equirectangular',
      panorama: scene.panorama,
      autoLoad: true,
      hotSpots: hotSpots,
      showControls: true,
      showFullscreenCtrl: false, // We use custom fullscreen button
      mouseZoom: true,
      draggable: true,
      keyboardZoom: true,
      compass: true,
      northOffset: 0,
      hfov: 100, // Horizontal field of view
      pitch: 0,
      yaw: 0,
      autoRotate: -2, // Slow auto-rotation
      autoRotateInactivityDelay: 3000 // Start auto-rotate after 3 seconds of inactivity
    });
    
    // Fade in after load
    this.viewer.on('load', () => {
      setTimeout(() => {
        if (viewerElement) {
          viewerElement.style.opacity = '1';
        }
      }, 100);
    });
    
    // Store current scene
    this.currentScene = scene;
  }

  /**
   * Render scene thumbnails for navigation
   * @param {array} scenes - Array of scene objects
   */
  renderThumbnails(scenes) {
    const thumbnailContainer = document.getElementById('scene-thumbnails');
    if (!thumbnailContainer) return;
    
    thumbnailContainer.innerHTML = scenes.map((scene, index) => `
      <div class="scene-thumbnail" data-scene-index="${index}">
        <img src="${scene.panorama}" alt="${scene.title}">
        <span class="scene-title">${scene.title}</span>
      </div>
    `).join('');
    
    // Add click handlers
    thumbnailContainer.querySelectorAll('.scene-thumbnail').forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        const tour = this.tours[this.currentTourId];
        if (tour && tour.scenes[index]) {
          this.loadScene(tour.scenes[index]);
        }
      });
    });
  }

  /**
   * Navigate to next or previous scene
   * @param {string} direction - 'next' or 'prev'
   */
  navigate(direction) {
    const tour = this.tours[this.currentTourId];
    if (!tour || !tour.scenes) return;
    
    const currentSceneIndex = tour.scenes.findIndex(s => 
      this.viewer && this.viewer.getConfig().panorama === s.panorama
    );
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentSceneIndex + 1) % tour.scenes.length;
    } else {
      nextIndex = currentSceneIndex - 1;
      if (nextIndex < 0) nextIndex = tour.scenes.length - 1;
    }
    
    this.loadScene(tour.scenes[nextIndex]);
  }

  /**
   * Show hotspot information overlay
   * @param {string} hotspotId - ID of the hotspot to display
   */
  showHotspot(hotspotId) {
    const tour = this.tours[this.currentTourId];
    if (!tour) return;
    
    // Find the hotspot in current scene
    let hotspot = null;
    let sceneName = '';
    for (const scene of tour.scenes) {
      hotspot = scene.hotSpots.find(h => h.id === hotspotId);
      if (hotspot) {
        sceneName = scene.title;
        break;
      }
    }
    
    if (!hotspot) return;
    
    // Create and show modal with enhanced information
    const modal = document.createElement('div');
    modal.className = 'hotspot-modal';
    modal.innerHTML = `
      <div class="hotspot-modal-content">
        <button class="hotspot-modal-close" aria-label="Close">&times;</button>
        <div class="hotspot-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <h3>${hotspot.text}</h3>
        <p class="hotspot-scene-name"><i class="fas fa-map-marker-alt"></i> ${sceneName}</p>
        <p class="hotspot-description">${hotspot.description}</p>
        ${hotspot.details ? `<div class="hotspot-details">${hotspot.details}</div>` : ''}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close handler
    const closeBtn = modal.querySelector('.hotspot-modal-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.add('fade-out');
      setTimeout(() => modal.remove(), 300);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
      }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.classList.add('fade-out');
        setTimeout(() => modal.remove(), 300);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (!this.viewer) return;
    
    const viewerElement = document.getElementById('panorama-viewer');
    
    if (!document.fullscreenElement) {
      if (viewerElement.requestFullscreen) {
        viewerElement.requestFullscreen();
      } else if (viewerElement.webkitRequestFullscreen) {
        viewerElement.webkitRequestFullscreen();
      } else if (viewerElement.msRequestFullscreen) {
        viewerElement.msRequestFullscreen();
      }
      
      // Update button icon
      const btn = document.getElementById('fullscreen-btn');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-compress"></i>';
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      
      // Update button icon
      const btn = document.getElementById('fullscreen-btn');
      if (btn) {
        btn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    }
  }

  /**
   * Check if browser supports WebGL
   * @returns {boolean} True if WebGL is supported
   */
  checkBrowserSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load fallback image gallery for unsupported browsers
   */
  loadFallback() {
    this.container.innerHTML = `
      <div class="virtual-tour-fallback">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <div class="alert-content">
            <strong>Browser Compatibility Notice</strong>
            <p>Your browser does not support WebGL, which is required for the interactive 360° virtual tour viewer.</p>
            <p class="mb-0">Please view the project images below, or for the best experience, use one of these modern browsers:</p>
            <ul class="browser-list">
              <li><i class="fab fa-chrome"></i> Google Chrome (recommended)</li>
              <li><i class="fab fa-firefox"></i> Mozilla Firefox</li>
              <li><i class="fab fa-edge"></i> Microsoft Edge</li>
              <li><i class="fab fa-safari"></i> Safari (macOS/iOS)</li>
            </ul>
          </div>
        </div>
        <div class="fallback-gallery" id="fallback-gallery"></div>
      </div>
    `;
    
    // Load images from current tour if available
    const tour = this.currentTourId ? this.tours[this.currentTourId] : Object.values(this.tours)[0];
    if (tour && tour.scenes) {
      const gallery = document.getElementById('fallback-gallery');
      
      // Create gallery with scene information
      gallery.innerHTML = `
        <h3 class="fallback-title">${tour.name}</h3>
        <div class="fallback-grid">
          ${tour.scenes.map((scene, index) => `
            <div class="fallback-image">
              <img src="${scene.panorama}" alt="${scene.title}" class="img-fluid">
              <div class="fallback-info">
                <h4>${scene.title}</h4>
                ${scene.hotSpots && scene.hotSpots.length > 0 ? `
                  <div class="fallback-hotspots">
                    <p class="hotspots-title"><i class="fas fa-info-circle"></i> Points of Interest:</p>
                    <ul>
                      ${scene.hotSpots.map(hotspot => `
                        <li><strong>${hotspot.text}:</strong> ${hotspot.description}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      // No tour data available
      const gallery = document.getElementById('fallback-gallery');
      gallery.innerHTML = `
        <div class="no-tour-data">
          <i class="fas fa-image"></i>
          <p>No tour data available at this time.</p>
        </div>
      `;
    }
  }

  /**
   * Destroy the viewer and clean up
   */
  destroy() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VirtualTour;
}
