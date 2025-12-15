/**
 * Cost Calculator Module
 * Handles construction cost estimation with detailed breakdown
 */

class CostCalculator {
  constructor(containerId = null) {
    this.container = containerId ? document.getElementById(containerId) : document;
    this.form = this.container.querySelector('#costCalculatorForm');
    this.resultCard = this.container.querySelector('#resultCard');
    this.loadingSpinner = this.container.querySelector('#loadingSpinner');
    this.errorMessage = this.container.querySelector('#errorMessage');
    this.currentEstimate = null;

    this.init();
  }

  /**
   * Initialize the calculator
   */
  init() {
    if (!this.form) {
      console.error('Cost calculator form not found');
      return;
    }

    // Set up event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Save estimate button
    const saveBtn = document.getElementById('saveEstimateBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveEstimate());
    }

    // Email estimate button
    const emailBtn = document.getElementById('emailEstimateBtn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => this.showEmailModal());
    }

    // Print estimate button
    const printBtn = document.getElementById('printEstimateBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => this.printEstimate());
    }

    // Download PDF button
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => this.downloadPdf());
    }

    // Send email button in modal
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
      sendEmailBtn.addEventListener('click', () => this.emailEstimate());
    }

    // Project type change handler (for conditional fields)
    const projectTypeSelect = document.getElementById('projectType');
    if (projectTypeSelect) {
      projectTypeSelect.addEventListener('change', (e) => this.handleProjectTypeChange(e));
    }

    console.log('Cost Calculator initialized');
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Hide previous results and errors
    this.hideResults();
    this.hideError();

    // Validate form
    if (!this.form.checkValidity()) {
      this.form.classList.add('was-validated');
      return;
    }

    // Get form data
    const projectData = this.getFormData();

    // Validate inputs
    const validation = this.validateInputs(projectData);
    if (!validation.isValid) {
      this.showError(validation.message);
      return;
    }

    // Show loading
    this.showLoading();

    try {
      // Calculate estimate (with simulated delay)
      await this.delay(1500);
      const estimate = await this.calculateEstimate(projectData);

      // Store current estimate
      this.currentEstimate = estimate;

      // Display results
      this.displayResults(estimate);

      // Hide loading
      this.hideLoading();

    } catch (error) {
      console.error('Calculation error:', error);
      this.hideLoading();
      this.showError('An error occurred while calculating the estimate. Please try again.');
    }
  }

  /**
   * Get form data
   * @returns {object} - Project data from form
   */
  getFormData() {
    const formData = new FormData(this.form);
    
    // Get selected materials
    const materials = [];
    const materialCheckboxes = this.form.querySelectorAll('input[name="materials"]:checked');
    materialCheckboxes.forEach(checkbox => materials.push(checkbox.value));

    return {
      projectType: formData.get('projectType'),
      projectSize: parseFloat(formData.get('projectSize')),
      sizeUnit: formData.get('sizeUnit'),
      floors: parseInt(formData.get('floors')) || 1,
      region: formData.get('region'),
      city: formData.get('city'),
      materials: materials,
      notes: formData.get('notes') || ''
    };
  }

  /**
   * Validate project inputs
   * @param {object} projectData - Project data to validate
   * @returns {object} - Validation result
   */
  validateInputs(projectData) {
    // Check required fields
    if (!projectData.projectType) {
      return { isValid: false, message: 'Please select a project type' };
    }

    if (!projectData.projectSize || projectData.projectSize <= 0) {
      return { isValid: false, message: 'Please enter a valid project size greater than 0' };
    }

    if (projectData.projectSize > 100000) {
      return { isValid: false, message: 'Project size cannot exceed 100,000 square meters' };
    }

    if (!projectData.region) {
      return { isValid: false, message: 'Please select a region' };
    }

    if (!projectData.city || projectData.city.trim() === '') {
      return { isValid: false, message: 'Please enter a city or town' };
    }

    if (projectData.floors < 1 || projectData.floors > 50) {
      return { isValid: false, message: 'Number of floors must be between 1 and 50' };
    }

    return { isValid: true };
  }

  /**
   * Calculate cost estimate with breakdown
   * @param {object} projectData - Project data
   * @returns {Promise<object>} - Cost estimate with breakdown
   */
  async calculateEstimate(projectData) {
    // Convert size to square meters if needed
    let sizeInSqm = projectData.projectSize;
    if (projectData.sizeUnit === 'sqft') {
      sizeInSqm = projectData.projectSize * 0.092903; // Convert sqft to sqm
    }

    // Base cost per square meter by project type (in ETB)
    const baseCosts = {
      residential: 8000,
      commercial: 12000,
      industrial: 10000,
      renovation: 6000
    };

    const baseCostPerSqm = baseCosts[projectData.projectType] || 8000;

    // Regional cost multipliers
    const regionalMultipliers = {
      'addis-ababa': 1.2,
      'oromia': 1.0,
      'amhara': 0.95,
      'tigray': 0.9,
      'somali': 0.85,
      'afar': 0.85,
      'southern': 0.9,
      'other': 0.9
    };

    const regionalMultiplier = regionalMultipliers[projectData.region] || 1.0;

    // Floor multiplier (more floors = slightly higher cost per sqm)
    const floorMultiplier = 1 + (projectData.floors - 1) * 0.05;

    // Material premium multipliers
    const materialPremiums = {
      concrete: 1.0,
      steel: 1.3,
      brick: 0.9,
      wood: 1.1,
      tiles: 1.0,
      marble: 1.5,
      glass: 1.4,
      paint: 1.0
    };

    let materialMultiplier = 1.0;
    if (projectData.materials.length > 0) {
      const premiums = projectData.materials.map(m => materialPremiums[m] || 1.0);
      materialMultiplier = premiums.reduce((a, b) => a + b, 0) / premiums.length;
    }

    // Calculate base cost
    const adjustedCostPerSqm = baseCostPerSqm * regionalMultiplier * floorMultiplier * materialMultiplier;
    const totalBaseCost = adjustedCostPerSqm * sizeInSqm;

    // Calculate breakdown by category
    const breakdown = this.calculateBreakdown(totalBaseCost, projectData);

    // Calculate total with contingency
    const subtotal = breakdown.materials + breakdown.labor + breakdown.equipment + breakdown.permits;
    const contingency = subtotal * 0.15; // 15% contingency
    const total = subtotal + contingency;

    // Calculate cost range (min/max)
    const minCost = total * 0.85; // -15%
    const maxCost = total * 1.15; // +15%

    return {
      id: this.generateEstimateId(),
      projectType: projectData.projectType,
      size: projectData.projectSize,
      sizeUnit: projectData.sizeUnit,
      location: `${projectData.city}, ${projectData.region}`,
      materials: projectData.materials,
      estimatedCost: {
        min: Math.round(minCost),
        max: Math.round(maxCost)
      },
      breakdown: {
        materials: Math.round(breakdown.materials),
        labor: Math.round(breakdown.labor),
        equipment: Math.round(breakdown.equipment),
        permits: Math.round(breakdown.permits),
        contingency: Math.round(contingency)
      },
      total: Math.round(total),
      createdAt: new Date().toISOString(),
      userEmail: null
    };
  }

  /**
   * Calculate cost breakdown by category
   * @param {number} totalBaseCost - Total base cost
   * @param {object} projectData - Project data
   * @returns {object} - Cost breakdown
   */
  calculateBreakdown(totalBaseCost, projectData) {
    // Standard breakdown percentages
    let materialsPercent = 0.40; // 40% materials
    let laborPercent = 0.35;     // 35% labor
    let equipmentPercent = 0.15; // 15% equipment
    let permitsPercent = 0.10;   // 10% permits

    // Adjust based on project type
    if (projectData.projectType === 'industrial') {
      equipmentPercent = 0.25;
      materialsPercent = 0.35;
      laborPercent = 0.30;
    } else if (projectData.projectType === 'renovation') {
      laborPercent = 0.45;
      materialsPercent = 0.35;
      equipmentPercent = 0.10;
    }

    return {
      materials: totalBaseCost * materialsPercent,
      labor: totalBaseCost * laborPercent,
      equipment: totalBaseCost * equipmentPercent,
      permits: totalBaseCost * permitsPercent
    };
  }

  /**
   * Display calculation results
   * @param {object} estimate - Cost estimate
   */
  displayResults(estimate) {
    // Update cost range
    const costRangeEl = document.getElementById('costRange');
    if (costRangeEl) {
      costRangeEl.textContent = `ETB ${this.formatCurrency(estimate.estimatedCost.min)} - ETB ${this.formatCurrency(estimate.estimatedCost.max)}`;
    }

    // Update breakdown
    document.getElementById('costMaterials').textContent = `ETB ${this.formatCurrency(estimate.breakdown.materials)}`;
    document.getElementById('costLabor').textContent = `ETB ${this.formatCurrency(estimate.breakdown.labor)}`;
    document.getElementById('costEquipment').textContent = `ETB ${this.formatCurrency(estimate.breakdown.equipment)}`;
    document.getElementById('costPermits').textContent = `ETB ${this.formatCurrency(estimate.breakdown.permits)}`;
    document.getElementById('costContingency').textContent = `ETB ${this.formatCurrency(estimate.breakdown.contingency)}`;
    document.getElementById('costTotal').textContent = `ETB ${this.formatCurrency(estimate.total)}`;

    // Show result card
    this.resultCard.classList.add('show');
    
    // Scroll to results
    this.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Save estimate to database and local storage
   */
  async saveEstimate() {
    if (!this.currentEstimate) {
      alert('No estimate to save');
      return;
    }

    try {
      // Try to save to database first
      if (typeof API !== 'undefined' && API.costEstimates) {
        // Prepare data for API
        const estimateData = {
          estimate_id: this.currentEstimate.id,
          project_type: this.currentEstimate.projectType,
          project_size: this.currentEstimate.size,
          size_unit: this.currentEstimate.sizeUnit,
          location: this.currentEstimate.location,
          materials: this.currentEstimate.materials,
          estimated_cost_min: this.currentEstimate.estimatedCost.min,
          estimated_cost_max: this.currentEstimate.estimatedCost.max,
          breakdown: {
            materials: this.currentEstimate.breakdown.materials,
            labor: this.currentEstimate.breakdown.labor,
            equipment: this.currentEstimate.breakdown.equipment,
            permits: this.currentEstimate.breakdown.permits,
            contingency: this.currentEstimate.breakdown.contingency
          },
          total_cost: this.currentEstimate.total,
          user_email: this.currentEstimate.userEmail,
          user_name: null,
          notes: null,
          status: 'pending'
        };

        const response = await API.costEstimates.create(estimateData);
        
        if (response.success) {
          alert('Estimate saved successfully to database!');
        } else {
          throw new Error(response.message || 'Failed to save to database');
        }
      } else {
        // Fallback to localStorage if API not available
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      
      // Fallback to localStorage
      try {
        if (typeof StorageUtil !== 'undefined') {
          StorageUtil.saveEstimate(this.currentEstimate);
          alert('Estimate saved locally (database unavailable)');
        } else {
          const estimates = JSON.parse(localStorage.getItem('costEstimates') || '[]');
          estimates.push(this.currentEstimate);
          localStorage.setItem('costEstimates', JSON.stringify(estimates));
          alert('Estimate saved locally (database unavailable)');
        }
      } catch (localError) {
        console.error('Error saving locally:', localError);
        alert('Failed to save estimate. Please try again.');
      }
    }
  }

  /**
   * Show email modal
   */
  showEmailModal() {
    if (!this.currentEstimate) {
      alert('No estimate to email');
      return;
    }

    const modal = new bootstrap.Modal(document.getElementById('emailModal'));
    modal.show();
  }

  /**
   * Email estimate
   */
  emailEstimate() {
    const emailInput = document.getElementById('emailAddress');
    const nameInput = document.getElementById('emailName');

    if (!emailInput || !emailInput.value) {
      alert('Please enter an email address');
      return;
    }

    // Validate email
    if (typeof ValidationUtil !== 'undefined') {
      if (!ValidationUtil.validateEmail(emailInput.value)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    // Simulate email sending
    console.log('Sending estimate to:', emailInput.value);
    console.log('Estimate:', this.currentEstimate);

    // Update estimate with email
    this.currentEstimate.userEmail = emailInput.value;

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
    if (modal) {
      modal.hide();
    }

    // Show success message
    alert(`Estimate sent successfully to ${emailInput.value}!`);

    // Clear form
    emailInput.value = '';
    nameInput.value = '';
  }

  /**
   * Print estimate
   */
  printEstimate() {
    if (!this.currentEstimate) {
      alert('No estimate to print');
      return;
    }

    window.print();
  }

  /**
   * Download estimate as PDF
   */
  downloadPdf() {
    if (!this.currentEstimate) {
      alert('No estimate to download');
      return;
    }

    // Create a printable version of the estimate
    const estimate = this.currentEstimate;
    const date = new Date(estimate.createdAt).toLocaleDateString();
    
    // Generate HTML content for PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cost Estimate - ${estimate.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #007bff; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; display: inline-block; width: 150px; }
          .cost-range { font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #007bff; color: white; }
          .total-row { font-weight: bold; font-size: 18px; background-color: #f8f9fa; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DB GENERAL CONSTRUCTION PLC</h1>
          <h2>Construction Cost Estimate</h2>
        </div>
        
        <div class="info-section">
          <div class="info-row"><span class="label">Estimate ID:</span> ${estimate.id}</div>
          <div class="info-row"><span class="label">Date:</span> ${date}</div>
          <div class="info-row"><span class="label">Project Type:</span> ${estimate.projectType.charAt(0).toUpperCase() + estimate.projectType.slice(1)}</div>
          <div class="info-row"><span class="label">Project Size:</span> ${estimate.size} ${estimate.sizeUnit}</div>
          <div class="info-row"><span class="label">Location:</span> ${estimate.location}</div>
          ${estimate.materials.length > 0 ? `<div class="info-row"><span class="label">Materials:</span> ${estimate.materials.join(', ')}</div>` : ''}
        </div>
        
        <div class="cost-range">
          Estimated Cost: ETB ${this.formatCurrency(estimate.estimatedCost.min)} - ETB ${this.formatCurrency(estimate.estimatedCost.max)}
        </div>
        
        <h3>Cost Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount (ETB)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Materials</td>
              <td>${this.formatCurrency(estimate.breakdown.materials)}</td>
            </tr>
            <tr>
              <td>Labor</td>
              <td>${this.formatCurrency(estimate.breakdown.labor)}</td>
            </tr>
            <tr>
              <td>Equipment</td>
              <td>${this.formatCurrency(estimate.breakdown.equipment)}</td>
            </tr>
            <tr>
              <td>Permits & Fees</td>
              <td>${this.formatCurrency(estimate.breakdown.permits)}</td>
            </tr>
            <tr>
              <td>Contingency (15%)</td>
              <td>${this.formatCurrency(estimate.breakdown.contingency)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Estimated Cost</td>
              <td>ETB ${this.formatCurrency(estimate.total)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Note:</strong> This is an estimated cost based on current market rates and the specifications provided. 
          Actual costs may vary based on site conditions, material availability, and other factors. 
          Please contact us for a detailed quote.</p>
          <p>DB General Construction PLC | Phone: +251-9115-9012 | Email: support@construct.com</p>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cost-Estimate-${estimate.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Estimate downloaded! Open the HTML file and use your browser\'s "Print to PDF" feature to save as PDF.');
  }

  /**
   * Handle project type change
   */
  handleProjectTypeChange(e) {
    // Can be used to show/hide conditional fields based on project type
    console.log('Project type changed to:', e.target.value);
  }

  /**
   * Show loading spinner
   */
  showLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.add('show');
    }
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    if (this.loadingSpinner) {
      this.loadingSpinner.classList.remove('show');
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    if (this.errorMessage) {
      const errorText = this.errorMessage.querySelector('#errorText');
      if (errorText) {
        errorText.textContent = message;
      }
      this.errorMessage.classList.add('show');
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.errorMessage) {
      this.errorMessage.classList.remove('show');
    }
  }

  /**
   * Hide results
   */
  hideResults() {
    if (this.resultCard) {
      this.resultCard.classList.remove('show');
    }
  }

  /**
   * Format currency with thousands separator
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatCurrency(amount) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Generate unique estimate ID
   * @returns {string} - Unique ID
   */
  generateEstimateId() {
    return `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper for async operations
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} - Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const calculator = new CostCalculator();
  console.log('Cost Calculator initialized successfully');
});