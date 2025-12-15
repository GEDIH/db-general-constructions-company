/**
 * Admin Dashboard Module
 * Handles dashboard metrics, data loading, and display
 */

const AdminDashboard = {
  /**
   * Initialize the admin dashboard
   */
  init() {
    this.loadMetrics();
    this.loadRecentActivities();
    this.setupAutoRefresh();
  },

  /**
   * Load and display dashboard metrics
   */
  async loadMetrics() {
    const metrics = await this.calculateMetrics();
    this.displayMetrics(metrics);
  },

  /**
   * Calculate dashboard metrics from stored data
   * @returns {object} - Metrics object
   */
  async calculateMetrics() {
    // Get data from API instead of storage
    let projects = [];
    let users = [];
    let quotes = [];
    let subscribers = [];
    
    try {
      // Load projects from API
      const projectsResponse = await API.projects.getAll();
      if (projectsResponse.success) {
        projects = projectsResponse.data;
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to storage if API fails
      projects = StorageUtil.get(CONFIG.STORAGE_KEYS.PROJECTS, []);
    }
    
    try {
      // Load users from API
      const usersResponse = await API.users.getAll();
      if (usersResponse.success) {
        users = usersResponse.data;
      }
    } catch (error) {
      console.error('Error loading users:', error);
      users = StorageUtil.get(CONFIG.STORAGE_KEYS.USERS, []);
    }
    
    try {
      // Load quotes from API
      const quotesResponse = await API.quotes.getAll();
      if (quotesResponse.success) {
        quotes = quotesResponse.data;
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      quotes = StorageUtil.get('db_quote_requests', []);
    }
    
    try {
      // Load newsletter subscribers from API
      const subscribersResponse = await API.newsletter.getAll();
      if (subscribersResponse.success) {
        subscribers = subscribersResponse.data;
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      subscribers = StorageUtil.get(CONFIG.STORAGE_KEYS.NEWSLETTER_SUBS, []);
    }
    
    const estimates = StorageUtil.get(CONFIG.STORAGE_KEYS.ESTIMATES, []);
    
    // Calculate active projects
    const activeProjects = projects.filter(p => 
      p.status === 'active' || p.status === 'in-progress'
    ).length;
    
    // Calculate total visitors (simulated - would come from analytics)
    const totalVisitors = this.getVisitorCount();
    
    // Calculate pending quote requests
    const pendingQuotes = quotes.filter(q => q.status === 'pending').length;
    
    // Calculate recent user activities
    const recentActivities = this.getRecentActivities();
    
    // Calculate revenue (from completed projects)
    const revenue = this.calculateRevenue(projects);
    
    return {
      totalVisitors,
      activeProjects,
      pendingQuotes,
      revenue,
      totalClients: users.filter(u => u.role === 'client').length,
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalEstimates: estimates.length,
      totalSubscribers: subscribers.filter(s => s.status === 'confirmed').length,
      recentActivities
    };
  },

  /**
   * Display metrics on dashboard
   * @param {object} metrics - Metrics to display
   */
  displayMetrics(metrics) {
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
      // Active Projects
      statCards[0].querySelector('h3').textContent = metrics.activeProjects;
      
      // Total Clients
      statCards[1].querySelector('h3').textContent = metrics.totalClients;
      
      // New Inquiries (pending quotes)
      statCards[2].querySelector('h3').textContent = metrics.pendingQuotes;
      
      // Revenue
      statCards[3].querySelector('h3').textContent = this.formatCurrency(metrics.revenue);
    }
  },

  /**
   * Get visitor count (simulated)
   * @returns {number} - Visitor count
   */
  getVisitorCount() {
    // In production, this would come from analytics service
    const storedCount = StorageUtil.get('db_visitor_count', 0);
    
    // Simulate visitor count growth
    const today = new Date().toDateString();
    const lastUpdate = StorageUtil.get('db_visitor_last_update', '');
    
    if (lastUpdate !== today) {
      // Add random visitors for new day
      const newVisitors = Math.floor(Math.random() * 50) + 20;
      const newCount = storedCount + newVisitors;
      StorageUtil.set('db_visitor_count', newCount);
      StorageUtil.set('db_visitor_last_update', today);
      return newCount;
    }
    
    return storedCount;
  },

  /**
   * Calculate total revenue from projects
   * @param {array} projects - Projects array
   * @returns {number} - Total revenue
   */
  calculateRevenue(projects) {
    // Extract revenue from completed projects
    return projects
      .filter(p => p.status === 'completed')
      .reduce((total, project) => {
        // Parse budget string (e.g., "15M ETB" -> 15000000)
        const budgetStr = project.budget || project.cost || '0';
        const amount = this.parseCurrency(budgetStr);
        return total + amount;
      }, 0);
  },

  /**
   * Parse currency string to number
   * @param {string} currencyStr - Currency string (e.g., "15M ETB")
   * @returns {number} - Parsed amount
   */
  parseCurrency(currencyStr) {
    if (typeof currencyStr === 'number') return currencyStr;
    
    const str = currencyStr.toString().toUpperCase();
    const match = str.match(/([\d.]+)\s*([KMB])?/);
    
    if (!match) return 0;
    
    let amount = parseFloat(match[1]);
    const multiplier = match[2];
    
    if (multiplier === 'K') amount *= 1000;
    else if (multiplier === 'M') amount *= 1000000;
    else if (multiplier === 'B') amount *= 1000000000;
    
    return amount;
  },

  /**
   * Format number as currency
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M ETB';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K ETB';
    }
    return amount.toFixed(0) + ' ETB';
  },

  /**
   * Get recent activities
   * @returns {array} - Recent activities
   */
  getRecentActivities() {
    const activities = StorageUtil.get('db_recent_activities', []);
    
    // If no activities, create some sample ones
    if (activities.length === 0) {
      const sampleActivities = [
        {
          id: 1,
          type: 'project_update',
          message: 'Project "Commercial Tower" updated to 75% completion',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Admin'
        },
        {
          id: 2,
          type: 'new_quote',
          message: 'New quote request from John Doe',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: 'System'
        },
        {
          id: 3,
          type: 'new_subscriber',
          message: 'New newsletter subscriber: jane@example.com',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: 'System'
        }
      ];
      
      StorageUtil.set('db_recent_activities', sampleActivities);
      return sampleActivities;
    }
    
    // Return most recent 10 activities
    return activities.slice(0, 10);
  },

  /**
   * Load and display recent activities
   */
  loadRecentActivities() {
    const activities = this.getRecentActivities();
    // Activities display would be implemented in the UI
    // For now, just log them
    console.log('Recent activities:', activities);
  },

  /**
   * Setup auto-refresh for metrics
   */
  setupAutoRefresh() {
    // Refresh metrics every 5 minutes
    setInterval(() => {
      this.loadMetrics();
    }, 5 * 60 * 1000);
  },

  /**
   * Log admin action for audit trail
   * @param {string} action - Action type
   * @param {string} targetType - Type of target (project, user, etc.)
   * @param {string} targetId - ID of target
   * @param {object} details - Additional details
   */
  logAction(action, targetType, targetId, details = {}) {
    // Use the AuditLog module for logging
    if (typeof AuditLog !== 'undefined') {
      return AuditLog.logAction(action, targetType, targetId, details);
    }
    
    // Fallback to old implementation if AuditLog module not loaded
    const currentUser = AuthUtil.getCurrentUser();
    if (!currentUser) return;
    
    const auditLog = StorageUtil.get(CONFIG.STORAGE_KEYS.AUDIT_LOG, []);
    
    const logEntry = {
      id: 'audit_' + Date.now(),
      adminId: currentUser.id,
      adminName: currentUser.name,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1' // Would be actual IP in production
    };
    
    auditLog.unshift(logEntry);
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
      auditLog.splice(1000);
    }
    
    StorageUtil.set(CONFIG.STORAGE_KEYS.AUDIT_LOG, auditLog);
  },

  /**
   * Add activity to recent activities feed
   * @param {string} type - Activity type
   * @param {string} message - Activity message
   */
  addActivity(type, message) {
    const currentUser = AuthUtil.getCurrentUser();
    const activities = StorageUtil.get('db_recent_activities', []);
    
    const activity = {
      id: 'activity_' + Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.name : 'System'
    };
    
    activities.unshift(activity);
    
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.splice(50);
    }
    
    StorageUtil.set('db_recent_activities', activities);
  },

  /**
   * Get analytics data for specified time period
   * @param {string} period - Time period (day, week, month, year)
   * @returns {object} - Analytics data
   */
  getAnalyticsData(period) {
    // In production, this would fetch from analytics service
    // For now, return mock data
    const data = {
      day: {
        labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
        visitors: [45, 32, 28, 65, 120, 145, 98, 76],
        pageViews: [89, 67, 54, 132, 245, 298, 187, 145]
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        visitors: [450, 520, 480, 590, 610, 380, 290],
        pageViews: [890, 1020, 945, 1180, 1250, 720, 580]
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        visitors: [1850, 2100, 1950, 2300],
        pageViews: [3700, 4200, 3900, 4600]
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        visitors: [5200, 5800, 6100, 6500, 7200, 7800, 8100, 8500, 8200, 8800, 9100, 9500],
        pageViews: [10400, 11600, 12200, 13000, 14400, 15600, 16200, 17000, 16400, 17600, 18200, 19000]
      }
    };
    
    return data[period] || data.month;
  },

  /**
   * Get popular pages analytics
   * @returns {object} - Popular pages data
   */
  getPopularPages() {
    return {
      labels: ['Home', 'Projects', 'Services', 'About', 'Contact', 'Cost Calculator', 'Gallery'],
      data: [3500, 2800, 2100, 1800, 1500, 1200, 950]
    };
  },

  /**
   * Get conversion rates data
   * @returns {object} - Conversion rates data
   */
  getConversionRates() {
    return {
      labels: ['Quote Requests', 'Newsletter Signups', 'Project Inquiries', 'Cost Estimates', 'Other'],
      data: [35, 28, 22, 12, 3]
    };
  },

  /**
   * Track page view for analytics
   * @param {string} pageName - Name of the page
   */
  trackPageView(pageName) {
    const pageViews = StorageUtil.get('db_page_views', {});
    const today = new Date().toDateString();
    
    if (!pageViews[today]) {
      pageViews[today] = {};
    }
    
    if (!pageViews[today][pageName]) {
      pageViews[today][pageName] = 0;
    }
    
    pageViews[today][pageName]++;
    StorageUtil.set('db_page_views', pageViews);
  },

  /**
   * Get analytics summary for time period
   * @param {string} period - Time period
   * @returns {object} - Analytics summary
   */
  getAnalyticsSummary(period) {
    const data = this.getAnalyticsData(period);
    const totalPageViews = data.pageViews.reduce((a, b) => a + b, 0);
    const totalVisitors = data.visitors.reduce((a, b) => a + b, 0);
    
    return {
      totalPageViews,
      totalVisitors,
      avgSessionDuration: Math.floor(Math.random() * 5) + 3, // minutes
      bounceRate: Math.floor(Math.random() * 20) + 30 // percentage
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminDashboard;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
  window.AdminDashboard = AdminDashboard;
}

/**
 * Initialize action button system
 * Verifies dependencies and binds buttons in all panels
 * @returns {object} - Initialization result
 * Requirements: 10.1, 10.2, 10.3, 10.4 - Debug logging throughout initialization
 */
function initializeActionButtons() {
  console.log('Initializing action button system...');
  
  if (window.DebugLogger) {
    window.DebugLogger.log('INIT', 'Starting action button system initialization');
  }
  
  const result = {
    success: false,
    timestamp: new Date(),
    dependencies: {
      AdminCRUD: false,
      AdminActionButtons: false,
      AdminActionHandlers: false,
      ActionButtonBinder: false
    },
    boundButtons: 0,
    errors: []
  };

  try {
    // Step 1: Verify dependencies
    console.log('Step 1: Verifying dependencies...');
    
    if (window.DebugLogger) {
      window.DebugLogger.log('INIT', 'Verifying dependencies...');
    }
    
    if (typeof AdminCRUD === 'undefined') {
      const error = 'AdminCRUD module not loaded';
      console.error('❌', error);
      result.errors.push(error);
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error(error));
      }
    } else {
      result.dependencies.AdminCRUD = true;
      console.log('✓ AdminCRUD module loaded');
      if (window.DebugLogger) {
        window.DebugLogger.log('INIT', '✓ AdminCRUD module verified');
      }
    }

    if (typeof AdminActionButtons === 'undefined') {
      const error = 'AdminActionButtons module not loaded';
      console.error('❌', error);
      result.errors.push(error);
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error(error));
      }
    } else {
      result.dependencies.AdminActionButtons = true;
      console.log('✓ AdminActionButtons module loaded');
      if (window.DebugLogger) {
        window.DebugLogger.log('INIT', '✓ AdminActionButtons module verified');
      }
    }

    if (typeof window.AdminActionHandlers === 'undefined') {
      const error = 'AdminActionHandlers module not loaded';
      console.error('❌', error);
      result.errors.push(error);
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error(error));
      }
    } else {
      result.dependencies.AdminActionHandlers = true;
      console.log('✓ AdminActionHandlers module loaded');
      if (window.DebugLogger) {
        window.DebugLogger.log('INIT', '✓ AdminActionHandlers module verified');
      }
    }

    if (typeof window.ActionButtonBinder === 'undefined') {
      const error = 'ActionButtonBinder not available';
      console.error('❌', error);
      result.errors.push(error);
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error(error));
      }
    } else {
      result.dependencies.ActionButtonBinder = true;
      console.log('✓ ActionButtonBinder available');
      if (window.DebugLogger) {
        window.DebugLogger.log('INIT', '✓ ActionButtonBinder verified');
      }
    }

    // Step 2: Check if all dependencies are loaded
    const allDependenciesLoaded = Object.values(result.dependencies).every(dep => dep === true);
    
    if (!allDependenciesLoaded) {
      console.error('❌ Not all dependencies are loaded. Cannot initialize action buttons.');
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error('Missing dependencies'), result.dependencies);
      }
      result.success = false;
      return result;
    }

    console.log('✓ All dependencies verified successfully');
    if (window.DebugLogger) {
      window.DebugLogger.log('INIT', 'All dependencies verified successfully');
    }

    // Step 3: Bind buttons in all initial panels
    console.log('Step 2: Binding action buttons in all panels...');
    if (window.DebugLogger) {
      window.DebugLogger.log('INIT', 'Starting button binding for all panels');
    }
    
    const panels = [
      'projectsPanel',
      'clientsPanel',
      'teamMembersPanel',
      'inquiriesPanel',
      'blogPostsPanel',
      'testimonialsPanel',
      'servicesPanel',
      'invoicesPanel',
      'schedulePanel',
      'quotesPanel'
    ];

    let totalBound = 0;

    panels.forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) {
        try {
          if (window.DebugLogger) {
            window.DebugLogger.log('INIT', `Binding buttons in panel: ${panelId}`);
          }
          const boundCount = window.ActionButtonBinder.bindButtons(panel);
          totalBound += boundCount;
          console.log(`✓ Bound ${boundCount} buttons in ${panelId}`);
        } catch (error) {
          const errorMsg = `Error binding buttons in ${panelId}: ${error.message}`;
          console.error('❌', errorMsg);
          result.errors.push(errorMsg);
          if (window.DebugLogger) {
            window.DebugLogger.logError('INIT', error, { panelId });
          }
        }
      } else {
        console.log(`ℹ Panel ${panelId} not found (may not be on this page)`);
        if (window.DebugLogger) {
          window.DebugLogger.log('INIT', `Panel not found: ${panelId}`);
        }
      }
    });

    result.boundButtons = totalBound;
    console.log(`✓ Total buttons bound: ${totalBound}`);
    if (window.DebugLogger) {
      window.DebugLogger.log('INIT', `Total buttons bound: ${totalBound}`);
    }

    // Step 4: Verify handler functions are accessible
    console.log('Step 3: Verifying handler functions...');
    if (window.DebugLogger) {
      window.DebugLogger.log('INIT', 'Verifying handler functions are accessible');
    }
    
    const requiredHandlers = [
      'viewProject', 'editProject', 'deleteProject',
      'viewClient', 'editClient', 'deleteClient',
      'viewTeamMember', 'editTeamMember', 'deleteTeamMember',
      'viewInquiry', 'respondInquiry', 'deleteInquiry'
    ];

    const missingHandlers = [];
    requiredHandlers.forEach(handlerName => {
      if (typeof window[handlerName] !== 'function') {
        missingHandlers.push(handlerName);
        if (window.DebugLogger) {
          window.DebugLogger.log('INIT', `❌ Handler not found: ${handlerName}`);
        }
      } else {
        if (window.DebugLogger) {
          window.DebugLogger.log('INIT', `✓ Handler verified: ${handlerName}`);
        }
      }
    });

    if (missingHandlers.length > 0) {
      const error = `Missing handler functions: ${missingHandlers.join(', ')}`;
      console.error('❌', error);
      result.errors.push(error);
      if (window.DebugLogger) {
        window.DebugLogger.logError('INIT', new Error(error), { missingHandlers });
      }
    } else {
      console.log('✓ All required handler functions are accessible');
      if (window.DebugLogger) {
        window.DebugLogger.log('INIT', 'All required handler functions verified');
      }
    }

    // Step 5: Set success status
    result.success = result.errors.length === 0;

    if (result.success) {
      console.log('✅ Action button system initialized successfully!');
      console.log(`   - Dependencies verified: ${Object.keys(result.dependencies).length}`);
      console.log(`   - Buttons bound: ${result.boundButtons}`);
      console.log(`   - Handler functions verified: ${requiredHandlers.length}`);
      
      if (window.DebugLogger) {
        window.DebugLogger.logInit('ActionButtonSystem', true, {
          dependencies: Object.keys(result.dependencies).length,
          boundButtons: result.boundButtons,
          handlersVerified: requiredHandlers.length,
          timestamp: result.timestamp
        });
      }
    } else {
      console.error('❌ Action button system initialization completed with errors:');
      result.errors.forEach(error => console.error(`   - ${error}`));
      
      if (window.DebugLogger) {
        window.DebugLogger.logInit('ActionButtonSystem', false, {
          errors: result.errors,
          timestamp: result.timestamp
        });
      }
    }

  } catch (error) {
    console.error('❌ Critical error during action button initialization:', error);
    result.errors.push(`Critical error: ${error.message}`);
    result.success = false;
    
    if (window.DebugLogger) {
      window.DebugLogger.logError('INIT', error, { result });
    }
  }

  // Store initialization result globally for debugging
  window.ActionButtonInitResult = result;
  
  if (window.DebugLogger) {
    window.DebugLogger.log('INIT', 'Initialization result stored in window.ActionButtonInitResult', result);
  }

  return result;
}

// Make initializeActionButtons available globally
window.initializeActionButtons = initializeActionButtons;

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the admin dashboard page
    if (window.location.pathname.includes('admin-dashboard')) {
      AdminDashboard.init();
      
      // Initialize action buttons after a short delay to ensure all modules are loaded
      setTimeout(() => {
        initializeActionButtons();
      }, 500);
    }
  });
}
