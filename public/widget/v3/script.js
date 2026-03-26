// ai-chat-widget.js - Version 3.0.0 - Enhanced
/**
 * AI Chat Widget - Enhanced Modern Implementation
 * @version 3.0.0
 * @license MIT
 */

(function (global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global, global.document);
    } else {
        factory(global, global.document);
    }
})(typeof window !== 'undefined' ? window : this, function (window, document) {
    'use strict';
    // Default configuration
    const DEFAULTS = {
        apiKey: null,
        apiBaseUrl: '/api/v1/widget', // Laravel API endpoint
        agentSlug: null, // Use agent slug instead of widget_id
        position: 'bottom-right',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        accentColor: '#8b5cf6',
        botName: 'AI Assistant',
        botAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
        welcomeMessage: 'Hello! How can I help you today?',
        placeholder: 'Type your message here...',
        autoOpen: false,
        showHeader: true,
        showFooter: true,
        enableFiles: true,
        enableVoice: false,
        theme: 'light',
        language: 'en',
        sessionExpiry: 24, // hours
        maxMessages: 100,
        rateLimit: 60, // requests per minute
        debug: false,
    };

    // Available positions
    const POSITIONS = {
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' },
    };

    // Available themes
    const THEMES = {
        light: {
            bgPrimary: '#ffffff',
            bgSecondary: '#f8fafc',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0',
        },
        dark: {
            bgPrimary: '#0f172a',
            bgSecondary: '#1e293b',
            textPrimary: '#f1f5f9',
            textSecondary: '#cbd5e1',
            border: '#334155',
        },
    };
    // Error Types for better error handling
    class WidgetError extends Error {
        constructor(message, code, details = {}) {
            super(message);
            this.name = 'WidgetError';
            this.code = code;
            this.details = details;
            this.timestamp = new Date().toISOString();
        }
    }

    // State Manager
    class StateManager {
        constructor(prefix = 'ai_chat') {
            this.prefix = prefix;
            this.state = new Map();
            this.listeners = new Map();
        }

        set(key, value) {
            const oldValue = this.state.get(key);
            this.state.set(key, value);
            this.notify(key, value, oldValue);
            return this;
        }

        get(key, defaultValue = null) {
            return this.state.get(key) || defaultValue;
        }

        subscribe(key, callback) {
            if (!this.listeners.has(key)) {
                this.listeners.set(key, new Set());
            }
            this.listeners.get(key).add(callback);

            // Return unsubscribe function
            return () => this.listeners.get(key).delete(callback);
        }

        notify(key, newValue, oldValue) {
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach((callback) => {
                    try {
                        callback(newValue, oldValue);
                    } catch (error) {
                        console.error('State listener error:', error);
                    }
                });
            }
        }

        persist(key, agentSlug) {
            const storageKey = `${this.prefix}_${agentSlug}_${key}`;
            try {
                const value = this.get(key);
                if (value !== null && value !== undefined) {
                    localStorage.setItem(storageKey, JSON.stringify(value));
                }
            } catch (error) {
                console.warn('Failed to persist state:', error);
            }
        }

        restore(key, agentSlug) {
            const storageKey = `${this.prefix}_${agentSlug}_${key}`;
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const value = JSON.parse(stored);
                    this.set(key, value);
                    return value;
                }
            } catch (error) {
                console.warn('Failed to restore state:', error);
            }
            return null;
        }
    }

    // Markdown Parser with caching
    class MarkdownParser {
        constructor() {
            this.cache = new Map();
            this.maxCacheSize = 100;
        }

        parse(text) {
            if (!text) return '';

            // Check cache first
            const cacheKey = this.hashString(text);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const html = this.convertMarkdown(text);

            // Cache result
            if (this.cache.size >= this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, html);

            return html;
        }

        convertMarkdown(text) {
            // Use DOMPurify in production for security
            return (
                text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"(?=\w)/g, '&quot;')
                    // Bold and italic
                    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<strong>$1</strong>')
                    .replace(/_(.*?)_/g, '<em>$1</em>')
                    // Code
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    // Links (basic support)
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                    // Line breaks and paragraphs
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^(.+)$/gm, '<p>$1</p>')
            );
        }

        hashString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i);
                hash |= 0;
            }
            return hash.toString(36);
        }
    }

    // API Client with retry logic and caching
    class ApiClient {
        constructor(baseUrl, config = {}) {
            this.baseUrl = baseUrl;
            this.config = {
                timeout: 30000,
                maxRetries: 3,
                retryDelay: 1000,
                cacheTTL: 60000, // 1 minute
                ...config,
            };
            this.cache = new Map();
            this.requestQueue = new Map();
            this.activeRequests = 0;
            this.maxConcurrentRequests = 5;
        }

        async request(endpoint, options = {}) {
            const cacheKey = this.getCacheKey(endpoint, options);
            const cached = this.getCached(cacheKey);

            if (cached && !options.skipCache) {
                return cached;
            }

            // Queue management
            if (this.activeRequests >= this.maxConcurrentRequests) {
                await this.waitForSlot();
            }

            this.activeRequests++;

            try {
                const response = await this.executeRequest(endpoint, options);

                if (options.cacheable !== false && response.success) {
                    this.setCached(cacheKey, response);
                }

                return response;
            } finally {
                this.activeRequests--;
            }
        }

        async executeRequest(endpoint, options, retryCount = 0) {
            const url = `${this.baseUrl}/${endpoint}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Request-ID': this.generateRequestId(),
                    'X-Widget-Version': '3.0.0',
                    ...options.headers,
                },
                signal: controller.signal,
                ...options,
            };

            if (options.body && typeof options.body !== 'string') {
                requestOptions.body = JSON.stringify(options.body);
            }

            try {
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new WidgetError(`HTTP ${response.status}`, 'NETWORK_ERROR', { status: response.status, url });
                }

                const data = await response.json();

                // Handle API-specific error formats
                if (!data.success) {
                    throw new WidgetError(data.error || 'API request failed', 'API_ERROR', data);
                }

                return data;
            } catch (error) {
                clearTimeout(timeoutId);

                // Retry logic
                if (retryCount < this.config.maxRetries && this.shouldRetry(error)) {
                    await this.delay(this.config.retryDelay * (retryCount + 1));
                    return this.executeRequest(endpoint, options, retryCount + 1);
                }

                throw error;
            }
        }

        async *stream(endpoint, options = {}) {
            const url = `${this.baseUrl}/${endpoint}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            try {
                const response = await fetch(url, {
                    method: options.method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/event-stream',
                        'X-Request-ID': this.generateRequestId(),
                        ...options.headers,
                    },
                    body: JSON.stringify(options.body || {}),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new WidgetError(`Stream failed: HTTP ${response.status}`, 'STREAM_ERROR');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') {
                                    yield { done: true };
                                    return;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    yield parsed;
                                } catch (e) {
                                    // Skip invalid JSON
                                }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }

        // Helper methods
        getCacheKey(endpoint, options) {
            return `${endpoint}_${JSON.stringify(options)}`;
        }

        getCached(key) {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
                return cached.data;
            }
            this.cache.delete(key);
            return null;
        }
       
        setCached(key, data) {
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
            });
        }

        shouldRetry(error) {
            return error.code === 'NETWORK_ERROR' || error.message.includes('timeout') || error.message.includes('network');
        }

        async delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async waitForSlot() {
            return new Promise((resolve) => {
                const check = () => {
                    if (this.activeRequests < this.maxConcurrentRequests) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }

        generateRequestId() {
            return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    // Enhanced AIChatWidget Class
    class EnhancedAIChatWidget {
        constructor(config = {}) {
            this.config = this.mergeConfig(config);
            this.validateConfig();

            // Initialize managers
            this.state = new StateManager('ai_chat_widget');
            this.api = new ApiClient(this.config.apiBaseUrl, {
                timeout: this.config.apiTimeout,
                maxRetries: this.config.maxRetries,
            });
            this.markdown = new MarkdownParser();

            // Core state
            this.elements = {};
            this.events = new Map();
            this.messageBuffer = [];
            this.streamControllers = new Map();
            this.healthCheckInterval = null;

            this.init();
        }

        mergeConfig(userConfig) {
            const defaults = {
                apiKey: null,
                apiBaseUrl: '/api/v1/widget',
                agentSlug: null,
                position: 'bottom-right',
                primaryColor: '#3b82f6',
                secondaryColor: '#1e40af',
                accentColor: '#8b5cf6',
                botName: 'AI Assistant',
                botAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
                welcomeMessage: 'Hello! How can I help you today?',
                placeholder: 'Type your message here...',
                autoOpen: false,
                showHeader: true,
                showFooter: true,
                enableFiles: true,
                enableVoice: false,
                enableEmojis: true,
                enableMarkdown: true,
                theme: 'light',
                language: 'en',
                sessionExpiry: 24,
                maxMessages: 100,
                rateLimit: 60,
                apiTimeout: 30000,
                maxRetries: 3,
                debug: false,
                offlineMode: false,
                offlineMessage: 'You are currently offline. Messages will be sent when you reconnect.',
                analytics: true,
                autoTranslation: false,
                translationLanguage: 'en',
                contextWindow: 10,
                typingIndicator: true,
                soundEffects: false,
                soundVolume: 0.3,
                autoSaveInterval: 30000, // 30 seconds
                lazyLoadImages: true,
                accessibility: true,
            };

            return { ...defaults, ...userConfig };
        }
        validateConfig() {
            if (!this.config.apiKey) {
                console.warn('API key is recommended for widget functionality');
            }

            if (!this.config.agentSlug) {
                throw new Error('agentSlug is required. Get it from your agent settings.');
            }

            if (!POSITIONS[this.config.position]) {
                console.warn(`Invalid position "${this.config.position}". Using default: bottom-right`);
                this.config.position = 'bottom-right';
            }

            if (!THEMES[this.config.theme]) {
                this.config.theme = 'light';
            }
        }

        /**
         * Initialize widget
         */

        async init() {
            try {
                // Load configuration from API
                await this.loadConfig();

                // Create DOM elements
                this.createWidget();
                this.createLauncher();
                this.applyTheme();
                this.bindEvents();

                // Initialize state
                await this.loadSession();
                this.setupHealthCheck();
                this.setupAutoSave();

                // Initialize analytics
                if (this.config.analytics) {
                    this.initAnalytics();
                }

                // Open if autoOpen
                if (this.config.autoOpen) {
                    setTimeout(() => this.open(), 1000);
                }

                this.emit('ready');
                this.log('Widget initialized successfully');
            } catch (error) {
                this.handleError('Initialization failed', error);
            }
        }

        async loadConfig() {
            try {
                const config = await this.api.request(`config/${this.config.agentSlug}`);

                if (config.success && config.data) {
                    // Deep merge configuration
                    this.config = this.deepMerge(this.config, config.data);
                    this.log('Configuration loaded from API');
                }
            } catch (error) {
                if (this.config.debug) {
                    this.log('Failed to load config from API, using defaults:', error);
                }
            }
        }

        createWidget() {
            // Enhanced widget creation with ARIA labels and better accessibility
            const widget = document.createElement('div');
            widget.className = 'ai-chat-widget-enhanced';
            widget.setAttribute('role', 'dialog');
            widget.setAttribute('aria-label', `${this.config.botName} Chat Widget`);
            widget.setAttribute('aria-modal', 'true');

            // Apply styles with CSS custom properties for theming
            widget.style.cssText = `
                position: fixed;
                ${this.getPositionStyles()}
                z-index: 999999;
                width: ${this.state.get('expanded', false) ? '600px' : '380px'};
                height: ${this.state.get('expanded', false) ? '700px' : '500px'};
                background: var(--ai-bg-primary, ${this.getThemeColor('bgPrimary')});
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--ai-border, ${this.getThemeColor('border')});
                display: ${this.state.get('open', false) ? 'flex' : 'none'};
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: var(--ai-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                font-size: var(--ai-font-size, 14px);
                line-height: var(--ai-line-height, 1.5);
            `;

            this.elements.widget = widget;
            document.body.appendChild(widget);

            // Add CSS custom properties
            this.applyCssVariables(widget);

            this.createHeader();
            this.createMessagesContainer();
            this.createInputArea();
            this.createTypingIndicator();
            this.createNotificationArea();
        }

        applyCssVariables(element) {
            const theme = this.getTheme();

            element.style.setProperty('--ai-bg-primary', theme.bgPrimary);
            element.style.setProperty('--ai-bg-secondary', theme.bgSecondary);
            element.style.setProperty('--ai-text-primary', theme.textPrimary);
            element.style.setProperty('--ai-text-secondary', theme.textSecondary);
            element.style.setProperty('--ai-border', theme.border);
            element.style.setProperty('--ai-primary', this.config.primaryColor);
            element.style.setProperty('--ai-secondary', this.config.secondaryColor);
            element.style.setProperty('--ai-accent', this.config.accentColor);
        }

        async sendMessage(message, options = {}) {
            const messageData = {
                content: message.trim(),
                timestamp: new Date().toISOString(),
                metadata: {
                    source: options.source || 'widget',
                    hasMarkdown: this.config.enableMarkdown,
                    ...options.metadata,
                },
            };

            if (!messageData.content) {
                this.showNotification('Please enter a message', 'warning');
                return;
            }

            // Add to message buffer
            this.messageBuffer.push({
                ...messageData,
                status: 'pending',
            });

            // Show in UI immediately
            this.addMessage({
                id: `user_${Date.now()}`,
                content: messageData.content,
                sender: 'user',
                timestamp: new Date(),
                status: 'sending',
            });

            // Show typing indicator
            this.showTypingIndicator();

            try {
                // Ensure session exists
                if (!this.state.get('sessionId')) {
                    await this.createSession();
                }

                // Prepare API request
                const requestBody = {
                    session_id: this.state.get('sessionId'),
                    message: messageData.content,
                    widget_id: this.config.agentSlug,
                    stream: true,
                    model: 'deepseek-chat',
                    context_messages: this.getContextMessages(),
                    ...options.apiOptions,
                };

                // Stream response
                await this.streamResponse(requestBody);
            } catch (error) {
                this.handleError('Failed to send message', error);
                this.updateMessageStatus('failed');
                this.showNotification('Failed to send message. Please try again.', 'error');
            } finally {
                this.hideTypingIndicator();
            }
        }

         handleError(){
            
        }
        async streamResponse(requestBody) {
            const streamId = `stream_${Date.now()}`;
            const controller = new AbortController();
            this.streamControllers.set(streamId, controller);

            try {
                // Create bot message container
                const messageId = `bot_${Date.now()}`;
                let accumulatedContent = '';

                const messageDiv = this.createMessageElement({
                    id: messageId,
                    content: '',
                    sender: 'bot',
                    timestamp: new Date(),
                    status: 'streaming',
                });

                // Stream the response
                const stream = this.api.stream('deepseek/chat', {
                    method: 'POST',
                    headers: {
                        Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : undefined,
                        'X-Widget-ID': this.config.agentSlug,
                    },
                    body: requestBody,
                });

                for await (const chunk of stream) {
                    if (controller.signal.aborted) break;

                    if (chunk.error) {
                        throw new WidgetError(chunk.error, 'STREAM_ERROR');
                    }

                    if (chunk.content) {
                        accumulatedContent += chunk.content;

                        // Update message content
                        const contentElement = messageDiv.querySelector('.message-content');
                        if (contentElement) {
                            contentElement.innerHTML = this.markdown.parse(accumulatedContent);

                            // Lazy load images if enabled
                            if (this.config.lazyLoadImages) {
                                this.lazyLoadImages(contentElement);
                            }
                        }

                        // Auto-scroll
                        this.scrollToBottom();
                    }
                }

                // Finalize message
                this.finalizeMessage(messageId, accumulatedContent);

                // Update usage stats
                this.updateUsageStats(accumulatedContent.length);
            } catch (error) {
                if (!controller.signal.aborted) {
                    throw error;
                }
            } finally {
                this.streamControllers.delete(streamId);
            }
        }

        createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.id = message.id;
            messageDiv.className = `ai-chat-message message-${message.sender} ${message.status}`;
            messageDiv.setAttribute('role', message.sender === 'user' ? 'sent-message' : 'received-message');

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';

            // Content
            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = this.config.enableMarkdown ? this.markdown.parse(message.content) : this.escapeHtml(message.content);

            // Status indicator
            if (message.status && message.status !== 'sent') {
                const status = document.createElement('div');
                status.className = 'message-status';
                status.textContent = message.status;
                bubble.appendChild(status);
            }

            // Timestamp
            const time = document.createElement('time');
            time.className = 'message-timestamp';
            time.dateTime = message.timestamp.toISOString();
            time.textContent = this.formatTime(message.timestamp);

            bubble.appendChild(content);
            bubble.appendChild(time);
            messageDiv.appendChild(bubble);

            // Add to container
            this.elements.messagesContainer.appendChild(messageDiv);

            // Animation
            messageDiv.classList.add('message-enter');

            return messageDiv;
        }

        // Enhanced API methods
        async fetchWithRetry(url, options = {}, retries = this.config.maxRetries) {
            for (let i = 0; i <= retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response;
                } catch (error) {
                    if (i === retries) throw error;
                    await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
                }
            }
        }

        async uploadFile(file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', this.state.get('sessionId'));
            formData.append('widget_id', this.config.agentSlug);

            // Show upload progress
            const progressId = `upload_${Date.now()}`;
            this.showUploadProgress(progressId, file.name);

            try {
                const response = await this.api.request('files/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Widget-ID': this.config.agentSlug,
                        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
                    },
                });

                this.hideUploadProgress(progressId);
                return response.data;
            } catch (error) {
                this.hideUploadProgress(progressId, true);
                throw error;
            }
        }

        // Event system
        on(event, callback) {
            if (!this.events.has(event)) {
                this.events.set(event, new Set());
            }
            this.events.get(event).add(callback);

            return () => this.events.get(event).delete(callback);
        }

        emit(event, data) {
            if (this.events.has(event)) {
                this.events.get(event).forEach((callback) => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in ${event} handler:`, error);
                    }
                });
            }
        }

        // Utility methods
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        formatTime(date) {
            return new Intl.DateTimeFormat(navigator.language, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }).format(date);
        }

        deepMerge(target, source) {
            const output = Object.assign({}, target);
            if (this.isObject(target) && this.isObject(source)) {
                Object.keys(source).forEach((key) => {
                    if (this.isObject(source[key])) {
                        if (!(key in target)) Object.assign(output, { [key]: source[key] });
                        else output[key] = this.deepMerge(target[key], source[key]);
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        }

        isObject(item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        }

        setupHealthCheck() {
            if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

            this.healthCheckInterval = setInterval(async () => {
                try {
                    await this.api.request('health', { cacheable: false });
                    this.state.set('online', true);
                    this.emit('online');
                } catch (error) {
                    this.state.set('online', false);
                    this.emit('offline');
                }
            }, 60000); // Check every minute
        }

        setupAutoSave() {
            setInterval(() => {
                this.saveSession();
            }, this.config.autoSaveInterval);
        }

        initAnalytics() {
            // Track widget events
            this.on('open', () => this.trackEvent('widget_opened'));
            this.on('close', () => this.trackEvent('widget_closed'));
            this.on('message', (data) => this.trackEvent('message_sent', data));

            // Performance monitoring
            this.trackPerformance();
        }

        trackEvent(event, data = {}) {
            if (!this.config.analytics) return;

            const analyticsData = {
                event,
                widget_id: this.config.agentSlug,
                session_id: this.state.get('sessionId'),
                timestamp: new Date().toISOString(),
                url: window.location.href,
                referrer: document.referrer,
                ...data,
            };

            // Send to analytics endpoint
            if (navigator.sendBeacon) {
                navigator.sendBeacon(`${this.config.apiBaseUrl}/analytics/event`, JSON.stringify(analyticsData));
            }
        }

        // ... Additional methods would continue here

        // Public API
        get publicAPI() {
            return {
                open: () => this.open(),
                close: () => this.close(),
                toggle: () => this.toggle(),
                sendMessage: (message) => this.sendMessage(message),
                getMessages: () => this.state.get('messages', []),
                getSessionId: () => this.state.get('sessionId'),
                updateConfig: (newConfig) => this.updateConfig(newConfig),
                destroy: () => this.destroy(),
                on: (event, callback) => this.on(event, callback),
                getState: () => ({ ...this.state.state }),
                isOnline: () => this.state.get('online', true),
            };
        }
    }

    // Global initialization
    if (!window.AIChatWidget) {
        window.AIChatWidget = {
            instances: new Map(),

            init(config) {
                try {
                    if (!config.agentSlug) {
                        throw new WidgetError('agentSlug is required', 'CONFIG_ERROR');
                    }

                    // Check if instance already exists
                    if (this.instances.has(config.agentSlug)) {
                        console.warn(`Widget with slug ${config.agentSlug} already initialized`);
                        return this.instances.get(config.agentSlug).publicAPI;
                    }

                    const instance = new EnhancedAIChatWidget(config);
                    this.instances.set(config.agentSlug, instance);

                    // Set as global instance if first
                    if (!window.aiChatWidgetInstance) {
                        window.aiChatWidgetInstance = instance;
                    }

                    return instance.publicAPI;
                } catch (error) {
                    console.error('Failed to initialize AI Chat Widget:', error);
                    throw error;
                }
            },

            getInstance(agentSlug = null) {
                if (agentSlug) {
                    return this.instances.get(agentSlug)?.publicAPI || null;
                }
                return window.aiChatWidgetInstance?.publicAPI || null;
            },

            destroy(agentSlug = null) {
                if (agentSlug) {
                    const instance = this.instances.get(agentSlug);
                    if (instance) {
                        instance.destroy();
                        this.instances.delete(agentSlug);
                    }
                } else {
                    this.instances.forEach((instance) => instance.destroy());
                    this.instances.clear();
                    window.aiChatWidgetInstance = null;
                }
            },

            // Utility methods
            version: '3.0.0',
            isSupported() {
                return 'fetch' in window && 'Promise' in window && 'Map' in window && 'Set' in window;
            },
        };
    }

    // Auto-initialize from data attributes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AIChatWidget.autoInitialize();
        });
    } else {
        window.AIChatWidget.autoInitialize();
    }

    // Add auto-initialization method
    window.AIChatWidget.autoInitialize = function () {
        const widgetElements = document.querySelectorAll('[data-ai-chat-widget]');

        widgetElements.forEach((element) => {
            const config = {
                agentSlug: element.dataset.agentSlug || element.dataset.widgetId,
                apiKey: element.dataset.apiKey,
                position: element.dataset.position || 'bottom-right',
                primaryColor: element.dataset.primaryColor || '#3b82f6',
                botName: element.dataset.botName || 'AI Assistant',
                autoOpen: element.dataset.autoOpen === 'true',
                theme: element.dataset.theme || 'light',
                debug: element.dataset.debug === 'true',
            };

            if (config.agentSlug) {
                try {
                    window.AIChatWidget.init(config);
                } catch (error) {
                    console.error(`Failed to auto-initialize widget for ${config.agentSlug}:`, error);
                }
            }
        });
    };

    // Export for module systems
    if (typeof define === 'function' && define.amd) {
        define([], () => window.AIChatWidget);
    }

    return window.AIChatWidget;
});
