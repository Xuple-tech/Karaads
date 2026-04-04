import { Message as MessageType } from '@/types/chat';
import { useContext, useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { toast } from 'sonner';
import { SidebarContextProvider } from '@/components/ui/sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import ChatInput from '@/spa/components/SpaChatInput';
import FeedBackForm from '@/components/chat/FeedBackform';
import Message from '@/components/chat/Message';
import LimitNotification from '@/components/LimitNotification';
import { LoginDialog } from '@/components/LoginDialog';
import { useToolStatus } from '@/hooks/useToolStatus';
import ToolStatusDisplay from '@/components/chat/ToolStatusDisplay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatInterfaceProps {
    isAuthenticated: boolean;
    initialMessages?: MessageType[];
    initialConversationId?: string | null;
    userName?: string;
}

type ErrorState = { message: string; retryAction?: () => void } | null;

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const WelcomeScreen = memo(({ userName }: { userName?: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-6 animate-in fade-in-50 duration-500">
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-violet-500/30 blur-2xl rounded-3xl animate-pulse" />
            <div className="relative h-24 w-24 rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 duration-300">
                <img src="/logo.png" className="h-14 w-auto drop-shadow-lg" alt="Kwati AI" />
            </div>
        </div>
        <div className="text-center space-y-2 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {userName ? `Hello, ${userName}` : 'Hello'}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
                How can I help you today?
            </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
            {[
                'Summarise a document',
                'Help me write code',
                'Explain a concept',
                'Draft an email',
                'Translate text',
                'Generate an image',
            ].map(prompt => (
                <button
                    key={prompt}
                    className="text-left text-xs text-muted-foreground border border-border/50 rounded-xl px-3 py-2.5 hover:bg-accent/50 hover:text-foreground hover:border-border transition-colors"
                >
                    {prompt}
                </button>
            ))}
        </div>
    </div>
));
WelcomeScreen.displayName = 'WelcomeScreen';

const LoadingDots = memo(() => (
    <div className="flex items-center gap-2 px-2 py-1">
        {[0, 150, 300].map(delay => (
            <span
                key={delay}
                className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
            />
        ))}
    </div>
));
LoadingDots.displayName = 'LoadingDots';

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatInterface({
    isAuthenticated,
    initialMessages = [],
    initialConversationId = null,
    userName,
}: ChatInterfaceProps) {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<ErrorState>(null);
    const [limitError, setLimitError] = useState<LimitError>(null);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [loginDialogType, setLoginDialogType] = useState('unauthenticated');
    const [retryCount, setRetryCount] = useState(0);
    const [contentStarted, setContentStarted] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const { activeTools, updateToolStatus, clearAllTools } = useToolStatus();
    const [messages, setMessages] = useState<MessageType[]>(initialMessages || []);
    const sidebarContext = useContext(SidebarContextProvider);
    const [conversation, setConversation] = useState<{ conversation_id: string | null }>({
        conversation_id: initialConversationId || null,
    });

    useEffect(() => {
        setMessages(initialMessages || []);
    }, [initialMessages]);

    useEffect(() => {
        setConversation({ conversation_id: initialConversationId || null });
    }, [initialConversationId]);

    // ── Scroll ────────────────────────────────────────────────────────────────

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    useEffect(() => {
        const t = setTimeout(scrollToBottom, 80);
        return () => clearTimeout(t);
    }, [messages.length, scrollToBottom]);

    // ── Helpers ───────────────────────────────────────────────────────────────

    const parseLimitError = useCallback((toolName: string, msg: string): LimitError => {
        const lower = msg.toLowerCase();
        if (!lower.includes('limit') && !lower.includes('exceeded') && !lower.includes('quota')) return null;
        const reset_type = lower.includes('daily') ? 'daily' : 'monthly';
        const messageMap: Record<string, string> = {
            generate_image: 'Daily image generation limit reached. Upgrade to generate more images.',
            web_search: 'Daily web search limit reached. Upgrade for unlimited searches.',
        };
        return {
            message: messageMap[toolName] || 'Daily limit reached. Upgrade to continue.',
            action: 'upgrade',
            type: toolName,
            reset_type,
        };
    }, []);

    const createConversation = useCallback(async (title: string): Promise<string | null> => {
        try {
            const res = await fetch('/api/conversations/c-sdnsnd-smmsm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            return data.id;
        } catch {
            setError({ message: 'Could not start a new conversation. Please try again.' });
            return null;
        }
    }, []);

    const processFiles = useCallback(async (fileList: File[]) =>
        Promise.all(fileList.map(async file => {
            const data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            return { name: file.name, type: file.type, data };
        })), []);

    // ── SSE stream handler ────────────────────────────────────────────────────

    const readStream = useCallback(async (
        reader: ReadableStreamDefaultReader<Uint8Array>,
        messageId: string | null,
        onChunk: (data: any) => void,
    ) => {
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;
                    try { onChunk(JSON.parse(line.substring(6))); } catch { /* skip bad JSON */ }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }, []);

    // ── Send message ──────────────────────────────────────────────────────────

    const handleSubmit = useCallback(async (e: React.FormEvent, type: 'text' | 'image', attachedFiles?: File[]) => {
        e.preventDefault();
        const prompt = inputRef.current?.value?.trim();
        if (!prompt) return;

        setError(null);
        setLimitError(null);
        clearAllTools();
        setContentStarted(false);

        const fileAttachments = attachedFiles?.map(f => ({ filename: f.name, mime_type: f.type, file_size: f.size })) || [];

        setMessages(prev => [...prev, {
            role: 'user', content: prompt, type, timestamp: new Date().toISOString(), files: fileAttachments,
        }]);

        if (inputRef.current) { inputRef.current.value = ''; inputRef.current.style.height = 'auto'; }

        setIsLoading(true);
        let convId = conversation.conversation_id;

        if (!convId) {
            convId = await createConversation(prompt);
            if (!convId) { setIsLoading(false); return; }
            setConversation({ conversation_id: convId });
            history.replaceState({}, '', `/c/${convId}`);
        }

        setMessages(prev => [...prev, {
            role: 'assistant', tool_call_id: null, tool_calls: null, tool_name: '',
            content: '', thinking: '', isStreaming: true, type,
        }]);

        let processedFiles: any[] = [];
        if (attachedFiles?.length) {
            try { processedFiles = await processFiles(attachedFiles); }
            catch {
                setError({ message: 'Could not process attached files. Please try again.' });
                setIsLoading(false);
                return;
            }
        }

        abortRef.current = new AbortController();

        try {
            const res = await fetch('/api/create/challenge/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
                body: JSON.stringify({ message: prompt, stream: true, type: mode, conversation_id: convId, files: processedFiles }),
                signal: abortRef.current.signal,
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.login_required) {
                    setShowLoginDialog(true);
                    setLoginDialogType(data.type || 'unauthenticated');
                    setMessages(prev => prev.filter((_, i) => !(i === prev.length - 1 && prev[i]?.isStreaming)));
                    setIsLoading(false);
                    return;
                }
                throw new Error(data.error || 'Server error');
            }

            if (!res.body) throw new Error('No response body');

            await readStream(res.body.getReader(), null, (data) => {
                if (data.error && !data.tool_status) throw new Error(data.error);
                if (data.done) return;

                // message_id
                if (data.message_id) {
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last?.role === 'assistant') last.id = data.message_id;
                        return next;
                    });
                }

                // tool status
                if (data.tool_status) {
                    const { tool_status, tool_name, error: toolErr, tool_executing_message, tool_result, references, search_results, search_query } = data;

                    if (tool_status === 'executing') {
                        updateToolStatus({ tool_name: tool_name || 'unknown', tool_status: 'executing_tool', tool_executing_message: tool_executing_message || data.message, metadata: data });
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            if (last?.role === 'assistant') {
                                last.metadata = { ...last.metadata, tool_status: 'executing_tool', tool_name, tool_executing_message: data.message };
                                last.isStreaming = true;
                            }
                            return next;
                        });
                    } else if (tool_status === 'failed' || tool_status === 'tool_failed') {
                        updateToolStatus({ tool_name: tool_name || 'unknown', tool_status: 'tool_failed', tool_executing_message: toolErr || 'Failed', metadata: data });
                        if (data.login_required) {
                            setShowLoginDialog(true);
                            setLoginDialogType(data.type || 'unauthenticated');
                            setIsLoading(false);
                            return;
                        }
                        const le = parseLimitError(tool_name || '', toolErr || '');
                        if (le) setLimitError(le);
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            if (last?.role === 'assistant') {
                                last.metadata = { ...last.metadata, tool_status: 'failed', tool_name, tool_error: toolErr };
                                last.isStreaming = false;
                            }
                            return [...next];
                        });
                    } else if (tool_status === 'tool_completed') {
                        updateToolStatus({ tool_name: tool_name || 'unknown', tool_status: 'tool_completed', metadata: data });
                        setMessages(prev => {
                            const next = [...prev];
                            const last = next[next.length - 1];
                            if (last?.role === 'assistant') {
                                if (!last.metadata) last.metadata = {};
                                last.metadata.tool_status = 'tool_completed';
                                last.metadata.tool_results = [...(last.metadata.tool_results || []), { tool_name, result: tool_result }];
                                if (tool_name === 'web_search') {
                                    if (references) last.metadata.references = references;
                                    if (search_results) last.metadata.search_results = search_results;
                                    if (search_query) last.metadata.search_query = search_query;
                                }
                                last.isStreaming = false;
                            }
                            return [...next];
                        });
                    }
                }

                // thinking
                if (data.thinking !== undefined) {
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last?.role === 'assistant') last.thinking = (last.thinking || '') + data.thinking;
                        return [...next];
                    });
                }

                // content
                if (data.content !== undefined && data.content.trim() !== '') {
                    if (!contentStarted) { setContentStarted(true); clearAllTools(); }
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last?.role === 'assistant') {
                            last.content = (last.content || '') + data.content;
                            if (last.metadata?.tool_status === 'executing_tool' && data.content.length > 10) {
                                delete last.metadata.tool_status;
                                delete last.metadata.tool_name;
                                delete last.metadata.tool_executing_message;
                            }
                        }
                        return [...next];
                    });
                }

                // image
                if (data.image) {
                    setMessages(prev => {
                        const next = [...prev];
                        const last = next[next.length - 1];
                        if (last?.role === 'assistant') {
                            const img = { url: data.image.url, metadata: data.image.metadata };
                            if (!last.images) last.images = last.image ? [last.image] : [];
                            last.images.push(img);
                            last.image = img;
                            last.type = 'image';
                            last.content = '';
                            last.metadata = { ...(last.metadata || {}), tool_status: 'tool_completed' };
                            last.isStreaming = false;
                        }
                        return [...next];
                    });
                }
            });

            // Finalize
            setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === 'assistant') {
                    last.isStreaming = false;
                    if (last.metadata?.tool_status === 'executing_tool') {
                        delete last.metadata.tool_status;
                        delete last.metadata.tool_name;
                    }
                }
                return [...next];
            });

            setIsLoading(false);
            setFiles([]);
            setRetryCount(0);
            setContentStarted(false);

        } catch (err: any) {
            if (err.name === 'AbortError') return;

            setMessages(prev => {
                const next = [...prev];
                if (next[next.length - 1]?.isStreaming) next.pop();
                return next;
            });

            setError({
                message: retryCount > 2
                    ? 'Trouble connecting. Check your internet and try again.'
                    : 'Something went wrong. Would you like to retry?',
                retryAction: () => { setRetryCount(n => n + 1); handleSubmit(e, type, attachedFiles); },
            });

            setIsLoading(false);
            setContentStarted(false);
        }
    }, [mode, conversation.conversation_id, createConversation, processFiles, parseLimitError, retryCount, contentStarted, clearAllTools, updateToolStatus, readStream]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e, mode, files); }
    }, [handleSubmit, mode, files]);

    const handleRegenerate = useCallback(async (messageId: any) => {
        setError(null);
        setIsLoading(true);
        setContentStarted(false);

        const msg = messages.find(m => m.id === messageId);
        if (!msg) { setError({ message: 'Message not found' }); setIsLoading(false); return; }

        if (msg.role === 'user') {
            const idx = messages.findIndex(m => m.id === messageId);
            const next = messages.slice(idx + 1).find(m => m.role === 'assistant');
            if (next?.id) { handleRegenerate(next.id); return; }
            setError({ message: 'No response to regenerate.' });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`/c/${messageId}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
                body: JSON.stringify({ stream: true }),
            });
            if (!res.ok || !res.body) throw new Error('Regeneration failed');

            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: '', thinking: '', isStreaming: true } : m));

            await readStream(res.body.getReader(), messageId, (data) => {
                if (data.error) throw new Error(data.error);
                if (data.done) {
                    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isStreaming: false } : m));
                    return;
                }
                if (data.thinking !== undefined)
                    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, thinking: (m.thinking || '') + data.thinking } : m));
                if (data.content !== undefined)
                    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: (m.content || '') + data.content } : m));
            });

            setIsLoading(false);
        } catch {
            setError({ message: 'Could not regenerate. Please try again.', retryAction: () => handleRegenerate(messageId) });
            setIsLoading(false);
        }
    }, [messages, readStream]);

    const containerClass = useMemo(() =>
        `relative mx-auto flex w-full flex-col px-4 pt-6 pb-36 transition-all duration-300 ${sidebarContext?.open ? 'max-w-3xl' : 'max-w-4xl'}`,
        [sidebarContext?.open]
    );

    return (
        <div className="flex w-full flex-col min-h-screen bg-background">
            <FeedBackForm state={feedbackOpen} changeState={() => setFeedbackOpen(f => !f)} />
            <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} limitType={loginDialogType} />

            <div className={containerClass}>

                {/* Welcome */}
                {messages.length === 0 && <WelcomeScreen userName={userName} />}

                {/* Limit error */}
                {limitError && (
                    <LimitNotification
                        error={limitError}
                        onClose={() => setLimitError(null)}
                        onUpgrade={() => { window.location.href = '/subscription/pricing'; }}
                    />
                )}

                {/* Error banner */}
                {error && (
                    <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between gap-3">
                            <span className="flex-1">{error.message}</span>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setError(null)}>Dismiss</Button>
                                {error.retryAction && (
                                    <Button variant="destructive" size="sm" onClick={error.retryAction}>
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Retry
                                    </Button>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Messages */}
                <div className="space-y-2">
                    {messages.map((message, index) => {
                        const hasContent = (message.content?.trim() || message.images?.length || message.image);
                        if (!hasContent) return null;
                        return (
                            <div
                                key={message.id || index}
                                className="animate-in fade-in-50 slide-in-from-bottom-1 duration-300"
                                style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                            >
                                <Message
                                    message={message}
                                    onRegenerate={handleRegenerate}
                                    isProcessing={isLoading}
                                    onFeedback={() => setFeedbackOpen(true)}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Tool status */}
                {activeTools.length > 0 && !contentStarted && (
                    <div className="mt-4 animate-in fade-in-50 duration-300">
                        <ToolStatusDisplay tools={activeTools} compact className="mb-2" />
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="mt-4 px-2">
                        <LoadingDots />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Guest nudge */}
            {!isAuthenticated && (
                <div className="fixed bottom-28 left-0 right-0 pointer-events-none z-10 flex justify-center px-4">
                    <p className="text-sm text-muted-foreground bg-background/90 backdrop-blur-md border border-border/50 rounded-full px-5 py-2 shadow-sm">
                        Log in for a personalized experience
                    </p>
                </div>
            )}

            <ChatInput
                mode={mode}
                setMode={setMode}
                ref={inputRef}
                handleKeyDown={handleKeyDown}
                onSend={handleSubmit}
                isAuthenticated={isAuthenticated}
                is_processing={isLoading}
                files={files}
                setFiles={setFiles}
            />
        </div>
    );
}
