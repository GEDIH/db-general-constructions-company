/**
 * Live Chat System Module
 * Provides real-time communication between users and support staff
 */

class LiveChat {
  constructor(widgetId = 'live-chat-widget') {
    this.widgetId = widgetId;
    this.widget = null;
    this.chatWindow = null;
    this.messageArea = null;
    this.inputField = null;
    this.sessionId = this.generateSessionId();
    this.isOpen = false;
    this.isAvailable = true; // Simulated availability
    
    this.init();
  }

  /**
   * Initialize the chat widget
   */
  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadChatHistory();
    this.checkAvailability();
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    const existing = localStorage.getItem('chat_session_id');
    if (existing) return existing;
    
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_session_id', sessionId);
    return sessionId;
  }

  /**
   * Create the chat widget HTML structure
   */
  createWidget() {
    const widgetHTML = `
      <div id="${this.widgetId}" class="live-chat-widget">
        <!-- Chat Button -->
        <button class="chat-button" id="chat-toggle-btn" aria-label="Open chat">
          <i class="fas fa-comments"></i>
          <span class="chat-badge" id="chat-badge" style="display: none;">0</span>
        </button>

        <!-- Chat Window -->
        <div class="chat-window" id="chat-window" style="display: none;">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-header-info">
              <h3>DB Construction Support</h3>
              <span class="chat-status" id="chat-status">
                <span class="status-indicator online"></span>
                Online
              </span>
            </div>
            <div class="chat-header-actions">
              <button class="chat-action-btn" id="chat-minimize-btn" aria-label="Minimize chat">
                <i class="fas fa-minus"></i>
              </button>
              <button class="chat-action-btn" id="chat-close-btn" aria-label="Close chat">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Chat Messages Area -->
          <div class="chat-messages" id="chat-messages">
            <div class="chat-welcome-message">
              <div class="welcome-avatar">
                <i class="fas fa-user-tie"></i>
              </div>
              <p>Welcome to DB General Construction! How can we help you today?</p>
            </div>
          </div>

          <!-- Chat Input Area -->
          <div class="chat-input-area">
            <input 
              type="text" 
              id="chat-input" 
              class="chat-input" 
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button class="chat-send-btn" id="chat-send-btn" aria-label="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>

          <!-- Chat Footer -->
          <div class="chat-footer">
            <button class="chat-footer-btn" id="chat-email-transcript-btn">
              <i class="fas fa-envelope"></i>
              Email Transcript
            </button>
          </div>
        </div>
      </div>
    `;

    // Insert widget into body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Store references
    this.widget = document.getElementById(this.widgetId);
    this.chatWindow = document.getElementById('chat-window');
    this.messageArea = document.getElementById('chat-messages');
    this.inputField = document.getElementById('chat-input');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Toggle chat window
    document.getElementById('chat-toggle-btn').addEventListener('click', () => {
      this.toggleChat();
    });

    // Close chat
    document.getElementById('chat-close-btn').addEventListener('click', () => {
      this.closeChat();
    });

    // Minimize chat
    document.getElementById('chat-minimize-btn').addEventListener('click', () => {
      this.closeChat();
    });

    // Send message on button click
    document.getElementById('chat-send-btn').addEventListener('click', () => {
      this.sendMessage();
    });

    // Send message on Enter key
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Email transcript
    document.getElementById('chat-email-transcript-btn').addEventListener('click', () => {
      this.emailTranscript();
    });
  }

  /**
   * Toggle chat window open/close
   */
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  /**
   * Open chat window
   */
  openChat() {
    this.chatWindow.style.display = 'flex';
    this.isOpen = true;
    
    // Add opening animation
    setTimeout(() => {
      this.chatWindow.classList.add('chat-window-open');
    }, 10);

    // Focus input field
    setTimeout(() => {
      this.inputField.focus();
    }, 300);

    // Clear badge
    this.clearBadge();

    // Scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Close chat window
   */
  closeChat() {
    this.chatWindow.classList.remove('chat-window-open');
    
    setTimeout(() => {
      this.chatWindow.style.display = 'none';
      this.isOpen = false;
    }, 300);
  }

  /**
   * Send a message
   */
  sendMessage() {
    const message = this.inputField.value.trim();
    
    if (!message) return;

    // Create message object
    const messageObj = {
      id: 'msg_' + Date.now(),
      sessionId: this.sessionId,
      sender: 'user',
      message: message,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Display message
    this.displayMessage(messageObj);

    // Save to history
    this.saveMessage(messageObj);

    // Clear input
    this.inputField.value = '';

    // Simulate response
    this.simulateResponse(message);
  }

  /**
   * Display a message in the chat
   */
  displayMessage(messageObj) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.sender}-message`;
    messageEl.dataset.messageId = messageObj.id;

    const time = new Date(messageObj.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    messageEl.innerHTML = `
      <div class="message-content">
        <p>${this.escapeHtml(messageObj.message)}</p>
        <span class="message-time">${time}</span>
      </div>
    `;

    this.messageArea.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Simulate a response from support staff
   */
  simulateResponse(userMessage) {
    // Show typing indicator
    this.showTypingIndicator();

    // Simulate delay
    setTimeout(() => {
      this.hideTypingIndicator();

      // Check availability
      if (!this.isAvailable) {
        const offlineMessage = {
          id: 'msg_' + Date.now(),
          sessionId: this.sessionId,
          sender: 'bot',
          message: 'Thank you for your message. Our support team is currently offline. We typically respond within 24 hours. You can also email us at support@dbconstruction.com.',
          timestamp: new Date().toISOString(),
          read: true
        };
        this.displayMessage(offlineMessage);
        this.saveMessage(offlineMessage);
        return;
      }

      // Generate automated response
      const response = this.generateAutomatedResponse(userMessage);
      const responseMessage = {
        id: 'msg_' + Date.now(),
        sessionId: this.sessionId,
        sender: 'staff',
        message: response,
        timestamp: new Date().toISOString(),
        read: true
      };

      this.displayMessage(responseMessage);
      this.saveMessage(responseMessage);

      // Show notification if chat is closed
      if (!this.isOpen) {
        this.showBadge();
      }
    }, 1500 + Math.random() * 1000);
  }

  /**
   * Generate automated response based on user message
   */
  generateAutomatedResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
      return 'For pricing information, please use our Cost Calculator or request a quote through our contact form. A team member will get back to you with a detailed estimate.';
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('timeline')) {
      return 'Project timelines vary based on scope and complexity. Typically, residential projects take 3-6 months, while commercial projects may take 6-12 months. Would you like to discuss your specific project?';
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Thank you for contacting DB General Construction. How can I assist you today?';
    }
    
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }

    return 'Thank you for your message. A member of our team will respond shortly. In the meantime, feel free to browse our services or check out our project gallery.';
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message staff-message typing-indicator';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    this.messageArea.appendChild(typingEl);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  /**
   * Save message to localStorage
   */
  saveMessage(messageObj) {
    const history = this.getChatHistory();
    history.push(messageObj);
    localStorage.setItem(CONFIG.STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
  }

  /**
   * Get chat history from localStorage
   */
  getChatHistory() {
    const history = localStorage.getItem(CONFIG.STORAGE_KEYS.CHAT_HISTORY);
    return history ? JSON.parse(history) : [];
  }

  /**
   * Load chat history
   */
  loadChatHistory() {
    const history = this.getChatHistory();
    const sessionMessages = history.filter(msg => msg.sessionId === this.sessionId);
    
    sessionMessages.forEach(msg => {
      this.displayMessage(msg);
    });
  }

  /**
   * Check availability status (simulated)
   */
  checkAvailability() {
    // Simulate availability based on time
    const hour = new Date().getHours();
    this.isAvailable = hour >= 8 && hour < 18; // Available 8 AM - 6 PM

    const statusEl = document.getElementById('chat-status');
    const indicator = statusEl.querySelector('.status-indicator');
    
    if (this.isAvailable) {
      indicator.className = 'status-indicator online';
      statusEl.innerHTML = '<span class="status-indicator online"></span>Online';
    } else {
      indicator.className = 'status-indicator offline';
      statusEl.innerHTML = '<span class="status-indicator offline"></span>Offline';
    }
  }

  /**
   * Email transcript functionality
   */
  emailTranscript() {
    const email = prompt('Please enter your email address to receive the chat transcript:');
    
    if (!email) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Get transcript
    const transcript = this.getTranscript();
    
    // Simulate sending email
    console.log('Sending transcript to:', email);
    console.log('Transcript:', transcript);

    alert(`Chat transcript has been sent to ${email}. Please check your inbox.`);
  }

  /**
   * Get formatted transcript
   */
  getTranscript() {
    const history = this.getChatHistory();
    const sessionMessages = history.filter(msg => msg.sessionId === this.sessionId);
    
    let transcript = 'DB General Construction - Chat Transcript\n';
    transcript += '==========================================\n\n';
    
    sessionMessages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === 'user' ? 'You' : 'Support';
      transcript += `[${time}] ${sender}: ${msg.message}\n\n`;
    });
    
    return transcript;
  }

  /**
   * Show notification badge
   */
  showBadge() {
    const badge = document.getElementById('chat-badge');
    const currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    badge.style.display = 'flex';
  }

  /**
   * Clear notification badge
   */
  clearBadge() {
    const badge = document.getElementById('chat-badge');
    badge.textContent = '0';
    badge.style.display = 'none';
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    setTimeout(() => {
      this.messageArea.scrollTop = this.messageArea.scrollHeight;
    }, 100);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.liveChat = new LiveChat();
  });
} else {
  window.liveChat = new LiveChat();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveChat;
}
