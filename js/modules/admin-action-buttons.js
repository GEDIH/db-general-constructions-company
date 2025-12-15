/**
 * Admin Action Buttons Module
 * Handles all View, Edit, Delete actions with modern modals
 */

const AdminActionButtons = (function() {
    'use strict';

    /**
     * Create and show a modern modal
     */
    function showModal(title, content, actions = []) {
        // Remove existing modal if any
        const existingModal = document.getElementById('dynamicActionModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="dynamicActionModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content modal-modern">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            ${actions.map(action => `
                                <button type="button" class="btn ${action.class}" onclick="${action.onclick}">
                                    <i class="${action.icon} me-2"></i>${action.label}
                                </button>
                            `).join('')}
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('dynamicActionModal'));
        modal.show();

        // Remove from DOM when hidden
        document.getElementById('dynamicActionModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Format data for display
     */
    function formatDataTable(data) {
        return `
            <div class="table-responsive">
                <table class="table table-bordered">
                    <tbody>
                        ${Object.entries(data).map(([key, value]) => `
                            <tr>
                                <th style="width: 30%; background: #f8f9fa;">${formatKey(key)}</th>
                                <td>${formatValue(value)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function formatKey(key) {
        return key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
    }

    function formatValue(value) {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? '✅ Yes' : '❌ No';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return value;
    }

    /**
     * Notification Queue Manager
     * Manages multiple notifications and prevents overlap
     */
    const NotificationQueue = {
        queue: [],
        activeNotifications: [],
        maxVisible: 5,
        defaultDuration: 3000,
        
        /**
         * Add notification to queue
         */
        add(notification) {
            this.queue.push(notification);
            this.processQueue();
        },
        
        /**
         * Process notification queue
         */
        processQueue() {
            // Show notifications up to max visible
            while (this.queue.length > 0 && this.activeNotifications.length < this.maxVisible) {
                const notification = this.queue.shift();
                this.show(notification);
            }
        },
        
        /**
         * Show a notification
         */
        show(notification) {
            const { message, type, duration, dismissible } = notification;
            
            // Create notification element
            const notificationId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const toast = this.createToastElement(notificationId, message, type, dismissible);
            
            // Add to active notifications
            this.activeNotifications.push({
                id: notificationId,
                element: toast,
                timeout: null
            });
            
            // Insert into DOM
            const container = this.getOrCreateContainer();
            container.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Auto-dismiss if duration is set
            if (duration > 0) {
                const activeNotif = this.activeNotifications.find(n => n.id === notificationId);
                if (activeNotif) {
                    activeNotif.timeout = setTimeout(() => {
                        this.dismiss(notificationId);
                    }, duration);
                }
            }
        },
        
        /**
         * Create toast element
         */
        createToastElement(id, message, type, dismissible) {
            const toast = document.createElement('div');
            toast.id = id;
            toast.className = `toast-notification toast-${type}`;
            
            // Get icon based on type
            const icon = this.getIconForType(type);
            
            // Get color scheme based on type
            const colorScheme = this.getColorScheme(type);
            
            toast.innerHTML = `
                <div class="toast-icon" style="color: ${colorScheme.iconColor};">
                    <i class="${icon}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-message">${message}</div>
                </div>
                ${dismissible ? `
                    <button class="toast-close" onclick="window.AdminActionButtons.dismissNotification('${id}')" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            `;
            
            // Apply color scheme
            toast.style.background = colorScheme.background;
            toast.style.borderLeft = `4px solid ${colorScheme.borderColor}`;
            
            return toast;
        },
        
        /**
         * Get icon for notification type
         */
        getIconForType(type) {
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            return icons[type] || icons.info;
        },
        
        /**
         * Get color scheme for notification type
         */
        getColorScheme(type) {
            const schemes = {
                success: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderColor: '#667eea',
                    iconColor: '#ffffff'
                },
                error: {
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderColor: '#f5576c',
                    iconColor: '#ffffff'
                },
                warning: {
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    borderColor: '#fcb69f',
                    iconColor: '#8b4513'
                },
                info: {
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderColor: '#a8edea',
                    iconColor: '#2c3e50'
                }
            };
            return schemes[type] || schemes.info;
        },
        
        /**
         * Get or create notification container
         */
        getOrCreateContainer() {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.style.cssText = `
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                `;
                document.body.appendChild(container);
            }
            return container;
        },
        
        /**
         * Dismiss a notification
         */
        dismiss(notificationId) {
            const index = this.activeNotifications.findIndex(n => n.id === notificationId);
            if (index === -1) return;
            
            const notification = this.activeNotifications[index];
            
            // Clear timeout if exists
            if (notification.timeout) {
                clearTimeout(notification.timeout);
            }
            
            // Animate out
            notification.element.classList.remove('show');
            notification.element.classList.add('hide');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                
                // Remove from active notifications
                this.activeNotifications.splice(index, 1);
                
                // Process queue for next notification
                this.processQueue();
            }, 300);
        },
        
        /**
         * Dismiss all notifications
         */
        dismissAll() {
            const notificationIds = this.activeNotifications.map(n => n.id);
            notificationIds.forEach(id => this.dismiss(id));
        },
        
        /**
         * Clear queue
         */
        clearQueue() {
            this.queue = [];
        }
    };

    /**
     * Show enhanced toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {object} options - Additional options
     */
    function showToast(message, type = 'success', options = {}) {
        const defaultOptions = {
            duration: NotificationQueue.defaultDuration,
            dismissible: true
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Add to notification queue
        NotificationQueue.add({
            message,
            type,
            duration: finalOptions.duration,
            dismissible: finalOptions.dismissible
        });
    }
    
    /**
     * Dismiss a specific notification
     * @param {string} notificationId - ID of notification to dismiss
     */
    function dismissNotification(notificationId) {
        NotificationQueue.dismiss(notificationId);
    }
    
    /**
     * Dismiss all notifications
     */
    function dismissAllNotifications() {
        NotificationQueue.dismissAll();
    }
    
    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {object} options - Additional options
     */
    function showSuccess(message, options = {}) {
        showToast(message, 'success', options);
    }
    
    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {object} options - Additional options
     */
    function showErrorNotification(message, options = {}) {
        showToast(message, 'error', { ...options, duration: 5000 }); // Errors stay longer
    }
    
    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {object} options - Additional options
     */
    function showWarning(message, options = {}) {
        showToast(message, 'warning', { ...options, duration: 4000 });
    }
    
    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {object} options - Additional options
     */
    function showInfo(message, options = {}) {
        showToast(message, 'info', options);
    }

    /**
     * Confirm dialog
     */
    function confirmAction(message, onConfirm) {
        if (confirm(message)) {
            onConfirm();
        }
    }

    /**
     * Show loading indicator on a button
     * @param {HTMLElement} buttonElement - Button to show loading on
     */
    function showLoadingIndicator(buttonElement) {
        if (!buttonElement) {
            console.warn('AdminActionButtons.showLoadingIndicator: No button element provided');
            return;
        }

        // Store original button content
        if (!buttonElement.dataset.originalContent) {
            buttonElement.dataset.originalContent = buttonElement.innerHTML;
        }

        // Store original disabled state
        if (!buttonElement.dataset.originalDisabled) {
            buttonElement.dataset.originalDisabled = buttonElement.disabled;
        }

        // Disable the button
        buttonElement.disabled = true;

        // Add loading class for styling
        buttonElement.classList.add('btn-loading');

        // Replace button content with spinner
        const originalText = buttonElement.textContent.trim();
        buttonElement.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span>Loading...</span>
        `;

        // Add visual feedback
        buttonElement.style.opacity = '0.7';
        buttonElement.style.cursor = 'not-allowed';
    }

    /**
     * Hide loading indicator from a button
     * @param {HTMLElement} buttonElement - Button to hide loading from
     */
    function hideLoadingIndicator(buttonElement) {
        if (!buttonElement) {
            console.warn('AdminActionButtons.hideLoadingIndicator: No button element provided');
            return;
        }

        // Restore original content
        if (buttonElement.dataset.originalContent) {
            buttonElement.innerHTML = buttonElement.dataset.originalContent;
            delete buttonElement.dataset.originalContent;
        }

        // Restore original disabled state
        if (buttonElement.dataset.originalDisabled !== undefined) {
            buttonElement.disabled = buttonElement.dataset.originalDisabled === 'true';
            delete buttonElement.dataset.originalDisabled;
        } else {
            buttonElement.disabled = false;
        }

        // Remove loading class
        buttonElement.classList.remove('btn-loading');

        // Remove visual feedback styles
        buttonElement.style.opacity = '';
        buttonElement.style.cursor = '';
    }

    /**
     * Disable a button
     * @param {HTMLElement} buttonElement - Button to disable
     */
    function disableButton(buttonElement) {
        if (!buttonElement) {
            console.warn('AdminActionButtons.disableButton: No button element provided');
            return;
        }

        buttonElement.disabled = true;
        buttonElement.classList.add('btn-disabled');
        buttonElement.style.opacity = '0.6';
        buttonElement.style.cursor = 'not-allowed';
    }

    /**
     * Enable a button
     * @param {HTMLElement} buttonElement - Button to enable
     */
    function enableButton(buttonElement) {
        if (!buttonElement) {
            console.warn('AdminActionButtons.enableButton: No button element provided');
            return;
        }

        buttonElement.disabled = false;
        buttonElement.classList.remove('btn-disabled');
        buttonElement.style.opacity = '';
        buttonElement.style.cursor = '';
    }

    /**
     * Show error message with details
     * @param {string} message - Error message
     * @param {string} details - Error details (optional)
     */
    function showError(message, details = null) {
        const errorContent = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
                ${details ? `<hr><small class="text-muted">${details}</small>` : ''}
            </div>
        `;

        showModal('Error', errorContent, []);
        
        // Also show toast for quick notification using the enhanced error notification
        showErrorNotification(message, { duration: 5000 });
    }

    /**
     * Confirm action with modal (enhanced version)
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {function} onConfirm - Callback when confirmed
     * @param {function} onCancel - Callback when cancelled (optional)
     */
    function confirmActionWithModal(title, message, onConfirm, onCancel = null) {
        const content = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;

        const actions = [
            {
                label: 'Confirm',
                class: 'btn-danger',
                icon: 'fas fa-check',
                onclick: `
                    (function() {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('dynamicActionModal'));
                        if (modal) modal.hide();
                        (${onConfirm.toString()})();
                    })()
                `
            },
            {
                label: 'Cancel',
                class: 'btn-secondary',
                icon: 'fas fa-times',
                onclick: onCancel ? `
                    (function() {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('dynamicActionModal'));
                        if (modal) modal.hide();
                        (${onCancel.toString()})();
                    })()
                ` : `
                    (function() {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('dynamicActionModal'));
                        if (modal) modal.hide();
                    })()
                `
            }
        ];

        showModal(title, content, actions);
    }

    // Public API
    return {
        showModal,
        formatDataTable,
        showToast,
        dismissNotification,
        dismissAllNotifications,
        showSuccess,
        showErrorNotification,
        showWarning,
        showInfo,
        confirmAction,
        showLoadingIndicator,
        hideLoadingIndicator,
        disableButton,
        enableButton,
        showError,
        confirmActionWithModal
    };
})();

// Make available globally
window.AdminActionButtons = AdminActionButtons;

/**
 * ActionButtonBinder Class
 * Handles event binding for action buttons across all panels
 * Provides systematic event listener attachment and management
 */
class ActionButtonBinder {
    constructor() {
        this.boundButtons = new Map(); // Track bound buttons
        this.bindingLog = []; // Log of binding operations
        this.debugMode = window.DEBUG_ACTION_BUTTONS || false;
    }

    /**
     * Bind all action buttons in a container
     * @param {HTMLElement} containerElement - Container to search for buttons
     * @returns {number} - Number of buttons bound
     * Requirements: 10.2 - Log button binding operations
     */
    bindButtons(containerElement) {
        if (!containerElement) {
            console.error('ActionButtonBinder: No container element provided');
            if (window.DebugLogger) {
                window.DebugLogger.logError('BINDING', new Error('No container element provided'));
            }
            return 0;
        }

        const containerId = containerElement.id || 'unknown';
        if (window.DebugLogger) {
            window.DebugLogger.log('BINDING', `Starting button binding for container: ${containerId}`);
        }

        let boundCount = 0;

        // Bind each button type
        boundCount += this.bindViewButtons(containerElement);
        boundCount += this.bindEditButtons(containerElement);
        boundCount += this.bindDeleteButtons(containerElement);
        boundCount += this.bindRespondButtons(containerElement);

        if (this.debugMode) {
            console.log(`ActionButtonBinder: Bound ${boundCount} buttons in container`, containerElement);
        }

        if (window.DebugLogger) {
            window.DebugLogger.logBinding(containerId, boundCount);
        }

        return boundCount;
    }

    /**
     * Bind View buttons
     * @param {HTMLElement} containerElement - Container to search for buttons
     * @returns {number} - Number of buttons bound
     */
    bindViewButtons(containerElement) {
        const buttons = containerElement.querySelectorAll('[onclick*="view"], .btn-view, [data-action="view"]');
        let boundCount = 0;

        buttons.forEach(button => {
            if (this._bindButton(button, 'view')) {
                boundCount++;
            }
        });

        return boundCount;
    }

    /**
     * Bind Edit buttons
     * @param {HTMLElement} containerElement - Container to search for buttons
     * @returns {number} - Number of buttons bound
     */
    bindEditButtons(containerElement) {
        const buttons = containerElement.querySelectorAll('[onclick*="edit"], .btn-edit, [data-action="edit"]');
        let boundCount = 0;

        buttons.forEach(button => {
            if (this._bindButton(button, 'edit')) {
                boundCount++;
            }
        });

        return boundCount;
    }

    /**
     * Bind Delete buttons
     * @param {HTMLElement} containerElement - Container to search for buttons
     * @returns {number} - Number of buttons bound
     */
    bindDeleteButtons(containerElement) {
        const buttons = containerElement.querySelectorAll('[onclick*="delete"], .btn-delete, [data-action="delete"]');
        let boundCount = 0;

        buttons.forEach(button => {
            if (this._bindButton(button, 'delete')) {
                boundCount++;
            }
        });

        return boundCount;
    }

    /**
     * Bind Respond buttons
     * @param {HTMLElement} containerElement - Container to search for buttons
     * @returns {number} - Number of buttons bound
     */
    bindRespondButtons(containerElement) {
        const buttons = containerElement.querySelectorAll('[onclick*="respond"], .btn-respond, [data-action="respond"]');
        let boundCount = 0;

        buttons.forEach(button => {
            if (this._bindButton(button, 'respond')) {
                boundCount++;
            }
        });

        return boundCount;
    }

    /**
     * Internal method to bind a single button
     * @param {HTMLElement} button - Button element
     * @param {string} actionType - Type of action (view, edit, delete, respond)
     * @returns {boolean} - True if successfully bound
     * @private
     */
    _bindButton(button, actionType) {
        try {
            // Extract handler info from onclick attribute or data attributes
            const handlerInfo = this._extractHandlerInfo(button, actionType);
            
            if (!handlerInfo) {
                if (this.debugMode) {
                    console.warn('ActionButtonBinder: Could not extract handler info from button', button);
                }
                return false;
            }

            const { handlerName, itemId, itemType } = handlerInfo;

            // Check if handler function exists
            if (typeof window[handlerName] !== 'function') {
                console.error(`ActionButtonBinder: Handler function "${handlerName}" not found`);
                return false;
            }

            // Store original onclick if it exists
            const originalOnclick = button.onclick;

            // Add event listener as backup/enhancement
            const eventListener = (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (this.debugMode) {
                    console.log(`ActionButtonBinder: Executing ${handlerName}(${itemId})`);
                }

                // Debug logging for button click
                if (window.DebugLogger) {
                    window.DebugLogger.logClick(actionType, itemType, itemId);
                }

                // Show loading indicator
                if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.showLoadingIndicator) {
                    AdminActionButtons.showLoadingIndicator(button);
                }

                // Call the handler function
                try {
                    const result = window[handlerName](itemId);
                    
                    // If handler returns a promise, wait for it
                    if (result && typeof result.then === 'function') {
                        result
                            .then(() => {
                                if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                                    setTimeout(() => AdminActionButtons.hideLoadingIndicator(button), 200);
                                }
                            })
                            .catch((error) => {
                                console.error(`Error executing ${handlerName}:`, error);
                                if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                                    AdminActionButtons.hideLoadingIndicator(button);
                                }
                            });
                    } else {
                        // For synchronous handlers, hide loading after a short delay
                        if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                            setTimeout(() => AdminActionButtons.hideLoadingIndicator(button), 200);
                        }
                    }
                } catch (error) {
                    console.error(`Error executing ${handlerName}:`, error);
                    if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                        AdminActionButtons.hideLoadingIndicator(button);
                    }
                }
            };

            // Attach event listener
            button.addEventListener('click', eventListener);

            // Track this binding
            const bindingKey = `${handlerName}_${itemId}`;
            this.boundButtons.set(bindingKey, {
                button,
                handlerName,
                itemId,
                itemType,
                actionType,
                boundAt: new Date(),
                eventListener
            });

            // Log binding operation
            this.bindingLog.push({
                timestamp: new Date(),
                action: 'bind',
                handlerName,
                itemId,
                itemType,
                actionType,
                success: true
            });

            // Debug logging for button binding
            if (window.DebugLogger) {
                window.DebugLogger.log('BINDING', `Button bound: ${handlerName}(${itemId})`, {
                    actionType,
                    itemType,
                    bindingKey
                });
            }

            return true;

        } catch (error) {
            console.error('ActionButtonBinder: Error binding button', error);
            this.bindingLog.push({
                timestamp: new Date(),
                action: 'bind',
                actionType,
                success: false,
                error: error.message
            });
            return false;
        }
    }

    /**
     * Extract handler information from button element
     * @param {HTMLElement} button - Button element
     * @param {string} actionType - Type of action
     * @returns {object|null} - Handler info or null
     * @private
     */
    _extractHandlerInfo(button, actionType) {
        // Try to get from data attributes first
        const dataAction = button.getAttribute('data-action');
        const dataId = button.getAttribute('data-id');
        const dataType = button.getAttribute('data-type');

        if (dataAction && dataId && dataType) {
            const handlerName = `${dataAction}${this._capitalize(dataType)}`;
            return {
                handlerName,
                itemId: parseInt(dataId),
                itemType: dataType
            };
        }

        // Try to extract from onclick attribute
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            // Match patterns like "viewProject(1)" or "editClient(5)"
            const match = onclick.match(/(\w+)\((\d+)\)/);
            if (match) {
                const handlerName = match[1];
                const itemId = parseInt(match[2]);
                
                // Extract item type from handler name
                // e.g., "viewProject" -> "project"
                const itemType = handlerName.replace(/^(view|edit|delete|respond)/, '').toLowerCase();
                
                return {
                    handlerName,
                    itemId,
                    itemType
                };
            }
        }

        // Try to infer from button classes or parent context
        const panelId = this._findParentPanelId(button);
        if (panelId && dataId) {
            // Extract type from panel ID (e.g., "projectsPanel" -> "project")
            const itemType = panelId.replace(/Panel$/, '').replace(/s$/, '').toLowerCase();
            const handlerName = `${actionType}${this._capitalize(itemType)}`;
            
            return {
                handlerName,
                itemId: parseInt(dataId),
                itemType
            };
        }

        return null;
    }

    /**
     * Find parent panel ID
     * @param {HTMLElement} element - Element to search from
     * @returns {string|null} - Panel ID or null
     * @private
     */
    _findParentPanelId(element) {
        let current = element;
        while (current && current !== document.body) {
            if (current.id && current.id.includes('Panel')) {
                return current.id;
            }
            current = current.parentElement;
        }
        return null;
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} - Capitalized string
     * @private
     */
    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Re-bind buttons in a specific panel after content update
     * @param {string} panelId - ID of the panel to rebind
     * @returns {number} - Number of buttons rebound
     */
    rebindPanel(panelId) {
        const panel = document.getElementById(panelId);
        
        if (!panel) {
            console.error(`ActionButtonBinder: Panel "${panelId}" not found`);
            return 0;
        }

        // Clear existing bindings for this panel
        this._clearPanelBindings(panelId);

        // Rebind all buttons in the panel
        const boundCount = this.bindButtons(panel);

        if (this.debugMode) {
            console.log(`ActionButtonBinder: Rebound ${boundCount} buttons in panel "${panelId}"`);
        }

        this.bindingLog.push({
            timestamp: new Date(),
            action: 'rebind',
            panelId,
            boundCount,
            success: true
        });

        return boundCount;
    }

    /**
     * Clear bindings for a specific panel
     * @param {string} panelId - ID of the panel
     * @private
     */
    _clearPanelBindings(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Remove event listeners from buttons in this panel
        for (const [key, binding] of this.boundButtons.entries()) {
            if (panel.contains(binding.button)) {
                binding.button.removeEventListener('click', binding.eventListener);
                this.boundButtons.delete(key);
            }
        }
    }

    /**
     * Verify that all buttons in a container are properly bound
     * @param {HTMLElement} containerElement - Container to verify
     * @returns {object} - Verification results
     */
    verifyBindings(containerElement) {
        if (!containerElement) {
            return {
                success: false,
                error: 'No container element provided'
            };
        }

        const allButtons = containerElement.querySelectorAll(
            '[onclick*="view"], [onclick*="edit"], [onclick*="delete"], [onclick*="respond"], ' +
            '.btn-view, .btn-edit, .btn-delete, .btn-respond, ' +
            '[data-action="view"], [data-action="edit"], [data-action="delete"], [data-action="respond"]'
        );

        const results = {
            totalButtons: allButtons.length,
            boundButtons: 0,
            unboundButtons: 0,
            missingHandlers: [],
            details: []
        };

        allButtons.forEach(button => {
            const handlerInfo = this._extractHandlerInfo(button, 'unknown');
            
            if (!handlerInfo) {
                results.unboundButtons++;
                results.details.push({
                    button,
                    status: 'unbound',
                    reason: 'Could not extract handler info'
                });
                return;
            }

            const { handlerName, itemId } = handlerInfo;
            const bindingKey = `${handlerName}_${itemId}`;

            if (typeof window[handlerName] !== 'function') {
                results.unboundButtons++;
                results.missingHandlers.push(handlerName);
                results.details.push({
                    button,
                    status: 'missing_handler',
                    handlerName,
                    itemId
                });
            } else if (this.boundButtons.has(bindingKey) || button.onclick) {
                results.boundButtons++;
                results.details.push({
                    button,
                    status: 'bound',
                    handlerName,
                    itemId
                });
            } else {
                results.unboundButtons++;
                results.details.push({
                    button,
                    status: 'unbound',
                    handlerName,
                    itemId
                });
            }
        });

        results.success = results.unboundButtons === 0 && results.missingHandlers.length === 0;

        return results;
    }

    /**
     * Log current binding status to console
     */
    logBindingStatus() {
        console.group('ActionButtonBinder Status');
        console.log('Total bound buttons:', this.boundButtons.size);
        console.log('Binding operations:', this.bindingLog.length);
        
        console.group('Bound Buttons by Type');
        const byType = {};
        for (const binding of this.boundButtons.values()) {
            byType[binding.actionType] = (byType[binding.actionType] || 0) + 1;
        }
        console.table(byType);
        console.groupEnd();

        console.group('Recent Binding Operations');
        console.table(this.bindingLog.slice(-10));
        console.groupEnd();

        console.groupEnd();
    }

    /**
     * Get diagnostic information
     * @returns {object} - Diagnostic data
     */
    getDiagnostics() {
        return {
            totalBoundButtons: this.boundButtons.size,
            bindingOperations: this.bindingLog.length,
            debugMode: this.debugMode,
            boundButtonsByType: this._getButtonsByType(),
            recentOperations: this.bindingLog.slice(-10),
            boundButtons: Array.from(this.boundButtons.values()).map(b => ({
                handlerName: b.handlerName,
                itemId: b.itemId,
                itemType: b.itemType,
                actionType: b.actionType,
                boundAt: b.boundAt
            }))
        };
    }

    /**
     * Get count of bound buttons by type
     * @returns {object} - Counts by type
     * @private
     */
    _getButtonsByType() {
        const byType = {};
        for (const binding of this.boundButtons.values()) {
            byType[binding.actionType] = (byType[binding.actionType] || 0) + 1;
        }
        return byType;
    }

    /**
     * Clear all bindings
     */
    clearAllBindings() {
        for (const binding of this.boundButtons.values()) {
            binding.button.removeEventListener('click', binding.eventListener);
        }
        this.boundButtons.clear();
        
        if (this.debugMode) {
            console.log('ActionButtonBinder: All bindings cleared');
        }
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        window.DEBUG_ACTION_BUTTONS = true;
        console.log('ActionButtonBinder: Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
        window.DEBUG_ACTION_BUTTONS = false;
        console.log('ActionButtonBinder: Debug mode disabled');
    }
}

/**
 * ActionButtonDelegator Class
 * Implements event delegation for action buttons
 * Attaches listeners to panel containers instead of individual buttons
 */
class ActionButtonDelegator {
    constructor() {
        this.delegatedPanels = new Map(); // Track panels with delegation
        this.handlerMap = new Map(); // Map of action types to handler functions
        this.debugMode = window.DEBUG_ACTION_BUTTONS || false;
        
        // Initialize handler map
        this._initializeHandlerMap();
    }

    /**
     * Initialize the handler map with all known handler functions
     * @private
     */
    _initializeHandlerMap() {
        // Projects
        this.handlerMap.set('view-project', 'viewProject');
        this.handlerMap.set('edit-project', 'editProject');
        this.handlerMap.set('delete-project', 'deleteProject');
        
        // Clients
        this.handlerMap.set('view-client', 'viewClient');
        this.handlerMap.set('edit-client', 'editClient');
        this.handlerMap.set('delete-client', 'deleteClient');
        
        // Team Members
        this.handlerMap.set('view-teammember', 'viewTeamMember');
        this.handlerMap.set('edit-teammember', 'editTeamMember');
        this.handlerMap.set('delete-teammember', 'deleteTeamMember');
        
        // Inquiries
        this.handlerMap.set('view-inquiry', 'viewInquiry');
        this.handlerMap.set('respond-inquiry', 'respondInquiry');
        this.handlerMap.set('delete-inquiry', 'deleteInquiry');
        
        // Blog Posts
        this.handlerMap.set('view-blogpost', 'viewBlogPost');
        this.handlerMap.set('edit-blogpost', 'editBlogPost');
        this.handlerMap.set('delete-blogpost', 'deleteBlogPost');
        
        // Testimonials
        this.handlerMap.set('view-testimonial', 'viewTestimonial');
        this.handlerMap.set('edit-testimonial', 'editTestimonial');
        this.handlerMap.set('delete-testimonial', 'deleteTestimonial');
        
        // Services
        this.handlerMap.set('view-service', 'viewService');
        this.handlerMap.set('edit-service', 'editService');
        this.handlerMap.set('delete-service', 'deleteService');
        
        // Invoices
        this.handlerMap.set('view-invoice', 'viewInvoice');
        this.handlerMap.set('edit-invoice', 'editInvoice');
        this.handlerMap.set('delete-invoice', 'deleteInvoice');
        
        // Schedule
        this.handlerMap.set('view-scheduleevent', 'viewScheduleEvent');
        this.handlerMap.set('edit-scheduleevent', 'editScheduleEvent');
        this.handlerMap.set('delete-scheduleevent', 'deleteScheduleEvent');
        
        // Quotes
        this.handlerMap.set('view-quote', 'viewQuote');
        this.handlerMap.set('edit-quote', 'editQuote');
        this.handlerMap.set('delete-quote', 'deleteQuote');
    }

    /**
     * Delegate event handling for a panel container
     * @param {string|HTMLElement} panelIdentifier - Panel ID or element
     * @returns {boolean} - True if delegation was successful
     */
    delegatePanel(panelIdentifier) {
        const panel = typeof panelIdentifier === 'string' 
            ? document.getElementById(panelIdentifier)
            : panelIdentifier;

        if (!panel) {
            console.error('ActionButtonDelegator: Panel not found', panelIdentifier);
            return false;
        }

        // Check if already delegated
        if (this.delegatedPanels.has(panel)) {
            if (this.debugMode) {
                console.log('ActionButtonDelegator: Panel already delegated', panel.id);
            }
            return true;
        }

        // Create delegated event handler
        const delegatedHandler = (event) => {
            this._handleDelegatedClick(event, panel);
        };

        // Attach event listener to panel
        panel.addEventListener('click', delegatedHandler, true); // Use capture phase

        // Track this delegation
        this.delegatedPanels.set(panel, {
            panelId: panel.id,
            handler: delegatedHandler,
            delegatedAt: new Date()
        });

        if (this.debugMode) {
            console.log(`ActionButtonDelegator: Delegated panel "${panel.id}"`);
        }

        return true;
    }

    /**
     * Handle delegated click events
     * @param {Event} event - Click event
     * @param {HTMLElement} panel - Panel container
     * @private
     */
    _handleDelegatedClick(event, panel) {
        // Find the button that was clicked
        const button = event.target.closest('button');
        
        if (!button) {
            return; // Not a button click
        }

        // Extract action information from button
        const actionInfo = this._extractActionInfo(button);
        
        if (!actionInfo) {
            return; // Not an action button
        }

        const { action, itemType, itemId } = actionInfo;

        // Build handler key
        const handlerKey = `${action}-${itemType}`.toLowerCase();
        const handlerName = this.handlerMap.get(handlerKey);

        if (!handlerName) {
            if (this.debugMode) {
                console.warn(`ActionButtonDelegator: No handler mapped for "${handlerKey}"`);
            }
            return;
        }

        // Check if handler function exists
        if (typeof window[handlerName] !== 'function') {
            console.error(`ActionButtonDelegator: Handler function "${handlerName}" not found`);
            return;
        }

        // Prevent default button behavior
        event.preventDefault();
        event.stopPropagation();

        if (this.debugMode) {
            console.log(`ActionButtonDelegator: Executing ${handlerName}(${itemId})`);
        }

        // Show loading indicator
        if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.showLoadingIndicator) {
            AdminActionButtons.showLoadingIndicator(button);
        }

        // Execute the handler
        try {
            const result = window[handlerName](itemId);
            
            // If handler returns a promise, wait for it
            if (result && typeof result.then === 'function') {
                result
                    .then(() => {
                        if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                            setTimeout(() => AdminActionButtons.hideLoadingIndicator(button), 200);
                        }
                    })
                    .catch((error) => {
                        console.error(`ActionButtonDelegator: Error executing ${handlerName}`, error);
                        if (typeof AdminActionButtons !== 'undefined') {
                            AdminActionButtons.hideLoadingIndicator(button);
                            AdminActionButtons.showToast('An error occurred. Please try again.', 'error');
                        }
                    });
            } else {
                // For synchronous handlers, hide loading after a short delay
                if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
                    setTimeout(() => AdminActionButtons.hideLoadingIndicator(button), 200);
                }
            }
        } catch (error) {
            console.error(`ActionButtonDelegator: Error executing ${handlerName}`, error);
            if (typeof AdminActionButtons !== 'undefined') {
                AdminActionButtons.hideLoadingIndicator(button);
                AdminActionButtons.showToast('An error occurred. Please try again.', 'error');
            }
        }
    }

    /**
     * Extract action information from button element
     * @param {HTMLElement} button - Button element
     * @returns {object|null} - Action info or null
     * @private
     */
    _extractActionInfo(button) {
        // Method 1: Check data attributes
        const dataAction = button.getAttribute('data-action');
        const dataType = button.getAttribute('data-type');
        const dataId = button.getAttribute('data-id');

        if (dataAction && dataType && dataId) {
            return {
                action: dataAction,
                itemType: dataType,
                itemId: parseInt(dataId)
            };
        }

        // Method 2: Parse onclick attribute
        const onclick = button.getAttribute('onclick');
        if (onclick) {
            // Match patterns like "viewProject(1)" or "editClient(5)"
            const match = onclick.match(/(\w+)\((\d+)\)/);
            if (match) {
                const handlerName = match[1];
                const itemId = parseInt(match[2]);
                
                // Extract action and type from handler name
                const actionMatch = handlerName.match(/^(view|edit|delete|respond)(.+)$/i);
                if (actionMatch) {
                    return {
                        action: actionMatch[1].toLowerCase(),
                        itemType: actionMatch[2].toLowerCase(),
                        itemId: itemId
                    };
                }
            }
        }

        // Method 3: Infer from button classes and context
        const classList = Array.from(button.classList);
        
        // Determine action from button class or icon
        let action = null;
        if (classList.some(c => c.includes('view')) || button.querySelector('.fa-eye')) {
            action = 'view';
        } else if (classList.some(c => c.includes('edit')) || button.querySelector('.fa-edit')) {
            action = 'edit';
        } else if (classList.some(c => c.includes('delete')) || button.querySelector('.fa-trash')) {
            action = 'delete';
        } else if (classList.some(c => c.includes('respond')) || button.querySelector('.fa-reply')) {
            action = 'respond';
        }

        if (!action) {
            return null; // Not an action button
        }

        // Try to find item ID from parent row or card
        const row = button.closest('tr');
        const card = button.closest('.card');
        const container = row || card;

        if (container) {
            const itemId = container.getAttribute('data-id');
            if (itemId) {
                // Infer item type from panel
                const panel = button.closest('[id$="Panel"]');
                if (panel) {
                    const panelId = panel.id;
                    // Extract type from panel ID (e.g., "projectsPanel" -> "project")
                    const itemType = panelId.replace(/Panel$/, '').replace(/s$/, '').toLowerCase();
                    
                    return {
                        action,
                        itemType,
                        itemId: parseInt(itemId)
                    };
                }
            }
        }

        return null;
    }

    /**
     * Delegate all panels on the page
     * @returns {number} - Number of panels delegated
     */
    delegateAllPanels() {
        // Find all panels (elements with IDs ending in "Panel")
        const panels = document.querySelectorAll('[id$="Panel"]');
        let delegatedCount = 0;

        panels.forEach(panel => {
            if (this.delegatePanel(panel)) {
                delegatedCount++;
            }
        });

        if (this.debugMode) {
            console.log(`ActionButtonDelegator: Delegated ${delegatedCount} panels`);
        }

        return delegatedCount;
    }

    /**
     * Remove delegation from a panel
     * @param {string|HTMLElement} panelIdentifier - Panel ID or element
     * @returns {boolean} - True if delegation was removed
     */
    undelegatePanel(panelIdentifier) {
        const panel = typeof panelIdentifier === 'string' 
            ? document.getElementById(panelIdentifier)
            : panelIdentifier;

        if (!panel) {
            return false;
        }

        const delegation = this.delegatedPanels.get(panel);
        if (!delegation) {
            return false;
        }

        // Remove event listener
        panel.removeEventListener('click', delegation.handler, true);

        // Remove from tracking
        this.delegatedPanels.delete(panel);

        if (this.debugMode) {
            console.log(`ActionButtonDelegator: Undelegated panel "${panel.id}"`);
        }

        return true;
    }

    /**
     * Remove all delegations
     */
    undelegateAll() {
        for (const [panel, delegation] of this.delegatedPanels.entries()) {
            panel.removeEventListener('click', delegation.handler, true);
        }
        
        this.delegatedPanels.clear();

        if (this.debugMode) {
            console.log('ActionButtonDelegator: All delegations removed');
        }
    }

    /**
     * Get diagnostic information
     * @returns {object} - Diagnostic data
     */
    getDiagnostics() {
        return {
            delegatedPanels: Array.from(this.delegatedPanels.values()).map(d => ({
                panelId: d.panelId,
                delegatedAt: d.delegatedAt
            })),
            totalDelegatedPanels: this.delegatedPanels.size,
            handlerMapSize: this.handlerMap.size,
            debugMode: this.debugMode
        };
    }

    /**
     * Log delegation status to console
     */
    logStatus() {
        console.group('ActionButtonDelegator Status');
        console.log('Total delegated panels:', this.delegatedPanels.size);
        console.log('Handler map size:', this.handlerMap.size);
        console.log('Debug mode:', this.debugMode);
        
        console.group('Delegated Panels');
        for (const delegation of this.delegatedPanels.values()) {
            console.log(`- ${delegation.panelId} (delegated at ${delegation.delegatedAt.toLocaleTimeString()})`);
        }
        console.groupEnd();
        
        console.groupEnd();
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        window.DEBUG_ACTION_BUTTONS = true;
        console.log('ActionButtonDelegator: Debug mode enabled');
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;
        window.DEBUG_ACTION_BUTTONS = false;
        console.log('ActionButtonDelegator: Debug mode disabled');
    }
}

// Create global instances
window.ActionButtonBinder = new ActionButtonBinder();
window.ActionButtonDelegator = new ActionButtonDelegator();

console.log('ActionButtonBinder class loaded successfully');
console.log('✓ Global instance created: window.ActionButtonBinder');
console.log('ActionButtonDelegator class loaded successfully');
console.log('✓ Global instance created: window.ActionButtonDelegator');
