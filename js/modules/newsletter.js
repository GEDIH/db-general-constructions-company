/**
 * Newsletter Module
 * Handles newsletter subscription, confirmation, and unsubscribe functionality
 */

class Newsletter {
    constructor(formId) {
        this.formId = formId;
        this.form = document.getElementById(formId);
        this.storageKey = 'newsletter_subscribers';
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubscribe(e));
        }

        // Check for confirmation token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            this.confirmSubscription(token);
        }
    }

    /**
     * Validate email format according to RFC 5322 standards
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    validateEmail(email) {
        // RFC 5322 compliant email regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    /**
     * Generate a unique confirmation token
     * @returns {string} - Unique token
     */
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get all subscribers from storage
     * @returns {Array} - Array of subscriber objects
     */
    getSubscribers() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save subscribers to storage
     * @param {Array} subscribers - Array of subscriber objects
     */
    saveSubscribers(subscribers) {
        localStorage.setItem(this.storageKey, JSON.stringify(subscribers));
    }

    /**
     * Check if email is already subscribed
     * @param {string} email - Email to check
     * @returns {Object|null} - Subscriber object if found, null otherwise
     */
    findSubscriber(email) {
        const subscribers = this.getSubscribers();
        return subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Subscribe a new email address (localStorage fallback)
     * @param {string} email - Email address to subscribe
     * @returns {Object} - Result object with success status and message
     */
    subscribeToLocalStorage(email) {
        // Check for duplicate subscription
        const existing = this.findSubscriber(email);
        if (existing) {
            if (existing.status === 'confirmed') {
                return {
                    success: false,
                    message: 'This email is already subscribed to our newsletter.'
                };
            } else if (existing.status === 'pending') {
                return {
                    success: false,
                    message: 'A confirmation email has already been sent to this address. Please check your inbox.'
                };
            } else if (existing.status === 'unsubscribed') {
                // Allow re-subscription
                existing.status = 'pending';
                existing.subscribedAt = new Date().toISOString();
                existing.confirmationToken = this.generateToken();
                existing.confirmedAt = null;
                
                const subscribers = this.getSubscribers();
                const index = subscribers.findIndex(sub => sub.email.toLowerCase() === email.toLowerCase());
                subscribers[index] = existing;
                this.saveSubscribers(subscribers);
                
                this.sendConfirmation(email, existing.confirmationToken);
                
                return {
                    success: true,
                    message: 'Thank you for re-subscribing! Please check your email to confirm your subscription.'
                };
            }
        }

        // Create new subscription
        const subscriber = {
            id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            email: email,
            status: 'pending',
            subscribedAt: new Date().toISOString(),
            confirmedAt: null,
            confirmationToken: this.generateToken()
        };

        const subscribers = this.getSubscribers();
        subscribers.push(subscriber);
        this.saveSubscribers(subscribers);

        // Send confirmation email
        this.sendConfirmation(email, subscriber.confirmationToken);

        return {
            success: true,
            message: 'Thank you for subscribing! Please check your email to confirm your subscription.'
        };
    }

    /**
     * Subscribe a new email address (with backend API)
     * @param {string} email - Email address to subscribe
     * @returns {Promise<Object>} - Result object with success status and message
     */
    async subscribe(email) {
        // Validate email format
        if (!this.validateEmail(email)) {
            return {
                success: false,
                message: 'Please enter a valid email address.'
            };
        }

        try {
            // Try to use backend API first
            if (typeof API !== 'undefined' && API.newsletter) {
                const response = await API.newsletter.subscribe({ email });
                
                if (response.success) {
                    // Also save to localStorage as backup
                    const subscriber = {
                        id: response.data?.id || 'sub_' + Date.now(),
                        email: email,
                        status: 'pending',
                        subscribedAt: new Date().toISOString(),
                        confirmedAt: null,
                        confirmationToken: response.data?.confirmation_token || this.generateToken()
                    };
                    
                    const subscribers = this.getSubscribers();
                    subscribers.push(subscriber);
                    this.saveSubscribers(subscribers);
                    
                    return {
                        success: true,
                        message: 'Thank you for subscribing! Please check your email to confirm your subscription.'
                    };
                } else {
                    // API returned error, check if it's a duplicate
                    if (response.message && response.message.toLowerCase().includes('already')) {
                        return {
                            success: false,
                            message: 'This email is already subscribed to our newsletter.'
                        };
                    }
                    // Fall through to localStorage method
                }
            }
        } catch (error) {
            console.warn('API subscription failed, using localStorage fallback:', error);
            // Fall through to localStorage method
        }

        // Fallback to localStorage (original method)
        return this.subscribeToLocalStorage(email);
    }

    /**
     * Send confirmation email (simulated)
     * @param {string} email - Email address
     * @param {string} token - Confirmation token
     */
    sendConfirmation(email, token) {
        // In production, this would make an API call to send an actual email
        const confirmationUrl = `${window.location.origin}/newsletter-confirm.html?token=${token}`;
        
        console.log('Confirmation email sent to:', email);
        console.log('Confirmation URL:', confirmationUrl);
        
        // Simulate email sending delay
        setTimeout(() => {
            console.log('Email delivered successfully');
        }, 1000);
    }

    /**
     * Confirm subscription with token
     * @param {string} token - Confirmation token
     * @returns {Object} - Result object with success status and message
     */
    confirmSubscription(token) {
        const subscribers = this.getSubscribers();
        const subscriber = subscribers.find(sub => sub.confirmationToken === token);

        if (!subscriber) {
            return {
                success: false,
                message: 'Invalid or expired confirmation link.'
            };
        }

        if (subscriber.status === 'confirmed') {
            return {
                success: false,
                message: 'This subscription has already been confirmed.'
            };
        }

        // Update subscription status
        subscriber.status = 'confirmed';
        subscriber.confirmedAt = new Date().toISOString();

        const index = subscribers.findIndex(sub => sub.confirmationToken === token);
        subscribers[index] = subscriber;
        this.saveSubscribers(subscribers);

        return {
            success: true,
            message: 'Your subscription has been confirmed! Thank you for subscribing to our newsletter.'
        };
    }

    /**
     * Unsubscribe an email address
     * @param {string} email - Email address to unsubscribe
     * @returns {Object} - Result object with success status and message
     */
    unsubscribe(email) {
        const subscribers = this.getSubscribers();
        const subscriber = this.findSubscriber(email);

        if (!subscriber) {
            return {
                success: false,
                message: 'This email address is not in our subscription list.'
            };
        }

        if (subscriber.status === 'unsubscribed') {
            return {
                success: false,
                message: 'This email is already unsubscribed.'
            };
        }

        // Update status to unsubscribed
        subscriber.status = 'unsubscribed';
        subscriber.unsubscribedAt = new Date().toISOString();

        const index = subscribers.findIndex(sub => sub.email.toLowerCase() === email.toLowerCase());
        subscribers[index] = subscriber;
        this.saveSubscribers(subscribers);

        return {
            success: true,
            message: 'You have been successfully unsubscribed from our newsletter.'
        };
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submit event
     */
    async handleSubscribe(e) {
        e.preventDefault();

        const emailInput = this.form.querySelector('input[type="email"]');
        const submitButton = this.form.querySelector('button[type="submit"]');
        const messageDiv = this.form.querySelector('.newsletter-message') || this.createMessageDiv();

        if (!emailInput) {
            console.error('Email input not found in form');
            return;
        }

        const email = emailInput.value.trim();

        // Show loading state
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Subscribing...';

        try {
            // Call subscribe method (now async)
            const result = await this.subscribe(email);

            // Show message
            messageDiv.className = `newsletter-message alert alert-${result.success ? 'success' : 'danger'} mt-3`;
            messageDiv.textContent = result.message;
            messageDiv.style.display = 'block';

            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;

            // Clear input on success
            if (result.success) {
                emailInput.value = '';
            }

            // Hide message after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            
            // Show error message
            messageDiv.className = 'newsletter-message alert alert-danger mt-3';
            messageDiv.textContent = 'An error occurred. Please try again later.';
            messageDiv.style.display = 'block';

            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    /**
     * Create message div if it doesn't exist
     * @returns {HTMLElement} - Message div element
     */
    createMessageDiv() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'newsletter-message';
        messageDiv.style.display = 'none';
        this.form.appendChild(messageDiv);
        return messageDiv;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Newsletter;
}
