/**
 * Advanced Admin Dashboard Features
 * Notification system, global search, dark mode, and more
 */

const AdminDashboardAdvanced = {
  notifications: [],
  darkMode: false,
  
  /**
   * Initialize advanced features
   */
  init() {
    this.initNotifications();
    this.initGlobalSearch();
    this.initDarkMode();
    this.initKeyboardShortcuts();
    this.initQuickActions();
  },

  /**
   * Initialize notification system
   */
  initNotifications() {
    // Load notifications from storage
    this.notifications = StorageUtil.get('admin_notifications', []);
    this.updateNotificationBadge();
    
    // Check for new notifications every 30 seconds
    setInterval(() => {
      this.checkNewNotifications();
    }, 30000);
  },

  /**
   * Add new notification
   */
  addNotification(type, title, message, link = null) {
    const notification = {
      id: 'notif_' + Date.now(),
      type, // success, info, warning, error
      title,
      message,
      link,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.notifications.unshift(notification);
    StorageUtil.set('admin_notifications', this.notifications);
    this.updateNotificationBadge();
    
    // Show toast notification
    this.showToast(type, title, message);
    
    // Play sound for important notifications
    if (type === 'error' || type === 'warning') {
      this.playNotificationSound();
    }
  },

  /**
   * Update notification badge count
   */
  updateNotificationBadge() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
