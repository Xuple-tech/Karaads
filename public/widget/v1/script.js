/**
 * AI Chat Widget - Iframe Loader
 * Loads the React-based chat widget in a secure iframe
 * 
 * @version 3.1.0
 */
(function (window, document) {
    'use strict';

    const DEFAULTS = {
        baseUrl: 'http://127.0.0.1:8000',
        agentSlug: null,
        position: 'bottom-right',
        trigger: null,
        autoOpen: false,
        theme: 'auto',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        botName: 'AI Assistant',
        showLauncher: true,
        launcherStyle: 'default',
        zIndex: 999999,
        mobileBreakpoint: 768
    };

    class AIChatWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULTS, ...config };
            this.iframe = null;
            this.container = null;
            this.launcher = null;
            this.isOpen = false;
            this.isLoaded = false;
            this.isMobile = window.innerWidth < this.config.mobileBreakpoint;
            this.unreadCount = 0;
            
            if (!this.config.agentSlug) {
                console.error('AIChatWidget: agentSlug is required');
                return;
            }

            this.init();
            this.setupResponsive();
        }

        init() {
            this.createContainer();
            
            // Always create launcher if enabled
            if (this.config.showLauncher) {
                this.createLauncher();
            }
            
            // Create iframe but keep it hidden initially
            this.createIframe();
            this.setupMessageListener();
            
            // Auto-open if configured
            if (this.config.autoOpen && !this.isMobile) {
                setTimeout(() => this.open(), 1000);
            }

            // Custom triggers
            if (this.config.trigger) {
                document.querySelectorAll(this.config.trigger).forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggle();
                    });
                });
            }
        }

        setupResponsive() {
            const handleResize = () => {
                this.isMobile = window.innerWidth < this.config.mobileBreakpoint;
                
                // Close on mobile if auto-open was triggered on desktop
                if (this.isMobile && this.config.autoOpen && this.isOpen) {
                    this.close();
                }
            };
            
            window.addEventListener('resize', handleResize);
        }

        createContainer() {
            // Remove existing container if any
            const existing = document.getElementById(`ai-widget-${this.config.agentSlug}`);
            if (existing) existing.remove();
            
            this.container = document.createElement('div');
            this.container.id = `ai-widget-${this.config.agentSlug}`;
            
            // Base styles
            const styles = {
                position: 'fixed',
                zIndex: this.config.zIndex,
                width: '0',
                height: '0',
                border: 'none',
                backgroundColor: 'transparent',
                transition: 'none',
                pointerEvents: 'none'
            };

            // Apply position
            this.applyPosition(styles);
            Object.assign(this.container.style, styles);
            
            document.body.appendChild(this.container);
        }

        createLauncher() {
            // Remove existing launcher
            const existing = document.querySelector(`.ai-widget-launcher[data-agent="${this.config.agentSlug}"]`);
            if (existing) existing.remove();
            
            this.launcher = document.createElement('button');
            this.launcher.className = 'ai-widget-launcher';
            this.launcher.dataset.agent = this.config.agentSlug;
            this.launcher.setAttribute('aria-label', 'Open AI Chat');
            this.launcher.setAttribute('title', 'Chat with AI');
            
            // Launcher styles
            const launcherStyles = {
                position: 'fixed',
                zIndex: this.config.zIndex - 1,
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                background: `linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.secondaryColor})`,
                color: 'white',
                fontSize: '0',
                overflow: 'hidden'
            };

            // Apply launcher position (same as container)
            this.applyPosition(launcherStyles);
            
            // Mobile adjustments for launcher
            if (this.isMobile) {
                launcherStyles.width = '56px';
                launcherStyles.height = '56px';
                launcherStyles.bottom = '16px';
                if (this.config.position.includes('right')) {
                    launcherStyles.right = '16px';
                } else {
                    launcherStyles.left = '16px';
                }
            }

            Object.assign(this.launcher.style, launcherStyles);
            
            // Create icon
            const icon = document.createElement('div');
            icon.innerHTML = `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                </svg>
            `;
            this.launcher.appendChild(icon);
            
            // Unread badge
            this.badge = document.createElement('span');
            this.badge.className = 'ai-widget-badge';
            this.badge.style.cssText = `
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 20px;
                height: 20px;
                padding: 0 6px;
                background: #ef4444;
                color: white;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                display: none;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            this.launcher.appendChild(this.badge);
            
            // Event listeners
            this.launcher.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
            
            this.launcher.addEventListener('mouseenter', () => {
                this.launcher.style.transform = 'scale(1.1)';
                this.launcher.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.2)';
            });
            
            this.launcher.addEventListener('mouseleave', () => {
                this.launcher.style.transform = 'scale(1)';
                this.launcher.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            });
            
            document.body.appendChild(this.launcher);
        }

        createIframe() {
            if (this.iframe) return;

            this.iframe = document.createElement('iframe');
            this.iframe.id = `ai-widget-iframe-${this.config.agentSlug}`;
            this.iframe.name = `ai-widget-${this.config.agentSlug}`;
            
            // Construct URL with all config params
            const params = new URLSearchParams({
                agent_slug: this.config.agentSlug,
                mode: 'embed',
                theme: this.config.theme,
                primary_color: this.config.primaryColor,
                secondary_color: this.config.secondaryColor,
                bot_name: this.config.botName,
                position: this.config.position,
                auto_open: this.config.autoOpen.toString(),
                parent_domain: window.location.hostname,
                parent_url: window.location.href,
                launcher: this.config.showLauncher.toString(),
                is_mobile: this.isMobile.toString(),
                t: Date.now() // Cache busting
            });

            this.iframe.src = `${this.config.baseUrl}/widget/embed/${this.config.agentSlug}?${params.toString()}`;
            
            // Permissions
            this.iframe.allow = "microphone *; camera *; clipboard-write; clipboard-read";
            this.iframe.referrerPolicy = "strict-origin-when-cross-origin";
            this.iframe.loading = "eager";
            
            // Styles - start hidden
            Object.assign(this.iframe.style, {
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                visibility: 'hidden',
                opacity: '0',
                transition: 'opacity 0.3s ease, visibility 0.3s ease',
                pointerEvents: 'none'
            });

            // Handle iframe load
            this.iframe.onload = () => {
                console.log('AI Widget iframe loaded');
                this.isLoaded = true;
                this.sendMessage('config', this.config);
                
                // If auto-open on desktop, show immediately
                if (this.config.autoOpen && !this.isMobile) {
                    setTimeout(() => this.open(), 500);
                }
            };

            this.iframe.onerror = (error) => {
                console.error('AI Widget iframe failed to load:', error);
                this.showError();
            };

            this.container.appendChild(this.iframe);
        }

        applyPosition(styles) {
            const isMobile = this.isMobile;
            
            switch (this.config.position) {
                case 'bottom-left':
                    styles.bottom = isMobile ? '16px' : '20px';
                    styles.left = isMobile ? '16px' : '20px';
                    delete styles.right;
                    delete styles.top;
                    break;
                case 'top-right':
                    styles.top = isMobile ? '16px' : '20px';
                    styles.right = isMobile ? '16px' : '20px';
                    delete styles.bottom;
                    delete styles.left;
                    break;
                case 'top-left':
                    styles.top = isMobile ? '16px' : '20px';
                    styles.left = isMobile ? '16px' : '20px';
                    delete styles.bottom;
                    delete styles.right;
                    break;
                case 'center':
                    styles.bottom = isMobile ? '16px' : '20px';
                    styles.left = '50%';
                    styles.transform = 'translateX(-50%)';
                    delete styles.right;
                    delete styles.top;
                    break;
                default: // bottom-right
                    styles.bottom = isMobile ? '16px' : '20px';
                    styles.right = isMobile ? '16px' : '20px';
                    delete styles.left;
                    delete styles.top;
            }
        }

        open() {
            if (!this.isLoaded) {
                this.createIframe();
                return;
            }

            this.isOpen = true;
            
            // Update launcher
            if (this.launcher) {
                this.launcher.style.display = 'none';
            }
            
            // Show iframe container with proper size
            const containerStyles = {
                width: this.isMobile ? '100%' : '400px',
                height: this.isMobile ? '100%' : '600px',
                maxWidth: this.isMobile ? '100vw' : 'calc(100vw - 40px)',
                maxHeight: this.isMobile ? '100vh' : 'calc(100vh - 40px)',
                pointerEvents: 'auto',
                borderRadius: this.isMobile ? '0' : '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            };

            // Mobile fullscreen
            if (this.isMobile) {
                Object.assign(containerStyles, {
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0'
                });
            }

            Object.assign(this.container.style, containerStyles);
            
            // Show iframe
            setTimeout(() => {
                this.iframe.style.visibility = 'visible';
                this.iframe.style.opacity = '1';
                this.iframe.style.pointerEvents = 'auto';
            }, 10);

            // Reset unread count
            this.unreadCount = 0;
            this.updateBadge();
            
            // Notify iframe
            this.sendMessage('open');
            
            // Prevent body scroll on mobile
            if (this.isMobile) {
                document.body.style.overflow = 'hidden';
            }
        }

        close() {
            this.isOpen = false;
            
            // Hide iframe
            this.iframe.style.visibility = 'hidden';
            this.iframe.style.opacity = '0';
            this.iframe.style.pointerEvents = 'none';
            
            // Reset container size (keep for launcher inside iframe approach)
            if (this.config.showLauncher && this.launcher) {
                // Show launcher
                this.launcher.style.display = 'flex';
                
                // Hide container completely
                this.container.style.width = '0';
                this.container.style.height = '0';
                this.container.style.pointerEvents = 'none';
            } else {
                // Launcher is inside iframe, just shrink container
                this.container.style.width = '60px';
                this.container.style.height = '60px';
                this.container.style.pointerEvents = 'none';
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Notify iframe
            this.sendMessage('close');
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        sendMessage(type, data = {}) {
            if (!this.iframe || !this.iframe.contentWindow) return;
            
            try {
                this.iframe.contentWindow.postMessage({
                    type: `ai-widget:${type}`,
                    data,
                    timestamp: Date.now(),
                    source: 'ai-widget-loader'
                }, '*');
            } catch (error) {
                console.error('Failed to send message to iframe:', error);
            }
        }

        setupMessageListener() {
            const messageHandler = (event) => {
                // Basic origin check (optional)
                // if (this.config.baseUrl && !event.origin.startsWith(this.config.baseUrl)) return;
                
                const { type, data } = event.data;
                
                if (!type || !type.startsWith('ai-widget:')) return;

                const action = type.replace('ai-widget:', '');
                
                switch (action) {
                    case 'ready':
                        console.log('Widget reported ready');
                        this.isLoaded = true;
                        
                        // If launcher is inside iframe, show container
                        if (!this.config.showLauncher) {
                            this.container.style.width = '60px';
                            this.container.style.height = '60px';
                        }
                        
                        break;
                        
                    case 'open':
                        this.open();
                        break;
                        
                    case 'close':
                        this.close();
                        break;
                        
                    case 'unread':
                        this.unreadCount = data.count || 0;
                        this.updateBadge();
                        break;
                        
                    case 'resize':
                        if (this.isOpen && data) {
                            this.container.style.width = data.width || '400px';
                            this.container.style.height = data.height || '600px';
                        }
                        break;
                        
                    case 'error':
                        console.error('Widget error:', data.message);
                        break;
                }
            };

            window.addEventListener('message', messageHandler);
        }

        updateBadge() {
            if (!this.badge) return;
            
            if (this.unreadCount > 0) {
                this.badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
                this.badge.style.display = 'flex';
            } else {
                this.badge.style.display = 'none';
            }
        }

        showError() {
            const errorEl = document.createElement('div');
            errorEl.className = 'ai-widget-error';
            errorEl.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 16px;
                background: #fee2e2;
                color: #dc2626;
                border-radius: 8px;
                font-size: 14px;
                border: 1px solid #fca5a5;
                max-width: 300px;
                z-index: ${this.config.zIndex};
            `;
            errorEl.textContent = 'Chat widget failed to load. Please refresh the page.';
            
            document.body.appendChild(errorEl);
            
            setTimeout(() => {
                errorEl.remove();
            }, 5000);
        }

        // Public API methods
        setConfig(key, value) {
            this.config[key] = value;
            this.sendMessage('config', { [key]: value });
        }

        destroy() {
            if (this.iframe) {
                this.iframe.remove();
                this.iframe = null;
            }
            
            if (this.container) {
                this.container.remove();
                this.container = null;
            }
            
            if (this.launcher) {
                this.launcher.remove();
                this.launcher = null;
            }
            
            this.isLoaded = false;
            this.isOpen = false;
        }
    }

    // Global API
    window.AIChatWidget = {
        init: (config) => {
            // Destroy existing instance if any
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.destroy();
            }
            
            window.aiChatWidgetInstance = new AIChatWidget(config);
            return window.aiChatWidgetInstance;
        },
        
        open: () => {
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.open();
            } else {
                console.warn('AI Chat Widget not initialized');
            }
        },
        
        close: () => {
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.close();
            }
        },
        
        toggle: () => {
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.toggle();
            }
        },
        
        setConfig: (key, value) => {
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.setConfig(key, value);
            }
        },
        
        destroy: () => {
            if (window.aiChatWidgetInstance) {
                window.aiChatWidgetInstance.destroy();
                window.aiChatWidgetInstance = null;
            }
        },
        
        getInstance: () => window.aiChatWidgetInstance,
        
        autoInitialize: () => {
            // Check for data attributes
            const els = document.querySelectorAll('[data-ai-chat-widget]');
            
            els.forEach(el => {
                const config = {
                    agentSlug: el.dataset.agentSlug || el.dataset.widgetId,
                    baseUrl: el.dataset.baseUrl || window.location.origin,
                    position: el.dataset.position,
                    theme: el.dataset.theme,
                    primaryColor: el.dataset.primaryColor,
                    secondaryColor: el.dataset.secondaryColor,
                    botName: el.dataset.botName,
                    autoOpen: el.dataset.autoOpen === 'true',
                    showLauncher: el.dataset.showLauncher !== 'false',
                    trigger: el.dataset.trigger
                };
                
                window.AIChatWidget.init(config);
            });
            
            // Also check for script tag config
            const script = document.querySelector('script[data-ai-widget-config]');
            if (script) {
                try {
                    const config = JSON.parse(script.dataset.aiWidgetConfig);
                    window.AIChatWidget.init(config);
                } catch (e) {
                    console.error('Failed to parse widget config:', e);
                }
            }
        }
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.AIChatWidget.autoInitialize);
    } else {
        window.AIChatWidget.autoInitialize();
    }

    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.AIChatWidget;
    }

})(window, document);