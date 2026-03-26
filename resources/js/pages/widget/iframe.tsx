import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, MessageSquare, Plus, Send, StopCircle, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';

interface ChatWidgetProps {
    config: {
        apiKey?: string;
        apiBaseUrl?: string;
        agentSlug?: string;
        position?: string;
        primaryColor?: string;
        botName?: string;
        botAvatar?: string;
        welcomeMessage?: string;
        theme?: 'light' | 'dark' | 'auto';
        autoOpen?: boolean;
    };
    initialSession?: {
        sessionId: string;
        conversationId: string;
        messages: any[];
    };
    auth?: {
        user: any;
    };
}

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    status?: 'pending' | 'sent' | 'delivered' | 'failed';
    isWelcome?: boolean;
    feedback?: 'like' | 'dislike';
    pinned?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ config: propConfig, initialSession, auth }) => {
    const [state, setState] = useState({
        isOpen: propConfig.autoOpen || false,
        isExpanded: false,
        isTyping: false,
        isLoading: false,
        messages: initialSession?.messages || [],
        sessionId: initialSession?.sessionId || null,
        conversationId: initialSession?.conversationId || null,
        unreadCount: 0,
        isOnline: true,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isConnected: true,
    });

    const [inputMessage, setInputMessage] = useState('');
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const defaultConfig = {
        apiKey: null,
        apiBaseUrl: '/api/v1/widget',
        agentSlug: propConfig.agentSlug || 'default',
        position: 'bottom-right',
        primaryColor: '#10a37f',
        secondaryColor: '#19c37d',
        botName: 'AI Assistant',
        botAvatar: null,
        welcomeMessage: "Hello! I'm your AI assistant. How can I help you today?",
        placeholder: 'Message AI Assistant...',
        autoOpen: false,
        showHeader: true,
        showFooter: true,
        enableFiles: false,
        enableVoice: false,
        enableFeedback: true,
        theme: 'dark',
        sessionExpiry: 24,
        maxMessages: 100,
        maxFileSize: 10 * 1024 * 1024,
        ...propConfig,
    };

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages, state.isTyping]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputMessage]);

    // Responsive handling
    useEffect(() => {
        const handleResize = () => {
            setState(prev => ({
                ...prev,
                isMobile: window.innerWidth < 768,
                isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
            }));
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load session on mount
    useEffect(() => {
        loadSession();
        if (defaultConfig.autoOpen) {
            setTimeout(() => openChat(), 500);
        }
    }, []);

    // Iframe communication
    useEffect(() => {
        if (window.parent !== window) {
            window.parent.postMessage(
                {
                    type: 'ai-widget:ready',
                    data: { version: '3.2.0' },
                },
                '*',
            );
        }

        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (!type || !type.startsWith('ai-widget:')) return;

            const action = type.replace('ai-widget:', '');
            switch (action) {
                case 'open':
                    setState(prev => ({
                        ...prev,
                        isOpen: true,
                        unreadCount: 0,
                    }));
                    setTimeout(() => textareaRef.current?.focus(), 100);
                    break;

                case 'close':
                    setState(prev => ({ ...prev, isOpen: false }));
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const loadSession = async () => {
        try {
            const key = `ai_chat_${defaultConfig.agentSlug}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                const expiry = new Date(data.expiry);

                if (expiry > new Date()) {
                    setState(prev => ({
                        ...prev,
                        sessionId: data.sessionId,
                        conversationId: data.conversationId,
                        messages: data.messages.map((msg: any) => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp),
                        })),
                    }));
                } else {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const saveSession = useCallback(() => {
        try {
            const key = `ai_chat_${defaultConfig.agentSlug}`;
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + defaultConfig.sessionExpiry);

            const data = {
                sessionId: state.sessionId,
                conversationId: state.conversationId,
                messages: state.messages.filter((msg) => !msg.isWelcome),
                expiry: expiry.toISOString(),
            };

            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }, [state.sessionId, state.conversationId, state.messages]);

    useEffect(() => {
        saveSession();
    }, [state.messages, saveSession]);

    const openChat = () => {
        setState(prev => ({ ...prev, isOpen: true, unreadCount: 0 }));
        if (state.messages.length === 0) {
            setState(prev => ({
                ...prev,
                messages: [{
                    id: 'welcome',
                    content: defaultConfig.welcomeMessage,
                    sender: 'bot',
                    timestamp: new Date(),
                    isWelcome: true,
                }],
            }));
        }
        setTimeout(() => textareaRef.current?.focus(), 100);
    };

    const closeChat = () => {
        setState(prev => ({ ...prev, isOpen: false }));
        saveSession();
    };

    const clearChat = () => {
        setState(prev => ({
            ...prev,
            messages: [],
        }));
    };

    const sendMessage = async () => {
        const message = inputMessage.trim();
        if (!message || state.isLoading) return;

        const messageId = `user-${Date.now()}`;

        // Add user message
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
                id: messageId,
                content: message,
                sender: 'user',
                timestamp: new Date(),
                status: 'pending',
            }],
            isLoading: true,
        }));

        setInputMessage('');

        // Create session if needed
        if (!state.sessionId) {
            await createSession();
        }

        // Send to API
        try {
            const response = await fetch(`${defaultConfig.apiBaseUrl}/deepseek/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Widget-ID': defaultConfig.agentSlug,
                    ...(defaultConfig.apiKey ? { Authorization: `Bearer ${defaultConfig.apiKey}` } : {}),
                },
                body: JSON.stringify({
                    session_id: state.sessionId,
                    message: message,
                    widget_id: defaultConfig.agentSlug,
                    stream: true,
                }),
            });

            // Update message status
            setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                    msg.id === messageId ? { ...msg, status: 'delivered' } : msg
                ),
            }));

            await processStreamResponse(response, messageId);
        } catch (error) {
            console.error('Failed to send message:', error);
            setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                    msg.id === messageId ? { ...msg, status: 'failed' } : msg
                ),
                isLoading: false,
            }));
        }
    };

    const createSession = async () => {
        try {
            const response = await fetch(`${defaultConfig.apiBaseUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Widget-ID': defaultConfig.agentSlug,
                },
                body: JSON.stringify({
                    widget_id: defaultConfig.agentSlug,
                    metadata: {
                        user_agent: navigator.userAgent,
                        url: window.location.href,
                        language: navigator.language,
                    },
                }),
            });

            const data = await response.json();
            if (data.success && data.data) {
                setState(prev => ({
                    ...prev,
                    sessionId: data.data.session_id,
                    conversationId: data.data.conversation_id,
                }));
            }
        } catch (error) {
            console.error('Failed to create session:', error);
            setState(prev => ({
                ...prev,
                sessionId: `local-${Date.now()}`,
            }));
        }
    };

    const processStreamResponse = async (response: Response, userMessageId: string) => {
        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulatedContent = '';
        const botMessageId = `bot-${Date.now()}`;

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, {
                id: botMessageId,
                content: '',
                sender: 'bot',
                timestamp: new Date(),
            }],
            isTyping: true,
        }));

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                accumulatedContent += parsed.content;

                                setState(prev => ({
                                    ...prev,
                                    messages: prev.messages.map(msg => 
                                        msg.id === botMessageId 
                                            ? { ...msg, content: accumulatedContent }
                                            : msg
                                    ),
                                }));
                            }
                        } catch (e) {
                            console.error('Stream parse error:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream processing error:', error);
        } finally {
            setState(prev => ({ ...prev, isLoading: false, isTyping: false }));
        }
    };

    const copyMessage = async (content: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const giveFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
        setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
                msg.id === messageId ? { ...msg, feedback } : msg
            ),
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const stopGeneration = () => {
        setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isTyping: false 
        }));
    };

    if (!state.isOpen) {
        return (
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
                <button
                    onClick={openChat}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: defaultConfig.primaryColor,
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <MessageSquare color="white" size={24} />
                    {state.unreadCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            minWidth: '20px',
                            height: '20px',
                            padding: '0 6px',
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}>
                            {Math.min(state.unreadCount, 9)}
                        </div>
                    )}
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Mobile overlay */}
            <div
                onClick={closeChat}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 40,
                    display: state.isMobile ? 'block' : 'none'
                }}
            />

            {/* Chat widget */}
            <div style={{
                position: 'fixed',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'white',
                borderRadius: state.isMobile ? '16px' : '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                border: '1px solid #e5e7eb',
                bottom: state.isMobile ? '16px' : '24px',
                right: state.isMobile ? '16px' : '24px',
                left: state.isMobile ? '16px' : 'auto',
                top: state.isMobile ? '80px' : 'auto',
                width: state.isMobile ? 'auto' : '440px',
                height: state.isMobile ? 'auto' : '700px',
                maxHeight: state.isMobile ? 'calc(100vh - 96px)' : '700px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    borderRadius: state.isMobile ? '16px 16px 0 0' : '24px 24px 0 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #e5e7eb'
                        }}>
                            <span style={{ fontSize: '18px' }}>🤖</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '15px' }}>
                                {defaultConfig.botName}
                            </h3>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ 
                                    width: '6px', 
                                    height: '6px', 
                                    borderRadius: '50%', 
                                    backgroundColor: state.isOnline ? '#10b981' : '#ef4444' 
                                }}></span>
                                {state.isOnline ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            onClick={clearChat}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Trash2 size={16} color="#6b7280" />
                        </button>
                        <button
                            onClick={closeChat}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={16} color="#6b7280" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '20px',
                    backgroundColor: '#ffffff'
                }}>
                    {state.messages.map((msg) => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '24px',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            {msg.sender === 'bot' && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>
                                    <span style={{ fontSize: '16px' }}>🤖</span>
                                </div>
                            )}

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px', 
                                maxWidth: '75%',
                                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    backgroundColor: msg.sender === 'user' ? '#111827' : '#f3f4f6',
                                    color: msg.sender === 'user' ? 'white' : '#111827',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.content}
                                </div>

                                {msg.sender === 'bot' && (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '8px', 
                                        paddingLeft: '4px'
                                    }}>
                                        <button
                                            onClick={() => copyMessage(msg.content, msg.id)}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {copiedMessageId === msg.id ? 
                                                <Check size={14} color="#10b981" /> : 
                                                <Copy size={14} color="#6b7280" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => giveFeedback(msg.id, 'like')}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <ThumbsUp 
                                                size={14} 
                                                color={msg.feedback === 'like' ? '#10b981' : '#6b7280'} 
                                                fill={msg.feedback === 'like' ? '#10b981' : 'none'} 
                                            />
                                        </button>
                                        <button
                                            onClick={() => giveFeedback(msg.id, 'dislike')}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <ThumbsDown 
                                                size={14} 
                                                color={msg.feedback === 'dislike' ? '#ef4444' : '#6b7280'} 
                                                fill={msg.feedback === 'dislike' ? '#ef4444' : 'none'} 
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {msg.sender === 'user' && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>
                                    <span style={{ fontSize: '16px' }}>👤</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {state.isTyping && (
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <span style={{ fontSize: '16px' }}>🤖</span>
                            </div>
                            <div style={{
                                backgroundColor: '#f3f4f6',
                                borderRadius: '16px',
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#9ca3af', 
                                    animation: 'bounce 1.4s infinite' 
                                }} />
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#9ca3af', 
                                    animation: 'bounce 1.4s infinite 0.2s' 
                                }} />
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#9ca3af', 
                                    animation: 'bounce 1.4s infinite 0.4s' 
                                }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ 
                    padding: '12px 16px 24px', 
                    borderRadius: state.isMobile ? '0 0 16px 16px' : '0 0 24px 24px',
                    backgroundColor: 'white'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '8px',
                        borderRadius: '24px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        padding: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'box-shadow 0.2s'
                    }}>
                        {defaultConfig.enableFiles && (
                            <button style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Plus size={20} color="#6b7280" />
                            </button>
                        )}

                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={defaultConfig.placeholder}
                            style={{
                                flex: 1,
                                resize: 'none',
                                border: 'none',
                                outline: 'none',
                                padding: '10px 0',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                maxHeight: '200px',
                                minHeight: '24px',
                                color: '#111827',
                                backgroundColor: 'transparent'
                            }}
                            rows={1}
                        />

                        {state.isLoading ? (
                            <button
                                onClick={stopGeneration}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <StopCircle size={20} color="#6b7280" />
                            </button>
                        ) : (
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim()}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: inputMessage.trim() ? defaultConfig.primaryColor : 'transparent',
                                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (inputMessage.trim()) e.currentTarget.style.backgroundColor = defaultConfig.secondaryColor;
                                }}
                                onMouseOut={(e) => {
                                    if (inputMessage.trim()) e.currentTarget.style.backgroundColor = defaultConfig.primaryColor;
                                }}
                            >
                                <Send size={16} color={inputMessage.trim() ? 'white' : '#d1d5db'} />
                            </button>
                        )}
                    </div>
                    <p style={{ 
                        fontSize: '11px', 
                        color: '#6b7280', 
                        textAlign: 'center', 
                        marginTop: '12px', 
                        marginBottom: 0 
                    }}>
                        AI can make mistakes. Check important info.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </>
    );
};

export default ChatWidget;