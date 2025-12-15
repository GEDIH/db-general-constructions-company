/**
 * Service Comparison Module
 * Handles service tier comparison, selection, and navigation to quote form
 */

class ServiceComparison {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('Service comparison container not found');
      return;
    }
    
    this.serviceTiers = this.loadServiceTiers();
    this.selectedTierId = this.getStoredSelection();
    
    this.init();
  }
  
  /**
   * Load service tier data from configuration
   * @returns {Array} Array of service tier objects
   */
  loadServiceTiers() {
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 'Starting at ETB 500,000',
        priceValue: 500000,
        description: 'Essential construction services for small projects',
        timeline: '3-6 months',
        recommended: false,
        features: [
          { name: 'Project Planning & Design', available: true },
          { name: 'Basic Materials', available: true },
          { name: 'Standard Construction', available: true },
          { name: 'Quality Inspection', available: true },
          { name: 'Basic Warranty (1 year)', available: true },
          { name: 'Premium Materials', available: false },
          { name: 'Custom Design Services', available: false },
          { name: 'Project Management Software', available: false },
          { name: 'Extended Warranty', available: false },
          { name: '24/7 Support', available: false }
        ],
        includedServices: [
          'Site preparation',
          'Foundation work',
          'Structural construction',
          'Basic finishing',
          'Final inspection'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 'Starting at ETB 1,200,000',
        priceValue: 1200000,
        description: 'Comprehensive services for medium to large projects',
        timeline: '6-12 months',
        recommended: true,
        features: [
          { name: 'Project Planning & Design', available: true },
          { name: 'Basic Materials', available: true },
          { name: 'Standard Construction', available: true },
          { name: 'Quality Inspection', available: true },
          { name: 'Basic Warranty (1 year)', available: true },
          { name: 'Premium Materials', available: true },
          { name: 'Custom Design Services', available: true },
          { name: 'Project Management Software', available: true },
          { name: 'Extended Warranty (3 years)', available: true },
          { name: '24/7 Support', available: false }
        ],
        includedServices: [
          'Site preparation & surveying',
          'Advanced foundation work',
          'Premium structural construction',
          'Custom interior finishing',
          'Landscaping basics',
          'Project tracking portal access',
          'Regular progress updates'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 'Starting at ETB 2,500,000',
        priceValue: 2500000,
        description: 'Full-service luxury construction with premium features',
        timeline: '12-24 months',
        recommended: false,
        features: [
          { name: 'Project Planning & Design', available: true },
          { name: 'Basic Materials', available: true },
          { name: 'Standard Construction', available: true },
          { name: 'Quality Inspection', available: true },
          { name: 'Basic Warranty (1 year)', available: true },
          { name: 'Premium Materials', available: true },
          { name: 'Custom Design Services', available: true },
          { name: 'Project Management Software', available: true },
          { name: 'Extended Warranty (5 years)', available: true },
          { name: '24/7 Support', available: true }
        ],
        includedServices: [
          'Complete site development',
          'Premium foundation & structural work',
          'Luxury materials & finishes',
          'Custom architectural design',
          'Full landscaping & exterior work',
          'Smart home integration',
          'Dedicated project manager',
          'Priority support & maintenance',
          'Post-completion consultation'
        ]
      }
    ];
  }
  
  /**
   * Initialize the service comparison module
   */
  init() {
    this.render();
    this.attachEventListeners();
  }
  
  /**
   * Render the service comparison table
   */
  render() {
    this.container.innerHTML = '';
    
    this.serviceTiers.forEach(tier => {
      const tierCard = this.createTierCard(tier);
      this.container.appendChild(tierCard);
    });
  }
  
  /**
   * Create a tier card element
   * @param {Object} tier - Service tier data
   * @returns {HTMLElement} Tier card element
   */
  createTierCard(tier) {
    const card = document.createElement('div');
    card.className = 'tier-card';
    card.dataset.tierId = tier.id;
    
    if (tier.recommended) {
      card.classList.add('recommended');
    }
    
    if (this.selectedTierId === tier.id) {
      card.classList.add('selected');
    }
    
    // Tier header
    const header = document.createElement('div');
    header.className = 'tier-header';
    header.innerHTML = `
      <div class="tier-name">${tier.name}</div>
      <div class="tier-price">${tier.price}</div>
      <div class="tier-price-unit">${tier.timeline}</div>
    `;
    card.appendChild(header);
    
    // Tier description
    const description = document.createElement('div');
    description.className = 'tier-description';
    description.textContent = tier.description;
    card.appendChild(description);
    
    // Feature list
    const featureList = document.createElement('ul');
    featureList.className = 'feature-list';
    
    tier.features.forEach(feature => {
      const featureItem = document.createElement('li');
      featureItem.className = 'feature-item';
      
      const icon = document.createElement('i');
      icon.className = `fas feature-icon ${feature.available ? 'fa-check-circle available' : 'fa-times-circle unavailable'}`;
      
      const text = document.createElement('span');
      text.className = `feature-text ${!feature.available ? 'unavailable' : ''}`;
      text.textContent = feature.name;
      
      featureItem.appendChild(icon);
      featureItem.appendChild(text);
      featureList.appendChild(featureItem);
    });
    
    card.appendChild(featureList);
    
    // Select button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'select-tier-btn';
    selectBtn.textContent = this.selectedTierId === tier.id ? 'Selected' : 'Select This Tier';
    selectBtn.dataset.tierId = tier.id;
    
    if (this.selectedTierId === tier.id) {
      selectBtn.classList.add('selected');
    }
    
    card.appendChild(selectBtn);
    
    // Get Quote button (only show for selected tier)
    if (this.selectedTierId === tier.id) {
      const quoteBtn = document.createElement('button');
      quoteBtn.className = 'get-quote-btn';
      quoteBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Get Quote for ' + tier.name;
      quoteBtn.dataset.tierId = tier.id;
      card.appendChild(quoteBtn);
    }
    
    return card;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Select tier buttons
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('select-tier-btn')) {
        const tierId = e.target.dataset.tierId;
        this.selectTier(tierId);
      }
      
      // Get quote buttons
      if (e.target.classList.contains('get-quote-btn') || e.target.closest('.get-quote-btn')) {
        const btn = e.target.classList.contains('get-quote-btn') ? e.target : e.target.closest('.get-quote-btn');
        const tierId = btn.dataset.tierId;
        this.navigateToQuote(tierId);
      }
    });
  }
  
  /**
   * Select a service tier
   * @param {string} tierId - ID of the tier to select
   */
  selectTier(tierId) {
    this.selectedTierId = tierId;
    this.storeSelection(tierId);
    this.highlightTier(tierId);
    this.render(); // Re-render to show Get Quote button
  }
  
  /**
   * Highlight the selected tier
   * @param {string} tierId - ID of the tier to highlight
   */
  highlightTier(tierId) {
    // Remove previous selection
    const allCards = this.container.querySelectorAll('.tier-card');
    allCards.forEach(card => {
      card.classList.remove('selected');
    });
    
    // Add selection to chosen tier
    const selectedCard = this.container.querySelector(`[data-tier-id="${tierId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
  }
  
  /**
   * Navigate to quote form with pre-filled service
   * @param {string} tierId - ID of the selected tier
   */
  navigateToQuote(tierId) {
    const tier = this.serviceTiers.find(t => t.id === tierId);
    if (!tier) {
      console.error('Tier not found:', tierId);
      return;
    }
    
    // Store the selected service for pre-filling
    sessionStorage.setItem('prefilledService', tier.name);
    
    // Navigate to quote form (assuming it exists at this path)
    // Adjust the path based on your actual quote form location
    window.location.href = 'index.html#contact';
  }
  
  /**
   * Store tier selection in session storage
   * @param {string} tierId - ID of the tier to store
   */
  storeSelection(tierId) {
    sessionStorage.setItem('selectedServiceTier', tierId);
  }
  
  /**
   * Get stored tier selection from session storage
   * @returns {string|null} Stored tier ID or null
   */
  getStoredSelection() {
    return sessionStorage.getItem('selectedServiceTier');
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServiceComparison;
}
