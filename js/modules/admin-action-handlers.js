/**
 * Admin Action Handlers Module
 * Connects action buttons to CRUD operations
 * Fixes the issue where action buttons don't work except for Quote Requests
 */

// ============================================
// DEBUG LOGGING CONFIGURATION
// Requirements: 10.1, 10.2, 10.3, 10.4
// ============================================

/**
 * Debug logging flag - set to true to enable verbose logging
 * Can be controlled via window.DEBUG_ACTION_BUTTONS
 */
window.DEBUG_ACTION_BUTTONS = window.DEBUG_ACTION_BUTTONS || false;

/**
 * Debug logger utility
 * Logs messages only when DEBUG_ACTION_BUTTONS is enabled
 */
const DebugLogger = {
    /**
     * Log a debug message
     * @param {string} category - Log category (e.g., 'HANDLER', 'BINDING', 'CLICK')
     * @param {string} message - Log message
     * @param {any} data - Additional data to log (optional)
     */
    log(category, message, data = null) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${category}]`;
        
        if (data !== null) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    },
    
    /**
     * Log handler registration
     * @param {string} handlerName - Name of the handler function
     * @param {boolean} success - Whether registration was successful
     */
    logRegistration(handlerName, success) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        const status = success ? '✓' : '✗';
        const color = success ? 'color: green' : 'color: red';
        console.log(`%c${status} Handler registered: ${handlerName}`, color);
    },
    
    /**
     * Log button click
     * @param {string} actionType - Type of action (view, edit, delete, respond)
     * @param {string} itemType - Type of item (project, client, etc.)
     * @param {number} itemId - ID of the item
     */
    logClick(actionType, itemType, itemId) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        console.log(`%c🖱️ Button clicked: ${actionType} ${itemType} (ID: ${itemId})`, 'color: blue; font-weight: bold');
    },
    
    /**
     * Log handler execution start
     * @param {string} handlerName - Name of the handler function
     * @param {number} itemId - ID of the item
     */
    logExecutionStart(handlerName, itemId) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        console.log(`%c▶️ Executing: ${handlerName}(${itemId})`, 'color: purple; font-weight: bold');
    },
    
    /**
     * Log handler execution completion
     * @param {string} handlerName - Name of the handler function
     * @param {number} itemId - ID of the item
     * @param {boolean} success - Whether execution was successful
     * @param {number} duration - Execution duration in ms (optional)
     */
    logExecutionComplete(handlerName, itemId, success, duration = null) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        const status = success ? '✅' : '❌';
        const durationStr = duration !== null ? ` (${duration}ms)` : '';
        const color = success ? 'color: green' : 'color: red';
        console.log(`%c${status} Completed: ${handlerName}(${itemId})${durationStr}`, color);
    },
    
    /**
     * Log error
     * @param {string} context - Context where error occurred
     * @param {Error} error - Error object
     * @param {any} additionalData - Additional data (optional)
     */
    logError(context, error, additionalData = null) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        console.group(`%c❌ Error in ${context}`, 'color: red; font-weight: bold');
        console.error('Error:', error);
        if (additionalData) {
            console.log('Additional data:', additionalData);
        }
        console.trace('Stack trace:');
        console.groupEnd();
    },
    
    /**
     * Log binding operation
     * @param {string} panelId - ID of the panel
     * @param {number} buttonCount - Number of buttons bound
     */
    logBinding(panelId, buttonCount) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        console.log(`%c🔗 Bound ${buttonCount} buttons in ${panelId}`, 'color: orange');
    },
    
    /**
     * Log initialization status
     * @param {string} component - Component being initialized
     * @param {boolean} success - Whether initialization was successful
     * @param {any} details - Additional details (optional)
     */
    logInit(component, success, details = null) {
        if (!window.DEBUG_ACTION_BUTTONS) return;
        
        const status = success ? '✓' : '✗';
        const color = success ? 'color: green' : 'color: red';
        console.log(`%c${status} Initialized: ${component}`, color);
        if (details) {
            console.log('Details:', details);
        }
    }
};

// Make DebugLogger available globally
window.DebugLogger = DebugLogger;

// Log that debug logging system is loaded
console.log('Debug logging system loaded. Set window.DEBUG_ACTION_BUTTONS = true to enable verbose logging.');

// ============================================
// UTILITY FUNCTIONS FOR LOADING STATES
// ============================================

/**
 * Find the button element that triggered an action
 * @param {number} id - Item ID
 * @param {string} action - Action type (view, edit, delete, respond)
 * @returns {HTMLElement|null} - Button element or null
 */
function findActionButton(id, action) {
    // Try to find button by onclick attribute
    const buttons = document.querySelectorAll(`button[onclick*="${action}"][onclick*="${id}"]`);
    if (buttons.length > 0) {
        return buttons[0];
    }
    
    // Try to find by data attributes
    const dataButtons = document.querySelectorAll(`button[data-action="${action}"][data-id="${id}"]`);
    if (dataButtons.length > 0) {
        return dataButtons[0];
    }
    
    return null;
}

// ============================================
// MODAL FORM FALLBACK MECHANISM
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
// ============================================

/**
 * Check if a modal form function exists
 * @param {string} functionName - Name of the modal function to check
 * @returns {boolean} - True if function exists and is callable
 */
function checkModalFormFunction(functionName) {
    return typeof window[functionName] === 'function';
}

/**
 * Validate input data based on field type and requirements
 * @param {string} value - Value to validate
 * @param {object} validation - Validation rules
 * @returns {object} - { isValid: boolean, error: string }
 */
function validateInput(value, validation = {}) {
    const { required = false, minLength = 0, maxLength = Infinity, pattern = null, type = 'text' } = validation;
    
    // Check required
    if (required && (!value || value.trim() === '')) {
        return { isValid: false, error: 'This field is required' };
    }
    
    // If not required and empty, it's valid
    if (!value || value.trim() === '') {
        return { isValid: true, error: null };
    }
    
    const trimmedValue = value.trim();
    
    // Check min length
    if (minLength > 0 && trimmedValue.length < minLength) {
        return { isValid: false, error: `Must be at least ${minLength} characters` };
    }
    
    // Check max length
    if (maxLength < Infinity && trimmedValue.length > maxLength) {
        return { isValid: false, error: `Must not exceed ${maxLength} characters` };
    }
    
    // Check pattern
    if (pattern && !pattern.test(trimmedValue)) {
        return { isValid: false, error: 'Invalid format' };
    }
    
    // Type-specific validation
    if (type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedValue)) {
            return { isValid: false, error: 'Invalid email address' };
        }
    }
    
    if (type === 'number') {
        if (isNaN(trimmedValue)) {
            return { isValid: false, error: 'Must be a valid number' };
        }
    }
    
    if (type === 'url') {
        try {
            new URL(trimmedValue);
        } catch {
            return { isValid: false, error: 'Invalid URL' };
        }
    }
    
    return { isValid: true, error: null };
}

/**
 * Prompt for input with validation (fallback method)
 * @param {string} message - Prompt message
 * @param {string} defaultValue - Default value
 * @param {object} validation - Validation rules
 * @returns {string|null} - User input or null if cancelled
 */
function promptWithValidation(message, defaultValue = '', validation = {}) {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        const value = prompt(message, defaultValue);
        
        // User cancelled
        if (value === null) {
            return null;
        }
        
        // Validate input
        const validationResult = validateInput(value, validation);
        
        if (validationResult.isValid) {
            return value;
        }
        
        // Show error and retry
        attempts++;
        if (attempts < maxAttempts) {
            alert(`Validation Error: ${validationResult.error}\n\nPlease try again (${maxAttempts - attempts} attempts remaining)`);
        } else {
            alert(`Validation Error: ${validationResult.error}\n\nMaximum attempts reached. Operation cancelled.`);
            return null;
        }
    }
    
    return null;
}

/**
 * Use modal form or fallback to prompt-based editing
 * @param {string} modalFunctionName - Name of the modal function
 * @param {number} id - Item ID
 * @param {function} fallbackHandler - Fallback function to execute if modal unavailable
 * @returns {boolean} - True if modal was used, false if fallback was used
 */
function useModalOrFallback(modalFunctionName, id, fallbackHandler) {
    // Check if modal form function exists
    if (checkModalFormFunction(modalFunctionName)) {
        try {
            // Use modal form
            window[modalFunctionName](id);
            console.log(`[useModalOrFallback] Using modal form: ${modalFunctionName}(${id})`);
            return true;
        } catch (error) {
            // Modal function exists but failed to execute
            console.error(`[useModalOrFallback] Modal function ${modalFunctionName} failed:`, error);
            console.warn(`[useModalOrFallback] Falling back to prompt-based editing for ID: ${id}`);
            
            // Show warning to user
            if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.showWarning) {
                AdminActionButtons.showWarning('Modal form unavailable. Using basic input method.');
            }
            
            // Execute fallback
            fallbackHandler();
            return false;
        }
    } else {
        // Modal function doesn't exist, use fallback
        console.warn(`[useModalOrFallback] Modal function ${modalFunctionName} not found. Using fallback for ID: ${id}`);
        
        // Show warning to user
        if (typeof AdminActionButtons !== 'undefined' && AdminActionButtons.showWarning) {
            AdminActionButtons.showWarning('Advanced form unavailable. Using basic input method.');
        }
        
        // Execute fallback
        fallbackHandler();
        return false;
    }
}

/**
 * Execute a handler with loading state management
 * @param {HTMLElement} button - Button element (optional)
 * @param {function} handler - Handler function to execute
 * @returns {Promise} - Promise that resolves when handler completes
 */
async function executeWithLoading(button, handler) {
    if (button && typeof AdminActionButtons !== 'undefined' && AdminActionButtons.showLoadingIndicator) {
        AdminActionButtons.showLoadingIndicator(button);
    }
    
    try {
        // Execute the handler
        const result = await Promise.resolve(handler());
        return result;
    } finally {
        if (button && typeof AdminActionButtons !== 'undefined' && AdminActionButtons.hideLoadingIndicator) {
            // Small delay to ensure user sees the loading state
            setTimeout(() => {
                AdminActionButtons.hideLoadingIndicator(button);
            }, 200);
        }
    }
}

// ============================================
// PROJECT ACTION HANDLERS
// ============================================

function viewProject(id) {
    const startTime = Date.now();
    DebugLogger.logExecutionStart('viewProject', id);
    DebugLogger.logClick('view', 'project', id);
    
    try {
        console.log(`[viewProject] Attempting to view project with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            DebugLogger.logError('viewProject', new Error('Invalid project ID'), { id });
            throw new Error('Invalid project ID provided');
        }

        DebugLogger.log('HANDLER', `Fetching project data for ID: ${id}`);
        const project = AdminCRUD.getProject(id);
        
        if (!project) {
            DebugLogger.logError('viewProject', new Error('Project not found'), { id });
            AdminActionButtons.showToast('Project not found', 'error');
            console.error(`[viewProject] Project with ID ${id} not found`);
            DebugLogger.logExecutionComplete('viewProject', id, false, Date.now() - startTime);
            return;
        }

        DebugLogger.log('HANDLER', `Project data retrieved successfully`, project);
        
        const content = AdminActionButtons.formatDataTable(project);
        AdminActionButtons.showModal(
            `<i class="fas fa-project-diagram me-2"></i>View Project: ${project.name}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editProject(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewProject] Successfully displayed project: ${project.name}`);
        DebugLogger.logExecutionComplete('viewProject', id, true, Date.now() - startTime);
    } catch (error) {
        console.error('[viewProject] Error occurred:', error);
        DebugLogger.logError('viewProject', error, { id });
        AdminActionButtons.showToast('Failed to view project. Please try again.', 'error');
        DebugLogger.logExecutionComplete('viewProject', id, false, Date.now() - startTime);
    }
}

function editProject(id) {
    const startTime = Date.now();
    DebugLogger.logExecutionStart('editProject', id);
    DebugLogger.logClick('edit', 'project', id);
    
    try {
        console.log(`[editProject] Attempting to edit project with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            DebugLogger.logError('editProject', new Error('Invalid project ID'), { id });
            throw new Error('Invalid project ID provided');
        }

        DebugLogger.log('HANDLER', `Checking for modal form function: openEditProjectModal`);
        
        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditProjectModal', id, () => {
            DebugLogger.log('HANDLER', `Using fallback method for editing project ID: ${id}`);
            
            // Fallback handler
            const project = AdminCRUD.getProject(id);
            if (!project) {
                DebugLogger.logError('editProject', new Error('Project not found'), { id });
                AdminActionButtons.showToast('Project not found', 'error');
                console.error(`[editProject] Project with ID ${id} not found`);
                return;
            }

            DebugLogger.log('HANDLER', `Prompting user for project name`, { currentName: project.name });
            
            // Prompt for project name with validation
            const name = promptWithValidation(
                'Project Name:', 
                project.name,
                { required: true, minLength: 3, maxLength: 100 }
            );
            
            if (name !== null) {
                DebugLogger.log('HANDLER', `Updating project with new name`, { id, newName: name });
                AdminCRUD.updateProject(id, { name });
                AdminActionButtons.showToast('Project updated successfully!');
                if (typeof loadProjects === 'function') loadProjects();
                console.log(`[editProject] Successfully updated project ID: ${id} using fallback`);
                DebugLogger.logExecutionComplete('editProject', id, true, Date.now() - startTime);
            } else {
                DebugLogger.log('HANDLER', `User cancelled edit operation for project ID: ${id}`);
                DebugLogger.logExecutionComplete('editProject', id, false, Date.now() - startTime);
            }
        });
    } catch (error) {
        console.error('[editProject] Error occurred:', error);
        DebugLogger.logError('editProject', error, { id });
        AdminActionButtons.showToast('Failed to edit project. Please try again.', 'error');
        DebugLogger.logExecutionComplete('editProject', id, false, Date.now() - startTime);
    }
}

function deleteProject(id) {
    const startTime = Date.now();
    DebugLogger.logExecutionStart('deleteProject', id);
    DebugLogger.logClick('delete', 'project', id);
    
    try {
        console.log(`[deleteProject] Attempting to delete project with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            DebugLogger.logError('deleteProject', new Error('Invalid project ID'), { id });
            throw new Error('Invalid project ID provided');
        }

        DebugLogger.log('HANDLER', `Showing confirmation dialog for project deletion`, { id });
        
        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this project?',
            () => {
                try {
                    DebugLogger.log('HANDLER', `User confirmed deletion of project ID: ${id}`);
                    AdminCRUD.deleteProject(id);
                    AdminActionButtons.showToast('Project deleted successfully!');
                    if (typeof loadProjects === 'function') loadProjects();
                    console.log(`[deleteProject] Successfully deleted project ID: ${id}`);
                    DebugLogger.logExecutionComplete('deleteProject', id, true, Date.now() - startTime);
                } catch (error) {
                    console.error('[deleteProject] Error during deletion:', error);
                    DebugLogger.logError('deleteProject', error, { id });
                    AdminActionButtons.showToast('Failed to delete project. Please try again.', 'error');
                    DebugLogger.logExecutionComplete('deleteProject', id, false, Date.now() - startTime);
                }
            }
        );
    } catch (error) {
        console.error('[deleteProject] Error occurred:', error);
        DebugLogger.logError('deleteProject', error, { id });
        AdminActionButtons.showToast('Failed to delete project. Please try again.', 'error');
        DebugLogger.logExecutionComplete('deleteProject', id, false, Date.now() - startTime);
    }
}

// ============================================
// CLIENT ACTION HANDLERS
// ============================================

function viewClient(id) {
    try {
        console.log(`[viewClient] Attempting to view client with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid client ID provided');
        }

        const client = AdminCRUD.getClient(id);
        if (!client) {
            AdminActionButtons.showToast('Client not found', 'error');
            console.error(`[viewClient] Client with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(client);
        AdminActionButtons.showModal(
            `<i class="fas fa-user me-2"></i>View Client: ${client.name}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editClient(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewClient] Successfully displayed client: ${client.name}`);
    } catch (error) {
        console.error('[viewClient] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view client. Please try again.', 'error');
    }
}

function editClient(id) {
    try {
        console.log(`[editClient] Attempting to edit client with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid client ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditClientModal', id, () => {
            // Fallback handler
            const client = AdminCRUD.getClient(id);
            if (!client) {
                AdminActionButtons.showToast('Client not found', 'error');
                console.error(`[editClient] Client with ID ${id} not found`);
                return;
            }

            // Prompt for client name with validation
            const name = promptWithValidation(
                'Client Name:', 
                client.name,
                { required: true, minLength: 2, maxLength: 100 }
            );
            
            if (name !== null) {
                AdminCRUD.updateClient(id, { name });
                AdminActionButtons.showToast('Client updated successfully!');
                if (typeof loadClients === 'function') loadClients();
                console.log(`[editClient] Successfully updated client ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editClient] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit client. Please try again.', 'error');
    }
}

function deleteClient(id) {
    try {
        console.log(`[deleteClient] Attempting to delete client with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid client ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this client?',
            () => {
                try {
                    AdminCRUD.deleteClient(id);
                    AdminActionButtons.showToast('Client deleted successfully!');
                    if (typeof loadClients === 'function') loadClients();
                    console.log(`[deleteClient] Successfully deleted client ID: ${id}`);
                } catch (error) {
                    console.error('[deleteClient] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete client. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteClient] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete client. Please try again.', 'error');
    }
}

// ============================================
// TEAM MEMBER ACTION HANDLERS
// ============================================

function viewTeamMember(id) {
    try {
        console.log(`[viewTeamMember] Attempting to view team member with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid team member ID provided');
        }

        const member = AdminCRUD.getTeamMember(id);
        if (!member) {
            AdminActionButtons.showToast('Team member not found', 'error');
            console.error(`[viewTeamMember] Team member with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(member);
        AdminActionButtons.showModal(
            `<i class="fas fa-user-tie me-2"></i>View Team Member: ${member.name}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editTeamMember(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewTeamMember] Successfully displayed team member: ${member.name}`);
    } catch (error) {
        console.error('[viewTeamMember] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view team member. Please try again.', 'error');
    }
}

function editTeamMember(id) {
    try {
        console.log(`[editTeamMember] Attempting to edit team member with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid team member ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditTeamMemberModal', id, () => {
            // Fallback handler
            const member = AdminCRUD.getTeamMember(id);
            if (!member) {
                AdminActionButtons.showToast('Team member not found', 'error');
                console.error(`[editTeamMember] Team member with ID ${id} not found`);
                return;
            }

            // Prompt for team member name with validation
            const name = promptWithValidation(
                'Team Member Name:', 
                member.name,
                { required: true, minLength: 2, maxLength: 100 }
            );
            
            if (name !== null) {
                AdminCRUD.updateTeamMember(id, { name });
                AdminActionButtons.showToast('Team member updated successfully!');
                if (typeof loadTeamMembers === 'function') loadTeamMembers();
                console.log(`[editTeamMember] Successfully updated team member ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editTeamMember] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit team member. Please try again.', 'error');
    }
}

function deleteTeamMember(id) {
    try {
        console.log(`[deleteTeamMember] Attempting to delete team member with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid team member ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this team member?',
            () => {
                try {
                    AdminCRUD.deleteTeamMember(id);
                    AdminActionButtons.showToast('Team member deleted successfully!');
                    if (typeof loadTeamMembers === 'function') loadTeamMembers();
                    console.log(`[deleteTeamMember] Successfully deleted team member ID: ${id}`);
                } catch (error) {
                    console.error('[deleteTeamMember] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete team member. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteTeamMember] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete team member. Please try again.', 'error');
    }
}

// ============================================
// INQUIRY ACTION HANDLERS
// ============================================

function viewInquiry(id) {
    try {
        console.log(`[viewInquiry] Attempting to view inquiry with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid inquiry ID provided');
        }

        const inquiry = AdminCRUD.getInquiry(id);
        if (!inquiry) {
            AdminActionButtons.showToast('Inquiry not found', 'error');
            console.error(`[viewInquiry] Inquiry with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(inquiry);
        AdminActionButtons.showModal(
            `<i class="fas fa-envelope me-2"></i>View Inquiry: ${inquiry.subject}`,
            content,
            [
                {
                    label: 'Respond',
                    class: 'btn-success',
                    icon: 'fas fa-reply',
                    onclick: `respondInquiry(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewInquiry] Successfully displayed inquiry: ${inquiry.subject}`);
    } catch (error) {
        console.error('[viewInquiry] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view inquiry. Please try again.', 'error');
    }
}

function respondInquiry(id) {
    try {
        console.log(`[respondInquiry] Attempting to respond to inquiry with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid inquiry ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openRespondInquiryModal', id, () => {
            // Fallback handler
            const inquiry = AdminCRUD.getInquiry(id);
            if (!inquiry) {
                AdminActionButtons.showToast('Inquiry not found', 'error');
                console.error(`[respondInquiry] Inquiry with ID ${id} not found`);
                return;
            }

            // Prompt for response with validation
            const response = promptWithValidation(
                'Enter your response:', 
                '',
                { required: true, minLength: 10 }
            );
            
            if (response !== null) {
                AdminCRUD.updateInquiry(id, { status: 'Responded', response });
                AdminActionButtons.showToast('Response sent successfully!');
                if (typeof loadInquiries === 'function') loadInquiries();
                console.log(`[respondInquiry] Successfully responded to inquiry ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[respondInquiry] Error occurred:', error);
        AdminActionButtons.showToast('Failed to respond to inquiry. Please try again.', 'error');
    }
}

function deleteInquiry(id) {
    try {
        console.log(`[deleteInquiry] Attempting to delete inquiry with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid inquiry ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this inquiry?',
            () => {
                try {
                    AdminCRUD.deleteInquiry(id);
                    AdminActionButtons.showToast('Inquiry deleted successfully!');
                    if (typeof loadInquiries === 'function') loadInquiries();
                    console.log(`[deleteInquiry] Successfully deleted inquiry ID: ${id}`);
                } catch (error) {
                    console.error('[deleteInquiry] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete inquiry. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteInquiry] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete inquiry. Please try again.', 'error');
    }
}

// ============================================
// BLOG POST ACTION HANDLERS
// ============================================

function viewBlogPost(id) {
    try {
        console.log(`[viewBlogPost] Attempting to view blog post with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid blog post ID provided');
        }

        const post = AdminCRUD.getBlogPost(id);
        if (!post) {
            AdminActionButtons.showToast('Blog post not found', 'error');
            console.error(`[viewBlogPost] Blog post with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(post);
        AdminActionButtons.showModal(
            `<i class="fas fa-blog me-2"></i>View Blog Post: ${post.title}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editBlogPost(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewBlogPost] Successfully displayed blog post: ${post.title}`);
    } catch (error) {
        console.error('[viewBlogPost] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view blog post. Please try again.', 'error');
    }
}

function editBlogPost(id) {
    try {
        console.log(`[editBlogPost] Attempting to edit blog post with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid blog post ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditBlogPostModal', id, () => {
            // Fallback handler
            const post = AdminCRUD.getBlogPost(id);
            if (!post) {
                AdminActionButtons.showToast('Blog post not found', 'error');
                console.error(`[editBlogPost] Blog post with ID ${id} not found`);
                return;
            }

            // Prompt for blog post title with validation
            const title = promptWithValidation(
                'Blog Post Title:', 
                post.title,
                { required: true, minLength: 5, maxLength: 150 }
            );
            
            if (title !== null) {
                AdminCRUD.updateBlogPost(id, { title });
                AdminActionButtons.showToast('Blog post updated successfully!');
                if (typeof loadBlogPosts === 'function') loadBlogPosts();
                console.log(`[editBlogPost] Successfully updated blog post ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editBlogPost] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit blog post. Please try again.', 'error');
    }
}

function deleteBlogPost(id) {
    try {
        console.log(`[deleteBlogPost] Attempting to delete blog post with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid blog post ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this blog post?',
            () => {
                try {
                    AdminCRUD.deleteBlogPost(id);
                    AdminActionButtons.showToast('Blog post deleted successfully!');
                    if (typeof loadBlogPosts === 'function') loadBlogPosts();
                    console.log(`[deleteBlogPost] Successfully deleted blog post ID: ${id}`);
                } catch (error) {
                    console.error('[deleteBlogPost] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete blog post. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteBlogPost] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete blog post. Please try again.', 'error');
    }
}

// ============================================
// TESTIMONIAL ACTION HANDLERS
// ============================================

function viewTestimonial(id) {
    try {
        console.log(`[viewTestimonial] Attempting to view testimonial with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid testimonial ID provided');
        }

        const testimonial = AdminCRUD.getTestimonial(id);
        if (!testimonial) {
            AdminActionButtons.showToast('Testimonial not found', 'error');
            console.error(`[viewTestimonial] Testimonial with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(testimonial);
        AdminActionButtons.showModal(
            `<i class="fas fa-quote-left me-2"></i>View Testimonial`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editTestimonial(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewTestimonial] Successfully displayed testimonial ID: ${id}`);
    } catch (error) {
        console.error('[viewTestimonial] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view testimonial. Please try again.', 'error');
    }
}

function editTestimonial(id) {
    try {
        console.log(`[editTestimonial] Attempting to edit testimonial with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid testimonial ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditTestimonialModal', id, () => {
            // Fallback handler
            const testimonial = AdminCRUD.getTestimonial(id);
            if (!testimonial) {
                AdminActionButtons.showToast('Testimonial not found', 'error');
                console.error(`[editTestimonial] Testimonial with ID ${id} not found`);
                return;
            }

            // Prompt for client name with validation
            const clientName = promptWithValidation(
                'Client Name:', 
                testimonial.clientName,
                { required: true, minLength: 2, maxLength: 100 }
            );
            
            if (clientName !== null) {
                AdminCRUD.updateTestimonial(id, { clientName });
                AdminActionButtons.showToast('Testimonial updated successfully!');
                if (typeof loadTestimonials === 'function') loadTestimonials();
                console.log(`[editTestimonial] Successfully updated testimonial ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editTestimonial] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit testimonial. Please try again.', 'error');
    }
}

function deleteTestimonial(id) {
    try {
        console.log(`[deleteTestimonial] Attempting to delete testimonial with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid testimonial ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this testimonial?',
            () => {
                try {
                    AdminCRUD.deleteTestimonial(id);
                    AdminActionButtons.showToast('Testimonial deleted successfully!');
                    if (typeof loadTestimonials === 'function') loadTestimonials();
                    console.log(`[deleteTestimonial] Successfully deleted testimonial ID: ${id}`);
                } catch (error) {
                    console.error('[deleteTestimonial] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete testimonial. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteTestimonial] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete testimonial. Please try again.', 'error');
    }
}

// ============================================
// SERVICE ACTION HANDLERS
// ============================================

function viewService(id) {
    try {
        console.log(`[viewService] Attempting to view service with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid service ID provided');
        }

        const service = AdminCRUD.getService(id);
        if (!service) {
            AdminActionButtons.showToast('Service not found', 'error');
            console.error(`[viewService] Service with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(service);
        AdminActionButtons.showModal(
            `<i class="fas fa-wrench me-2"></i>View Service: ${service.serviceName}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editService(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewService] Successfully displayed service: ${service.serviceName}`);
    } catch (error) {
        console.error('[viewService] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view service. Please try again.', 'error');
    }
}

function editService(id) {
    try {
        console.log(`[editService] Attempting to edit service with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid service ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditServiceModal', id, () => {
            // Fallback handler
            const service = AdminCRUD.getService(id);
            if (!service) {
                AdminActionButtons.showToast('Service not found', 'error');
                console.error(`[editService] Service with ID ${id} not found`);
                return;
            }

            // Prompt for service name with validation
            const serviceName = promptWithValidation(
                'Service Name:', 
                service.serviceName,
                { required: true, minLength: 3, maxLength: 100 }
            );
            
            if (serviceName !== null) {
                AdminCRUD.updateService(id, { serviceName });
                AdminActionButtons.showToast('Service updated successfully!');
                if (typeof loadServices === 'function') loadServices();
                console.log(`[editService] Successfully updated service ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editService] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit service. Please try again.', 'error');
    }
}

function deleteService(id) {
    try {
        console.log(`[deleteService] Attempting to delete service with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid service ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this service?',
            () => {
                try {
                    AdminCRUD.deleteService(id);
                    AdminActionButtons.showToast('Service deleted successfully!');
                    if (typeof loadServices === 'function') loadServices();
                    console.log(`[deleteService] Successfully deleted service ID: ${id}`);
                } catch (error) {
                    console.error('[deleteService] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete service. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteService] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete service. Please try again.', 'error');
    }
}

// ============================================
// INVOICE ACTION HANDLERS
// ============================================

function viewInvoice(id) {
    try {
        console.log(`[viewInvoice] Attempting to view invoice with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid invoice ID provided');
        }

        const invoice = AdminCRUD.getInvoice(id);
        if (!invoice) {
            AdminActionButtons.showToast('Invoice not found', 'error');
            console.error(`[viewInvoice] Invoice with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(invoice);
        AdminActionButtons.showModal(
            `<i class="fas fa-file-invoice-dollar me-2"></i>View Invoice #${id}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editInvoice(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewInvoice] Successfully displayed invoice ID: ${id}`);
    } catch (error) {
        console.error('[viewInvoice] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view invoice. Please try again.', 'error');
    }
}

function editInvoice(id) {
    try {
        console.log(`[editInvoice] Attempting to edit invoice with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid invoice ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditInvoiceModal', id, () => {
            // Fallback handler
            const invoice = AdminCRUD.getInvoice(id);
            if (!invoice) {
                AdminActionButtons.showToast('Invoice not found', 'error');
                console.error(`[editInvoice] Invoice with ID ${id} not found`);
                return;
            }

            // Prompt for invoice amount with validation
            const amount = promptWithValidation(
                'Invoice Amount:', 
                invoice.amount,
                { required: true, type: 'number', pattern: /^\d+(\.\d{1,2})?$/ }
            );
            
            if (amount !== null) {
                AdminCRUD.updateInvoice(id, { amount });
                AdminActionButtons.showToast('Invoice updated successfully!');
                if (typeof loadInvoices === 'function') loadInvoices();
                console.log(`[editInvoice] Successfully updated invoice ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editInvoice] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit invoice. Please try again.', 'error');
    }
}

function deleteInvoice(id) {
    try {
        console.log(`[deleteInvoice] Attempting to delete invoice with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid invoice ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this invoice?',
            () => {
                try {
                    AdminCRUD.deleteInvoice(id);
                    AdminActionButtons.showToast('Invoice deleted successfully!');
                    if (typeof loadInvoices === 'function') loadInvoices();
                    console.log(`[deleteInvoice] Successfully deleted invoice ID: ${id}`);
                } catch (error) {
                    console.error('[deleteInvoice] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete invoice. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteInvoice] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete invoice. Please try again.', 'error');
    }
}

// ============================================
// SCHEDULE ACTION HANDLERS
// ============================================

function viewScheduleEvent(id) {
    try {
        console.log(`[viewScheduleEvent] Attempting to view schedule event with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid schedule event ID provided');
        }

        const event = AdminCRUD.getScheduleEvent(id);
        if (!event) {
            AdminActionButtons.showToast('Event not found', 'error');
            console.error(`[viewScheduleEvent] Schedule event with ID ${id} not found`);
            return;
        }

        const content = AdminActionButtons.formatDataTable(event);
        AdminActionButtons.showModal(
            `<i class="fas fa-calendar-alt me-2"></i>View Event: ${event.title}`,
            content,
            [
                {
                    label: 'Edit',
                    class: 'btn-warning',
                    icon: 'fas fa-edit',
                    onclick: `editScheduleEvent(${id}); document.getElementById('dynamicActionModal').querySelector('[data-bs-dismiss]').click();`
                }
            ]
        );
        
        console.log(`[viewScheduleEvent] Successfully displayed schedule event: ${event.title}`);
    } catch (error) {
        console.error('[viewScheduleEvent] Error occurred:', error);
        AdminActionButtons.showToast('Failed to view event. Please try again.', 'error');
    }
}

function editScheduleEvent(id) {
    try {
        console.log(`[editScheduleEvent] Attempting to edit schedule event with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid schedule event ID provided');
        }

        // Use modal form or fallback to prompt-based editing
        useModalOrFallback('openEditScheduleEventModal', id, () => {
            // Fallback handler
            const event = AdminCRUD.getScheduleEvent(id);
            if (!event) {
                AdminActionButtons.showToast('Event not found', 'error');
                console.error(`[editScheduleEvent] Schedule event with ID ${id} not found`);
                return;
            }

            // Prompt for event title with validation
            const title = promptWithValidation(
                'Event Title:', 
                event.title,
                { required: true, minLength: 3, maxLength: 100 }
            );
            
            if (title !== null) {
                AdminCRUD.updateScheduleEvent(id, { title });
                AdminActionButtons.showToast('Event updated successfully!');
                if (typeof loadSchedule === 'function') loadSchedule();
                console.log(`[editScheduleEvent] Successfully updated schedule event ID: ${id} using fallback`);
            }
        });
    } catch (error) {
        console.error('[editScheduleEvent] Error occurred:', error);
        AdminActionButtons.showToast('Failed to edit event. Please try again.', 'error');
    }
}

function deleteScheduleEvent(id) {
    try {
        console.log(`[deleteScheduleEvent] Attempting to delete schedule event with ID: ${id}`);
        
        if (!id || id === null || id === undefined) {
            throw new Error('Invalid schedule event ID provided');
        }

        AdminActionButtons.confirmAction(
            'Are you sure you want to delete this event?',
            () => {
                try {
                    AdminCRUD.deleteScheduleEvent(id);
                    AdminActionButtons.showToast('Event deleted successfully!');
                    if (typeof loadSchedule === 'function') loadSchedule();
                    console.log(`[deleteScheduleEvent] Successfully deleted schedule event ID: ${id}`);
                } catch (error) {
                    console.error('[deleteScheduleEvent] Error during deletion:', error);
                    AdminActionButtons.showToast('Failed to delete event. Please try again.', 'error');
                }
            }
        );
    } catch (error) {
        console.error('[deleteScheduleEvent] Error occurred:', error);
        AdminActionButtons.showToast('Failed to delete event. Please try again.', 'error');
    }
}

// ============================================
// EXPOSE ALL HANDLERS GLOBALLY
// Requirements: 10.1 - Log handler registration status
// ============================================

DebugLogger.log('REGISTRATION', 'Starting handler registration process');

// Create namespace object with all handlers
window.AdminActionHandlers = {
    // Projects
    viewProject,
    editProject,
    deleteProject,
    
    // Clients
    viewClient,
    editClient,
    deleteClient,
    
    // Team Members
    viewTeamMember,
    editTeamMember,
    deleteTeamMember,
    
    // Inquiries
    viewInquiry,
    respondInquiry,
    deleteInquiry,
    
    // Blog Posts
    viewBlogPost,
    editBlogPost,
    deleteBlogPost,
    
    // Testimonials
    viewTestimonial,
    editTestimonial,
    deleteTestimonial,
    
    // Services
    viewService,
    editService,
    deleteService,
    
    // Invoices
    viewInvoice,
    editInvoice,
    deleteInvoice,
    
    // Schedule
    viewScheduleEvent,
    editScheduleEvent,
    deleteScheduleEvent
};

DebugLogger.log('REGISTRATION', 'AdminActionHandlers namespace created with all handlers');

// Also expose individual functions for backward compatibility
const handlersToRegister = [
    // Projects
    { name: 'viewProject', func: viewProject },
    { name: 'editProject', func: editProject },
    { name: 'deleteProject', func: deleteProject },
    
    // Clients
    { name: 'viewClient', func: viewClient },
    { name: 'editClient', func: editClient },
    { name: 'deleteClient', func: deleteClient },
    
    // Team Members
    { name: 'viewTeamMember', func: viewTeamMember },
    { name: 'editTeamMember', func: editTeamMember },
    { name: 'deleteTeamMember', func: deleteTeamMember },
    
    // Inquiries
    { name: 'viewInquiry', func: viewInquiry },
    { name: 'respondInquiry', func: respondInquiry },
    { name: 'deleteInquiry', func: deleteInquiry },
    
    // Blog Posts
    { name: 'viewBlogPost', func: viewBlogPost },
    { name: 'editBlogPost', func: editBlogPost },
    { name: 'deleteBlogPost', func: deleteBlogPost },
    
    // Testimonials
    { name: 'viewTestimonial', func: viewTestimonial },
    { name: 'editTestimonial', func: editTestimonial },
    { name: 'deleteTestimonial', func: deleteTestimonial },
    
    // Services
    { name: 'viewService', func: viewService },
    { name: 'editService', func: editService },
    { name: 'deleteService', func: deleteService },
    
    // Invoices
    { name: 'viewInvoice', func: viewInvoice },
    { name: 'editInvoice', func: editInvoice },
    { name: 'deleteInvoice', func: deleteInvoice },
    
    // Schedule
    { name: 'viewScheduleEvent', func: viewScheduleEvent },
    { name: 'editScheduleEvent', func: editScheduleEvent },
    { name: 'deleteScheduleEvent', func: deleteScheduleEvent }
];

// Register each handler and log the registration
let successCount = 0;
let failureCount = 0;

handlersToRegister.forEach(({ name, func }) => {
    try {
        window[name] = func;
        DebugLogger.logRegistration(name, true);
        successCount++;
    } catch (error) {
        DebugLogger.logRegistration(name, false);
        DebugLogger.logError('REGISTRATION', error, { handlerName: name });
        failureCount++;
    }
});

console.log('Admin Action Handlers loaded successfully');
console.log(`✓ All handler functions exposed globally (${successCount} registered, ${failureCount} failed)`);
console.log('✓ AdminActionHandlers namespace created');
console.log('✓ Individual handler functions available on window object');

DebugLogger.log('REGISTRATION', `Handler registration complete: ${successCount} successful, ${failureCount} failed`);
DebugLogger.logInit('AdminActionHandlers', failureCount === 0, {
    totalHandlers: handlersToRegister.length,
    successCount,
    failureCount,
    timestamp: new Date().toISOString()
});
