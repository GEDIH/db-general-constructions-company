/**
 * Admin Action Button Diagnostic Utilities
 * Provides comprehensive diagnostic and debugging tools for the action button system
 * Requirements: 10.4, 10.5
 */

const AdminActionDiagnostics = (function() {
    'use strict';

    /**
     * Verify that all handler functions are properly registered
     * Requirements: 10.4 - Provide detailed information about event bindings and handler execution
     * @returns {object} - Verification results
     */
    function verifyRegistration() {
        console.group('🔍 Handler Registration Verification');
        
        const results = {
            timestamp: new Date().toISOString(),
            success: true,
            totalHandlers: 0,
            registeredHandlers: [],
            missingHandlers: [],
            namespaceExists: false,
            details: {}
        };

        // Check if AdminActionHandlers namespace exists
        results.namespaceExists = typeof window.AdminActionHandlers !== 'undefined';
        
        if (results.namespaceExists) {
            console.log('✓ AdminActionHandlers namespace exists');
        } else {
            console.error('✗ AdminActionHandlers namespace NOT found');
            results.success = false;
        }

        // List of all expected handler functions
        const expectedHandlers = [
            // Projects
            'viewProject', 'editProject', 'deleteProject',
            // Clients
            'viewClient', 'editClient', 'deleteClient',
            // Team Members
            'viewTeamMember', 'editTeamMember', 'deleteTeamMember',
            // Inquiries
            'viewInquiry', 'respondInquiry', 'deleteInquiry',
            // Blog Posts
            'viewBlogPost', 'editBlogPost', 'deleteBlogPost',
            // Testimonials
            'viewTestimonial', 'editTestimonial', 'deleteTestimonial',
            // Services
            'viewService', 'editService', 'deleteService',
            // Invoices
            'viewInvoice', 'editInvoice', 'deleteInvoice',
            // Schedule
            'viewScheduleEvent', 'editScheduleEvent', 'deleteScheduleEvent'
        ];

        results.totalHandlers = expectedHandlers.length;

        console.group('Handler Function Verification');
        
        expectedHandlers.forEach(handlerName => {
            const existsOnWindow = typeof window[handlerName] === 'function';
            const existsInNamespace = results.namespaceExists && 
                                     typeof window.AdminActionHandlers[handlerName] === 'function';
            
            const status = {
                name: handlerName,
                onWindow: existsOnWindow,
                inNamespace: existsInNamespace,
                accessible: existsOnWindow || existsInNamespace
            };

            if (status.accessible) {
                results.registeredHandlers.push(handlerName);
                console.log(`%c✓ ${handlerName}`, 'color: green', status);
            } else {
                results.missingHandlers.push(handlerName);
                results.success = false;
                console.error(`%c✗ ${handlerName}`, 'color: red', status);
            }

            results.details[handlerName] = status;
        });

        console.groupEnd();

        // Summary
        console.group('Summary');
        console.log(`Total handlers expected: ${results.totalHandlers}`);
        console.log(`%cRegistered: ${results.registeredHandlers.length}`, 'color: green; font-weight: bold');
        console.log(`%cMissing: ${results.missingHandlers.length}`, 'color: red; font-weight: bold');
        
        if (results.missingHandlers.length > 0) {
            console.error('Missing handlers:', results.missingHandlers);
        }
        
        console.log(`Overall status: ${results.success ? '✓ PASS' : '✗ FAIL'}`);
        console.groupEnd();

        console.groupEnd();

        return results;
    }

    /**
     * Log the current binding status of all action buttons
     * Requirements: 10.2 - Log button binding operations
     * @returns {object} - Binding status information
     */
    function logBindingStatus() {
        console.group('🔗 Action Button Binding Status');

        const results = {
            timestamp: new Date().toISOString(),
            binderAvailable: typeof window.ActionButtonBinder !== 'undefined',
            delegatorAvailable: typeof window.ActionButtonDelegator !== 'undefined',
            binderStatus: null,
            delegatorStatus: null,
            panelAnalysis: []
        };

        // Check ActionButtonBinder status
        if (results.binderAvailable) {
            console.log('✓ ActionButtonBinder is available');
            
            if (window.ActionButtonBinder.logBindingStatus) {
                window.ActionButtonBinder.logBindingStatus();
            }
            
            if (window.ActionButtonBinder.getDiagnostics) {
                results.binderStatus = window.ActionButtonBinder.getDiagnostics();
            }
        } else {
            console.error('✗ ActionButtonBinder is NOT available');
        }

        // Check ActionButtonDelegator status
        if (results.delegatorAvailable) {
            console.log('✓ ActionButtonDelegator is available');
            
            if (window.ActionButtonDelegator.logStatus) {
                window.ActionButtonDelegator.logStatus();
            }
            
            if (window.ActionButtonDelegator.getDiagnostics) {
                results.delegatorStatus = window.ActionButtonDelegator.getDiagnostics();
            }
        } else {
            console.error('✗ ActionButtonDelegator is NOT available');
        }

        // Analyze each panel
        console.group('Panel-by-Panel Analysis');
        
        const panels = document.querySelectorAll('[id$="Panel"]');
        
        panels.forEach(panel => {
            const panelId = panel.id;
            const buttons = panel.querySelectorAll(
                'button[onclick*="view"], button[onclick*="edit"], button[onclick*="delete"], button[onclick*="respond"], ' +
                '.btn-view, .btn-edit, .btn-delete, .btn-respond, ' +
                '[data-action="view"], [data-action="edit"], [data-action="delete"], [data-action="respond"]'
            );

            const panelInfo = {
                panelId,
                totalButtons: buttons.length,
                buttonTypes: {
                    view: 0,
                    edit: 0,
                    delete: 0,
                    respond: 0
                },
                boundButtons: 0,
                unboundButtons: 0
            };

            buttons.forEach(button => {
                // Determine button type
                const onclick = button.getAttribute('onclick') || '';
                const dataAction = button.getAttribute('data-action') || '';
                
                if (onclick.includes('view') || dataAction === 'view' || button.classList.contains('btn-view')) {
                    panelInfo.buttonTypes.view++;
                } else if (onclick.includes('edit') || dataAction === 'edit' || button.classList.contains('btn-edit')) {
                    panelInfo.buttonTypes.edit++;
                } else if (onclick.includes('delete') || dataAction === 'delete' || button.classList.contains('btn-delete')) {
                    panelInfo.buttonTypes.delete++;
                } else if (onclick.includes('respond') || dataAction === 'respond' || button.classList.contains('btn-respond')) {
                    panelInfo.buttonTypes.respond++;
                }

                // Check if button is bound (has onclick or event listener)
                if (button.onclick || button.getAttribute('onclick')) {
                    panelInfo.boundButtons++;
                } else {
                    panelInfo.unboundButtons++;
                }
            });

            results.panelAnalysis.push(panelInfo);

            console.group(panelId);
            console.log(`Total buttons: ${panelInfo.totalButtons}`);
            console.log('Button types:', panelInfo.buttonTypes);
            console.log(`%cBound: ${panelInfo.boundButtons}`, 'color: green');
            console.log(`%cUnbound: ${panelInfo.unboundButtons}`, panelInfo.unboundButtons > 0 ? 'color: red' : 'color: gray');
            console.groupEnd();
        });

        console.groupEnd();

        // Summary table
        console.group('Summary Table');
        console.table(results.panelAnalysis);
        console.groupEnd();

        console.groupEnd();

        return results;
    }

    /**
     * Test a specific handler function with a test ID
     * Requirements: 10.3 - Log handler execution start and completion
     * @param {string} handlerName - Name of the handler function to test
     * @param {number} testId - Test ID to use (optional, defaults to 1)
     * @returns {object} - Test results
     */
    function testHandler(handlerName, testId = 1) {
        console.group(`🧪 Testing Handler: ${handlerName}(${testId})`);

        const results = {
            timestamp: new Date().toISOString(),
            handlerName,
            testId,
            exists: false,
            callable: false,
            executionSuccess: false,
            executionTime: null,
            error: null
        };

        // Check if handler exists
        results.exists = typeof window[handlerName] === 'function';
        
        if (!results.exists) {
            console.error(`✗ Handler "${handlerName}" does not exist`);
            results.error = `Handler function "${handlerName}" not found`;
            console.groupEnd();
            return results;
        }

        console.log(`✓ Handler "${handlerName}" exists`);
        results.callable = true;

        // Try to execute the handler
        console.log(`Executing ${handlerName}(${testId})...`);
        
        const startTime = performance.now();
        
        try {
            const result = window[handlerName](testId);
            const endTime = performance.now();
            results.executionTime = (endTime - startTime).toFixed(2);
            
            results.executionSuccess = true;
            console.log(`%c✓ Handler executed successfully in ${results.executionTime}ms`, 'color: green; font-weight: bold');
            
            // Check if result is a promise
            if (result && typeof result.then === 'function') {
                console.log('ℹ Handler returned a Promise');
            }
            
        } catch (error) {
            const endTime = performance.now();
            results.executionTime = (endTime - startTime).toFixed(2);
            results.executionSuccess = false;
            results.error = error.message;
            
            console.error(`%c✗ Handler execution failed after ${results.executionTime}ms`, 'color: red; font-weight: bold');
            console.error('Error:', error);
        }

        console.groupEnd();

        return results;
    }

    /**
     * Get comprehensive diagnostics for the entire action button system
     * Requirements: 10.4, 10.5 - Provide detailed information and detect missing handlers
     * @returns {object} - Complete diagnostic information
     */
    function getDiagnostics() {
        console.group('📊 Complete System Diagnostics');

        const diagnostics = {
            timestamp: new Date().toISOString(),
            systemStatus: 'unknown',
            components: {},
            handlers: {},
            bindings: {},
            initialization: {},
            recommendations: []
        };

        // 1. Check core components
        console.group('1. Core Components');
        
        diagnostics.components = {
            AdminCRUD: typeof AdminCRUD !== 'undefined',
            AdminActionButtons: typeof AdminActionButtons !== 'undefined',
            AdminActionHandlers: typeof window.AdminActionHandlers !== 'undefined',
            ActionButtonBinder: typeof window.ActionButtonBinder !== 'undefined',
            ActionButtonDelegator: typeof window.ActionButtonDelegator !== 'undefined',
            DebugLogger: typeof window.DebugLogger !== 'undefined'
        };

        Object.entries(diagnostics.components).forEach(([name, available]) => {
            if (available) {
                console.log(`%c✓ ${name}`, 'color: green');
            } else {
                console.error(`%c✗ ${name}`, 'color: red');
                diagnostics.recommendations.push(`Load ${name} module`);
            }
        });

        console.groupEnd();

        // 2. Handler registration status
        console.group('2. Handler Registration');
        const handlerVerification = verifyRegistration();
        diagnostics.handlers = {
            totalExpected: handlerVerification.totalHandlers,
            registered: handlerVerification.registeredHandlers.length,
            missing: handlerVerification.missingHandlers.length,
            missingList: handlerVerification.missingHandlers,
            success: handlerVerification.success
        };
        
        if (!handlerVerification.success) {
            diagnostics.recommendations.push('Register missing handler functions');
        }
        console.groupEnd();

        // 3. Button binding status
        console.group('3. Button Bindings');
        const bindingStatus = logBindingStatus();
        diagnostics.bindings = {
            binderAvailable: bindingStatus.binderAvailable,
            delegatorAvailable: bindingStatus.delegatorAvailable,
            totalPanels: bindingStatus.panelAnalysis.length,
            totalButtons: bindingStatus.panelAnalysis.reduce((sum, p) => sum + p.totalButtons, 0),
            boundButtons: bindingStatus.panelAnalysis.reduce((sum, p) => sum + p.boundButtons, 0),
            unboundButtons: bindingStatus.panelAnalysis.reduce((sum, p) => sum + p.unboundButtons, 0),
            panels: bindingStatus.panelAnalysis
        };

        if (diagnostics.bindings.unboundButtons > 0) {
            diagnostics.recommendations.push(`Bind ${diagnostics.bindings.unboundButtons} unbound buttons`);
        }
        console.groupEnd();

        // 4. Initialization status
        console.group('4. Initialization Status');
        
        if (typeof window.ActionButtonInitResult !== 'undefined') {
            diagnostics.initialization = window.ActionButtonInitResult;
            console.log('✓ Initialization result available');
            console.log('Success:', diagnostics.initialization.success);
            console.log('Bound buttons:', diagnostics.initialization.boundButtons);
            
            if (diagnostics.initialization.errors && diagnostics.initialization.errors.length > 0) {
                console.error('Initialization errors:', diagnostics.initialization.errors);
                diagnostics.recommendations.push('Fix initialization errors');
            }
        } else {
            console.warn('⚠ No initialization result found');
            diagnostics.initialization = { available: false };
            diagnostics.recommendations.push('Run initializeActionButtons()');
        }
        
        console.groupEnd();

        // 5. Debug mode status
        console.group('5. Debug Mode');
        const debugMode = window.DEBUG_ACTION_BUTTONS || false;
        diagnostics.debugMode = debugMode;
        
        if (debugMode) {
            console.log('%c✓ Debug mode is ENABLED', 'color: green; font-weight: bold');
        } else {
            console.log('%c○ Debug mode is DISABLED', 'color: gray');
            console.log('Enable with: window.DEBUG_ACTION_BUTTONS = true');
        }
        console.groupEnd();

        // 6. Determine overall system status
        const allComponentsAvailable = Object.values(diagnostics.components).every(v => v === true);
        const handlersRegistered = diagnostics.handlers.success;
        const buttonsAllBound = diagnostics.bindings.unboundButtons === 0;
        const initializationSuccess = diagnostics.initialization.success === true;

        if (allComponentsAvailable && handlersRegistered && buttonsAllBound && initializationSuccess) {
            diagnostics.systemStatus = 'healthy';
            console.log('%c✓ System Status: HEALTHY', 'color: green; font-size: 16px; font-weight: bold');
        } else if (allComponentsAvailable && handlersRegistered) {
            diagnostics.systemStatus = 'functional';
            console.log('%c⚠ System Status: FUNCTIONAL (with issues)', 'color: orange; font-size: 16px; font-weight: bold');
        } else {
            diagnostics.systemStatus = 'degraded';
            console.log('%c✗ System Status: DEGRADED', 'color: red; font-size: 16px; font-weight: bold');
        }

        // 7. Recommendations
        if (diagnostics.recommendations.length > 0) {
            console.group('📋 Recommendations');
            diagnostics.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec}`);
            });
            console.groupEnd();
        } else {
            console.log('%c✓ No recommendations - system is operating optimally', 'color: green');
        }

        console.groupEnd();

        return diagnostics;
    }

    /**
     * Run a quick health check of the action button system
     * @returns {object} - Health check results
     */
    function healthCheck() {
        console.group('🏥 Quick Health Check');

        const health = {
            timestamp: new Date().toISOString(),
            status: 'unknown',
            checks: {
                componentsLoaded: false,
                handlersRegistered: false,
                buttonsInitialized: false,
                noErrors: false
            },
            score: 0,
            maxScore: 4
        };

        // Check 1: Components loaded
        const componentsLoaded = 
            typeof AdminCRUD !== 'undefined' &&
            typeof AdminActionButtons !== 'undefined' &&
            typeof window.AdminActionHandlers !== 'undefined';
        
        health.checks.componentsLoaded = componentsLoaded;
        if (componentsLoaded) {
            console.log('%c✓ Core components loaded', 'color: green');
            health.score++;
        } else {
            console.error('%c✗ Core components missing', 'color: red');
        }

        // Check 2: Handlers registered
        const sampleHandlers = ['viewProject', 'editClient', 'deleteTeamMember'];
        const handlersRegistered = sampleHandlers.every(h => typeof window[h] === 'function');
        
        health.checks.handlersRegistered = handlersRegistered;
        if (handlersRegistered) {
            console.log('%c✓ Handlers registered', 'color: green');
            health.score++;
        } else {
            console.error('%c✗ Handlers not registered', 'color: red');
        }

        // Check 3: Buttons initialized
        const buttonsInitialized = 
            typeof window.ActionButtonBinder !== 'undefined' &&
            typeof window.ActionButtonDelegator !== 'undefined';
        
        health.checks.buttonsInitialized = buttonsInitialized;
        if (buttonsInitialized) {
            console.log('%c✓ Button system initialized', 'color: green');
            health.score++;
        } else {
            console.error('%c✗ Button system not initialized', 'color: red');
        }

        // Check 4: No initialization errors
        const noErrors = 
            typeof window.ActionButtonInitResult === 'undefined' ||
            (window.ActionButtonInitResult.errors && window.ActionButtonInitResult.errors.length === 0);
        
        health.checks.noErrors = noErrors;
        if (noErrors) {
            console.log('%c✓ No initialization errors', 'color: green');
            health.score++;
        } else {
            console.error('%c✗ Initialization errors detected', 'color: red');
        }

        // Determine overall health status
        const percentage = (health.score / health.maxScore) * 100;
        
        if (percentage === 100) {
            health.status = 'excellent';
            console.log(`%c✓ Health: EXCELLENT (${health.score}/${health.maxScore})`, 'color: green; font-size: 14px; font-weight: bold');
        } else if (percentage >= 75) {
            health.status = 'good';
            console.log(`%c⚠ Health: GOOD (${health.score}/${health.maxScore})`, 'color: orange; font-size: 14px; font-weight: bold');
        } else if (percentage >= 50) {
            health.status = 'fair';
            console.log(`%c⚠ Health: FAIR (${health.score}/${health.maxScore})`, 'color: orange; font-size: 14px; font-weight: bold');
        } else {
            health.status = 'poor';
            console.log(`%c✗ Health: POOR (${health.score}/${health.maxScore})`, 'color: red; font-size: 14px; font-weight: bold');
        }

        console.groupEnd();

        return health;
    }

    /**
     * Test all handlers with a sample ID
     * @param {number} testId - Test ID to use (defaults to 1)
     * @returns {object} - Test results for all handlers
     */
    function testAllHandlers(testId = 1) {
        console.group(`🧪 Testing All Handlers with ID: ${testId}`);

        const handlers = [
            'viewProject', 'editProject', 'deleteProject',
            'viewClient', 'editClient', 'deleteClient',
            'viewTeamMember', 'editTeamMember', 'deleteTeamMember',
            'viewInquiry', 'respondInquiry', 'deleteInquiry'
        ];

        const results = {
            timestamp: new Date().toISOString(),
            testId,
            totalHandlers: handlers.length,
            passed: 0,
            failed: 0,
            details: []
        };

        handlers.forEach(handlerName => {
            const result = testHandler(handlerName, testId);
            results.details.push(result);
            
            if (result.executionSuccess) {
                results.passed++;
            } else {
                results.failed++;
            }
        });

        console.group('Summary');
        console.log(`Total handlers tested: ${results.totalHandlers}`);
        console.log(`%cPassed: ${results.passed}`, 'color: green; font-weight: bold');
        console.log(`%cFailed: ${results.failed}`, 'color: red; font-weight: bold');
        console.groupEnd();

        console.groupEnd();

        return results;
    }

    /**
     * Enable verbose debug logging
     */
    function enableDebugMode() {
        window.DEBUG_ACTION_BUTTONS = true;
        
        if (window.ActionButtonBinder && window.ActionButtonBinder.enableDebugMode) {
            window.ActionButtonBinder.enableDebugMode();
        }
        
        if (window.ActionButtonDelegator && window.ActionButtonDelegator.enableDebugMode) {
            window.ActionButtonDelegator.enableDebugMode();
        }
        
        console.log('%c✓ Debug mode ENABLED', 'color: green; font-size: 14px; font-weight: bold');
        console.log('All action button operations will now be logged in detail');
    }

    /**
     * Disable verbose debug logging
     */
    function disableDebugMode() {
        window.DEBUG_ACTION_BUTTONS = false;
        
        if (window.ActionButtonBinder && window.ActionButtonBinder.disableDebugMode) {
            window.ActionButtonBinder.disableDebugMode();
        }
        
        if (window.ActionButtonDelegator && window.ActionButtonDelegator.disableDebugMode) {
            window.ActionButtonDelegator.disableDebugMode();
        }
        
        console.log('%c○ Debug mode DISABLED', 'color: gray; font-size: 14px');
    }

    // Public API
    return {
        verifyRegistration,
        logBindingStatus,
        testHandler,
        getDiagnostics,
        healthCheck,
        testAllHandlers,
        enableDebugMode,
        disableDebugMode
    };
})();

// Make available globally
window.AdminActionDiagnostics = AdminActionDiagnostics;

// Add convenient console commands
console.log('%c📊 Admin Action Diagnostics Loaded', 'color: blue; font-size: 16px; font-weight: bold');
console.log('%cAvailable diagnostic commands:', 'color: blue; font-weight: bold');
console.log('  AdminActionDiagnostics.healthCheck()          - Quick health check');
console.log('  AdminActionDiagnostics.getDiagnostics()       - Complete system diagnostics');
console.log('  AdminActionDiagnostics.verifyRegistration()   - Verify handler registration');
console.log('  AdminActionDiagnostics.logBindingStatus()     - Check button bindings');
console.log('  AdminActionDiagnostics.testHandler(name, id)  - Test specific handler');
console.log('  AdminActionDiagnostics.testAllHandlers(id)    - Test all handlers');
console.log('  AdminActionDiagnostics.enableDebugMode()      - Enable verbose logging');
console.log('  AdminActionDiagnostics.disableDebugMode()     - Disable verbose logging');
console.log('%cShortcuts:', 'color: blue; font-weight: bold');
console.log('  window.diagnostics = AdminActionDiagnostics');
console.log('  window.diag = AdminActionDiagnostics');

// Create convenient shortcuts
window.diagnostics = AdminActionDiagnostics;
window.diag = AdminActionDiagnostics;
