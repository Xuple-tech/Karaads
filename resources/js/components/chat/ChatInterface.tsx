import { ChatProps, Message as MessageType } from '@/types/chat';
import { usePage } from '@inertiajs/react';
import { useContext, useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { toast } from 'sonner';
import { SidebarContextProvider } from '../ui/sidebar';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import ChatInput from './ChatInput';
import FeedBackForm from './FeedBackform';
import Message from './Message';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import LimitNotification from '../LimitNotification';
import { LoginDialog } from '../LoginDialog';
import { useToolStatus } from '@/hooks/useToolStatus';
import ToolStatusDisplay from './ToolStatusDisplay';

interface ChatInterfaceProps {
    isAuthenticated: boolean;
}

type PageProps = {
    props: ChatProps;
};

type ErrorState = {
    message: string;
    retryAction?: () => void;
} | null;

type LimitError = {
    message: string;
    action: 'upgrade' | 'login';
    type?: string;
    limit?: number;
    used?: number;
    reset_at?: string;
    reset_type?: 'daily' | 'monthly';
    plan_name?: string;
} | null;

// Memoized welcome screen component
const WelcomeScreen = memo(({ userName }: { userName?: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in-50 duration-700">
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 blur-3xl animate-pulse" />
            <div className="relative p-6 rounded-2xl shadow-2xl border  backdrop-blur-sm">
                <img
                    src="/logo.png"
                    className="h-16 w-auto drop-shadow-xl transition-transform group-hover:scale-105 duration-300"
                    alt="Logo"
                />
            </div>
        </div>
        <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient leading-tight">
                Hello{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl max-w-md mx-auto leading-relaxed">
                How can I help you today?
            </p>

        </div>
    </div>
));

WelcomeScreen.displayName = 'WelcomeScreen';

// Memoized loading indicator
const LoadingIndicator = memo(() => (
    <div className="flex items-center gap-3 px-4 animate-in fade-in-50 duration-300">
        <div className="flex gap-2">
            <Skeleton className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <Skeleton className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <Skeleton className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">Thinking...</span>
    </div>
));

LoadingIndicator.displayName = 'LoadingIndicator';

// Memoized message avatar component
const MessageAvatar = memo(({ role, userName }: { role: 'user' | 'assistant'; userName?: string }) => (
    <Avatar className={`${role === 'user' ? 'right-1 ms-auto top-6 z-[2]' : 'ml-4'} transition-transform hover:scale-105 duration-200`}>
        {/* <AvatarImage src="no-profile" /> */}
        <AvatarFallback className={`${role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'} font-semibold`}>
            {role === 'assistant' ? 'AI' : (userName?.slice(0, 1) ?? 'G')}
        </AvatarFallback>
    </Avatar>
));

MessageAvatar.displayName = 'MessageAvatar';

export default function ChatInterface({ isAuthenticated }: ChatInterfaceProps) {
    const [feedbackFormState, setFeedbackFormState] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<ErrorState>(null);
    const [limitError, setLimitError] = useState<LimitError>(null);
    const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
    const [loginDialogType, setLoginDialogType] = useState<string>('unauthenticated');
    const [retryCount, setRetryCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Tool status management
    const { activeTools, updateToolStatus, clearAllTools, getToolsByStatus } = useToolStatus();

    const { auth, chats: initialChats, conversation: initialConversation } = usePage<PageProps>().props;
    const [messages, setMessages] = useState<MessageType[]>(initialChats || []);
    const sidebarContext = useContext(SidebarContextProvider);
    const [conversation, setConversation] = useState<{ conversation_id: number | null }>({
        conversation_id: initialConversation?.id || null,
    });

    // Track when content generation starts to hide tool status
    const [contentGenerationStarted, setContentGenerationStarted] = useState(false);

    // Memoized user name
    const userName = useMemo(() => auth.user?.name?.split(' ')[0], [auth.user?.name]);

    // Optimized scroll to bottom with intersection observer
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, []);

    // Debounced scroll effect
    useEffect(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages.length, scrollToBottom]);

    // Helper function to parse limit errors from tool failure messages
    const parseLimitError = useCallback((toolName: string, errorMessage: string) => {
        const isLimitError = errorMessage.toLowerCase().includes('limit') ||
            errorMessage.toLowerCase().includes('exceeded') ||
            errorMessage.toLowerCase().includes('quota');

        if (!isLimitError) return null;

        const isDaily = errorMessage.toLowerCase().includes('daily');
        const resetType = isDaily ? 'daily' : 'monthly';

        let message = '';
        if (toolName === 'generate_image') {
            message = 'Daily image generation limit reached. Upgrade to generate more images!';
        } else if (toolName === 'web_search') {
            message = 'Daily web search limit reached. Upgrade for unlimited searches!';
        } else {
            message = 'Daily limit reached. Upgrade to continue using this feature!';
        }

        return {
            message,
            action: 'upgrade' as const,
            type: toolName,
            reset_type: resetType,
        };
    }, []);

    const createConversation = useCallback(async (title: string): Promise<number | null> => {
        try {
            const response = await fetch('/api/conversations/c-sdnsnd-smmsm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                throw new Error(`Failed to create conversation`);
            }

            const data = await response.json();
            return data.id;
        } catch (error) {
            setError({
                message: 'Oops! We had trouble starting a new conversation.',
                retryAction: () => createConversation(title)
            });
            return null;
        }
    }, []);

    const processFiles = useCallback(async (files: File[]) => {
        return Promise.all(files.map(async (file) => {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            return {
                name: file.name,
                type: file.type,
                data: base64
            };
        }));
    }, []);

    const fetchAndUpdateConversationHistory = useCallback(async () => {
        if (!conversation.conversation_id) return;

        try {
            const response = await fetch(`/c/${conversation.conversation_id}`);
            if (!response.ok) return;

            const html = await response.text();
            const dataMatch = html.match(/window\.initialState\s*=\s*({[\s\S]*?});/);

            if (!dataMatch) return;

            const initialState = JSON.parse(dataMatch[1]);
            if (initialState.props?.chats) {
                setMessages(initialState.props.chats);
            }
        } catch (error) {
            console.warn('Failed to refresh conversation history:', error);
        }
    }, [conversation.conversation_id]);

    const handleSubmit = useCallback(async (e: React.FormEvent, type: 'text' | 'image', files?: File[]) => {
        e.preventDefault();

        const prompt = inputRef.current?.value || '';
        if (!prompt.trim()) return;

        // Clear any previous errors and tool status
        setError(null);
        setLimitError(null);
        clearAllTools();
        setContentGenerationStarted(false);

        const userMessageContent = prompt.trim();
        const timestamp = new Date().toISOString();

        // Convert uploaded files to file attachments for display
        const fileAttachments = files?.map(file => ({
            filename: file.name,
            mime_type: file.type,
            file_size: file.size
        })) || [];

        setMessages((prev) => [...prev, {
            role: 'user',
            content: userMessageContent,
            type,
            timestamp,
            files: fileAttachments
        }]);

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.style.height = 'auto';
        }

        setIsLoading(true);
        let conversationId = conversation.conversation_id || null;

        // Create conversation if needed
        if (!conversation.conversation_id) {
            const newConversationId = await createConversation(userMessageContent);
            if (newConversationId) {
                setConversation({ conversation_id: newConversationId });
                conversationId = newConversationId;
                history.replaceState({}, '', `/c/${newConversationId}`);
            } else {
                setIsLoading(false);
                return;
            }
        }

        // Initialize assistant message for streaming
        setMessages((prev) => [...prev, {
            role: 'assistant',
            tool_call_id: null,
            tool_calls: null,
            tool_name: "",
            content: '',
            thinking: '',
            isStreaming: true,
            type
        }]);

        // Process files
        let processedFiles = [];
        if (files && files.length > 0) {
            try {
                processedFiles = await processFiles(files);
            } catch (error) {
                setError({
                    message: 'Unable to process attached files. Please try again.',
                    retryAction: () => handleSubmit(e, type, files)
                });
                setIsLoading(false);
                return;
            }
        }

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            const endpoint = '/api/create/challenge/message';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({
                    message: userMessageContent,
                    stream: true,
                    type: mode,
                    conversation_id: conversationId,
                    files: processedFiles,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const data = await response.json();

                if (data.login_required) {
                    setShowLoginDialog(true);
                    setLoginDialogType(data.type || 'unauthenticated');
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        if (newMessages[newMessages.length - 1]?.role === 'assistant' && newMessages[newMessages.length - 1]?.isStreaming) {
                            newMessages.pop();
                        }
                        return newMessages;
                    });
                    setIsLoading(false);
                    return;
                }

                throw new Error(data.error || 'Failed to get response');
            }

            if (!response.body) {
                throw new Error('Response has no body');
            }

            const reader = response.body.getReader();
            let buffer = '';
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;

                        const eventData = line.substring(6);

                        try {
                            const data = JSON.parse(eventData);

                            if (data.error && !data.tool_status) {
                                if (data.message_id) {
                                    setMessages((prev) => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage?.role === 'assistant') {
                                            lastMessage.id = data.message_id;
                                        }
                                        return newMessages;
                                    });
                                }
                                throw new Error(data.error);
                            }

                            if (data.message_id) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        lastMessage.id = data.message_id;
                                    }
                                    return newMessages;
                                });
                            }

                            if (data.done) break;

                            // Handle tool status updates
                            if (data.tool_status) {
                                if (data.tool_status === 'failed' || data.tool_status === 'tool_failed') {
                                    // Update tool status system
                                    updateToolStatus({
                                        tool_name: data.tool_name || 'unknown',
                                        tool_status: 'tool_failed',
                                        tool_executing_message: data.error || 'Tool execution failed',
                                        metadata: data
                                    });

                                    if (data.login_required) {
                                        setShowLoginDialog(true);
                                        setLoginDialogType(data.type || 'unauthenticated');
                                        setMessages((prev) => {
                                            const newMessages = [...prev];
                                            if (newMessages[newMessages.length - 1]?.role === 'assistant' && newMessages[newMessages.length - 1]?.isStreaming) {
                                                newMessages.pop();
                                            }
                                            return newMessages;
                                        });
                                        setIsLoading(false);
                                        return;
                                    }

                                    const limitErr = parseLimitError(data.tool_name || '', data.error || '');
                                    if (limitErr) {
                                        setLimitError(limitErr);
                                    }

                                    setMessages((prev) => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage?.role === 'assistant') {
                                            if (!lastMessage.metadata) {
                                                lastMessage.metadata = {};
                                            }
                                            lastMessage.metadata.tool_status = 'failed';
                                            lastMessage.metadata.tool_name = data.tool_name;
                                            lastMessage.metadata.tool_error = data.error;
                                            lastMessage.isStreaming = false;
                                        }
                                        return [...newMessages];
                                    });
                                } else if (data.tool_status === 'executing') {
                                    // Update tool status system
                                    updateToolStatus({
                                        tool_name: data.tool_name || 'unknown',
                                        tool_status: 'executing_tool',
                                        tool_executing_message: data.tool_executing_message || data.message,
                                        progress: data.progress,
                                        metadata: data
                                    });

                                    setMessages((prev) => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage?.role === 'assistant') {
                                            if (!lastMessage.metadata) {
                                                lastMessage.metadata = {};
                                            }
                                            lastMessage.metadata.tool_status = 'executing_tool';
                                            lastMessage.metadata.tool_name = data.tool_name;
                                            lastMessage.metadata.tool_executing_message = data.message;
                                            lastMessage.isStreaming = true;
                                        }
                                        return [...newMessages];
                                    });
                                } else if (data.tool_status === 'tool_completed') {
                                    // Update tool status system
                                    updateToolStatus({
                                        tool_name: data.tool_name || 'unknown',
                                        tool_status: 'tool_completed',
                                        metadata: data
                                    });

                                    setMessages((prev) => {
                                        const newMessages = [...prev];
                                        const lastMessage = newMessages[newMessages.length - 1];
                                        if (lastMessage?.role === 'assistant') {
                                            if (!lastMessage.metadata) {
                                                lastMessage.metadata = {};
                                            }
                                            lastMessage.metadata.tool_status = 'tool_completed';

                                            if (!lastMessage.metadata.tool_results) {
                                                lastMessage.metadata.tool_results = [];
                                            }
                                            lastMessage.metadata.tool_results.push({
                                                tool_name: data.tool_name,
                                                result: data.tool_result
                                            });

                                            if (data.tool_name === 'web_search') {
                                                if (data.references) {
                                                    lastMessage.metadata.references = data.references;
                                                }
                                                if (data.search_results) {
                                                    lastMessage.metadata.search_results = data.search_results;
                                                }
                                                if (data.search_query) {
                                                    lastMessage.metadata.search_query = data.search_query;
                                                }
                                            }

                                            // Clear executing status when tool completes
                                            lastMessage.isStreaming = false;
                                        }
                                        return [...newMessages];
                                    });
                                }
                            }

                            // Handle thinking process
                            if (data.thinking !== undefined) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        lastMessage.thinking = (lastMessage.thinking || '') + data.thinking;
                                    }
                                    return [...newMessages];
                                });
                            }

                            // Handle content generation - THIS IS THE KEY FIX
                            if (data.content !== undefined && data.content.trim() !== '') {
                                // Mark that content generation has started
                                if (!contentGenerationStarted) {
                                    setContentGenerationStarted(true);
                                    // Clear tool status when content starts
                                    clearAllTools();
                                }

                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        const isImageUrl = data.content.includes('http') && !data.content.includes(' ');

                                        if (lastMessage.type === 'image' && !isImageUrl) {
                                            if (data.content.trim()) {
                                                lastMessage.type = 'mixed';
                                                lastMessage.content = (lastMessage.content || '') + data.content;
                                            }
                                        } else if (lastMessage.type !== 'image' || lastMessage.type === 'mixed') {
                                            lastMessage.content = (lastMessage.content || '') + data.content;
                                        }

                                        // Clear tool status from message metadata when content appears
                                        if (lastMessage.metadata?.tool_status === 'executing_tool' && data.content.length > 10) {
                                            delete lastMessage.metadata.tool_status;
                                            delete lastMessage.metadata.tool_name;
                                            delete lastMessage.metadata.tool_executing_message;
                                        }
                                    }
                                    return [...newMessages];
                                });
                            }

                            if (data.image) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        const imageKey = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                        try {
                                            localStorage.setItem(`rhea_${imageKey}`, JSON.stringify({
                                                url: data.image.url,
                                                metadata: data.image.metadata,
                                                savedAt: Date.now()
                                            }));
                                        } catch (e) {
                                            console.warn('Failed to save image to localStorage:', e);
                                        }

                                        const imageData = {
                                            url: data.image.url,
                                            metadata: data.image.metadata,
                                            storageKey: imageKey
                                        };

                                        if (!lastMessage.type || lastMessage.type === 'text') {
                                            lastMessage.type = 'image';
                                            lastMessage.content = '';
                                            lastMessage.image = imageData;
                                        } else if (lastMessage.type === 'image' || lastMessage.type === 'mixed') {
                                            lastMessage.type = 'image';
                                            lastMessage.content = '';

                                            if (!lastMessage.images) {
                                                lastMessage.images = lastMessage.image ? [lastMessage.image] : [];
                                            }
                                            lastMessage.images.push(imageData);
                                        }

                                        if (!lastMessage.metadata) {
                                            lastMessage.metadata = {};
                                        }
                                        lastMessage.metadata.text_response = data.image.metadata?.text_response || '';
                                        lastMessage.metadata.tool_status = 'tool_completed';
                                        lastMessage.isStreaming = false;
                                    }
                                    return [...newMessages];
                                });
                            }

                            if (data.search_results && data.references) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        if (!lastMessage.metadata) {
                                            lastMessage.metadata = {};
                                        }
                                        lastMessage.metadata.search_results = data.search_results;
                                        lastMessage.metadata.search_query = data.search_query;
                                        lastMessage.metadata.search_count = data.search_count;
                                        lastMessage.metadata.references = data.references;
                                        lastMessage.metadata.tool_status = 'tool_completed';
                                        lastMessage.isStreaming = false;
                                    }
                                    return [...newMessages];
                                });
                            }
                        } catch (parseError) {
                            console.error('Failed to parse SSE message:', parseError);
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            // Finalize message
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                    lastMessage.isStreaming = false;
                    // Clear any remaining tool status when streaming is done
                    if (lastMessage.metadata?.tool_status === 'executing_tool') {
                        delete lastMessage.metadata.tool_status;
                        delete lastMessage.metadata.tool_name;
                        delete lastMessage.metadata.tool_executing_message;
                    }
                }
                return [...newMessages];
            });

            setIsLoading(false);
            setFiles([]);
            setRetryCount(0);
            setContentGenerationStarted(false);
        } catch (error: any) {
            console.error('Chat error:', error);

            if (error.name === 'AbortError') {
                return;
            }

            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
                    newMessages.pop();
                }
                return newMessages;
            });

            setError({
                message: retryCount > 2
                    ? 'Having trouble connecting. Please check your internet and try again.'
                    : 'Something went wrong. Would you like to try again?',
                retryAction: () => {
                    setRetryCount(prev => prev + 1);
                    handleSubmit(e, type, files);
                }
            });

            setIsLoading(false);
            setContentGenerationStarted(false);
        }
    }, [mode, conversation.conversation_id, createConversation, processFiles, parseLimitError, retryCount, contentGenerationStarted]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e, mode, files);
        }
    }, [handleSubmit, mode, files]);

    const handleRegenerate = useCallback(async (messageId: number) => {
        setError(null);
        setIsLoading(true);
        setContentGenerationStarted(false);

        const messageToRegenerate = messages.find(msg => msg.id === messageId);
        if (!messageToRegenerate) {
            setError({ message: 'Message not found' });
            setIsLoading(false);
            return;
        }

        try {
            if (messageToRegenerate.role === 'user') {
                const messageIndex = messages.findIndex(msg => msg.id === messageId);
                const nextAssistantMessage = messages.slice(messageIndex + 1).find(msg => msg.role === 'assistant');

                if (nextAssistantMessage && nextAssistantMessage.id) {
                    return handleRegenerate(nextAssistantMessage.id);
                } else {
                    setError({ message: 'No response to regenerate for this message' });
                    setIsLoading(false);
                    return;
                }
            }

            const response = await fetch(`/c/${messageId}/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                },
                body: JSON.stringify({ stream: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to regenerate response');
            }

            if (!response.body) {
                throw new Error('Response has no body');
            }

            const reader = response.body.getReader();
            let buffer = '';
            const decoder = new TextDecoder();

            setMessages((prev) => prev.map((msg) =>
                msg.id === messageId ? { ...msg, content: '', thinking: '', isStreaming: true } : msg
            ));

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;

                        const eventData = line.substring(6);
                        try {
                            const data = JSON.parse(eventData);

                            if (data.error) {
                                throw new Error(data.error);
                            }

                            if (data.done) {
                                setMessages((prev) => prev.map((msg) =>
                                    msg.id === messageId ? { ...msg, isStreaming: false } : msg
                                ));
                                break;
                            }

                            if (data.thinking !== undefined) {
                                setMessages((prev) => prev.map((msg) =>
                                    msg.id === messageId ? { ...msg, thinking: (msg.thinking || '') + data.thinking } : msg
                                ));
                            }

                            if (data.content !== undefined) {
                                setMessages((prev) => prev.map((msg) =>
                                    msg.id === messageId ? { ...msg, content: (msg.content || '') + data.content } : msg
                                ));
                            }
                        } catch (parseError) {
                            console.error('Failed to parse regeneration SSE message:', parseError);
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Regeneration error:', error);
            setError({
                message: 'Unable to regenerate response. Please try again.',
                retryAction: () => handleRegenerate(messageId)
            });
            setIsLoading(false);
        }
    }, [messages]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Memoized container class
    const containerClass = useMemo(() =>
        `relative mx-auto flex w-full flex-col gap-6 px-4 pt-6 pb-32 transition-all duration-300 ${sidebarContext?.open ? 'lg:max-w-3xl' : 'lg:max-w-4xl'
        }`, [sidebarContext?.open]
    );

    return (
        <div className="flex w-full flex-col justify-center bg-gradient-to-b from-background to-muted/20 min-h-screen">
            <FeedBackForm state={feedbackFormState} changeState={() => setFeedbackFormState(!feedbackFormState)} />

            <LoginDialog
                open={showLoginDialog}
                onOpenChange={setShowLoginDialog}
                limitType={loginDialogType}
            />

            <div className={containerClass}>
                {/* Welcome Screen */}
                {messages?.length === 0 && (
                    <WelcomeScreen userName={userName} />
                )}

                {/* Limit Error Notification */}
                {limitError && (
                    <LimitNotification
                        error={limitError}
                        onClose={() => setLimitError(null)}
                        onUpgrade={() => {
                            window.location.href = '/subscription/pricing';
                        }}
                    />
                )}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between gap-4">
                            <span className="flex-1 font-medium">{error.message}</span>
                            {error.retryAction && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearError}
                                        className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                                    >
                                        Dismiss
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={error.retryAction}
                                        className="shrink-0 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Messages */}
                <div className="space-y-6">
                    {messages.map((message, index) =>
                    (<div
                        key={message.id || index}
                        className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                    >
                        <>
                            {message.content != '' && <>
                                <MessageAvatar role={message.role} userName={userName} />
                                <Message
                                    message={message}
                                    onRegenerate={handleRegenerate}
                                    isProcessing={isLoading}
                                    onFeedback={() => setFeedbackFormState(true)}
                                /></>}
                        </>
                    </div>)
                    )}
                </div>

                {/* Tool Status Display - Only show when no content generation has started */}
                {activeTools.length > 0 && !contentGenerationStarted && (
                    <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <ToolStatusDisplay
                            tools={activeTools}
                            compact={true}
                            className="mb-4"
                        />
                    </div>
                )}

                {/* Loading Indicator */}
                {isLoading && <LoadingIndicator />}

                <div ref={messagesEndRef} />
            </div>

            {/* Footer Message */}
            {!isAuthenticated && (
                <div className="fixed bottom-28 left-0 right-0 pointer-events-none z-10">
                    <div className="container max-w-4xl mx-auto px-4">
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm bg-background/90 backdrop-blur-md rounded-full px-6 py-3 inline-block mx-auto border border-border/50 shadow-lg">
                                ✨ Log in for a personalized experience
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {messages.length > 0 && <div className="py-7" />}

            <ChatInput
                mode={mode}
                setMode={setMode}
                ref={inputRef}
                handleKeyDown={handleKeyDown}
                onSend={handleSubmit}
                is_processing={isLoading}
                files={files}
                setFiles={setFiles}
            />
        </div>
    );
}
