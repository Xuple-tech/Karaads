import Editor from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import {
    ArrowDown,
    Check,
    ChevronDown,
    Copy,
    Download,
    FileText,
    Loader2,
    PanelRight,
    PanelRightClose,
    RotateCcw,
    Send,
    Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAuthToken } from '@/spa/lib/auth-token';
import { subscribeToPrivateChannel, type RealtimePayload } from '@/spa/lib/realtime';
import { useSessionQuery } from '@/spa/lib/session';

type DocMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
};

type ExportResult = {
    success: boolean;
    url?: string;
    error?: string;
};

const MODELS: Record<string, string> = {
    'grok-4': 'Grok 4',
    'grok-4-fast-non-reasoning': 'Grok 4 Fast',
    'grok-4-fast-reasoning': 'Grok 4 Reasoning',
};

const DOCUMENT_TYPES: Record<string, string> = {
    general: 'General',
    report: 'Report',
    proposal: 'Proposal',
    letter: 'Letter',
    essay: 'Essay',
    resume: 'Resume',
    business: 'Business',
    academic: 'Academic',
    technical: 'Technical',
    code: 'Code Doc',
};

const STARTER_PROMPTS = [
    { label: 'Project proposal', prompt: 'Write a professional project proposal for a mobile app startup' },
    { label: 'API technical docs', prompt: 'Create technical documentation for a REST API with authentication endpoints' },
    { label: 'Business report', prompt: 'Draft a quarterly business performance report with executive summary' },
    { label: 'Recommendation letter', prompt: 'Write a formal letter of recommendation for a senior software engineer' },
];

function authHeaders(): Record<string, string> {
    const token = getAuthToken();

    return token ? { Authorization: `Bearer ${token}` } : {};
}

function DocMessageBubble({ message }: { message: DocMessage }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    isUser
                        ? 'bg-foreground text-background'
                        : 'border border-border/60 bg-card text-foreground'
                }`}
            >
                <ReactMarkdown rehypePlugins={[rehypePrism]} remarkPlugins={[remarkGfm]}>
                    {message.content || (message.isStreaming ? '...' : '')}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export default function DocBuilderPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId?: string }>();
    const sessionQuery = useSessionQuery();
    const firstName = sessionQuery.data?.user?.name?.split(' ')[0];
    const userId = sessionQuery.data?.user?.id;

    const [messages, setMessages] = useState<DocMessage[]>([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [userScrolledUp, setUserScrolledUp] = useState(false);

    const [documentContent, setDocumentContent] = useState('');
    const [documentTitle, setDocumentTitle] = useState('Untitled Document');
    const [documentType, setDocumentType] = useState('general');
    const [model, setModel] = useState('grok-4');

    const [conversationId, setConversationId] = useState<string | null>(sessionId ?? null);
    const [isLoadingSession, setIsLoadingSession] = useState(Boolean(sessionId));
    const [panelOpen, setPanelOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        document.title = 'Doc Builder - Kwati AI';
    }, []);

    const isNearBottom = () => {
        const el = scrollRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    };

    const scrollToBottom = useCallback((smooth = true) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        setShowScrollBtn(false);
        setUserScrolledUp(false);
    }, []);

    const handleScroll = useCallback(() => {
        const near = isNearBottom();
        setShowScrollBtn(!near);
        setUserScrolledUp(!near);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (!userScrolledUp) {
            scrollToBottom(true);
        }
    }, [messages.length, userScrolledUp, scrollToBottom]);

    const loadSession = useCallback(async (targetSessionId: string) => {
        setIsLoadingSession(true);

        try {
            const response = await fetch(`/api/doc-builder/sessions/${targetSessionId}`, {
                headers: { ...authHeaders() },
            });

            if (!response.ok) {
                return;
            }

            const { session } = await response.json();
            setConversationId(session.id);
            setDocumentTitle(session.title ?? 'Untitled Document');
            setDocumentType(session.document_type ?? 'general');
            setModel(session.doc_model ?? 'grok-4');
            setDocumentContent(session.document_content ?? '');
            setPanelOpen(Boolean(session.document_content));
            setMessages(
                (session.messages ?? []).map((message: { id: string; role: 'user' | 'assistant'; content: string }) => ({
                    id: message.id,
                    role: message.role,
                    content: message.content,
                })),
            );
        } finally {
            setIsLoadingSession(false);
        }
    }, []);

    useEffect(() => {
        if (!sessionId) return;
        void loadSession(sessionId);
    }, [loadSession, sessionId]);

    const handleRealtimeEvent = useCallback((eventName: string, payload: RealtimePayload) => {
        const messageId = typeof payload.message_id === 'string' ? payload.message_id : null;

        if (eventName === 'message.created' && payload.message && typeof payload.message === 'object') {
            const message = payload.message as { id: string; role: 'user' | 'assistant'; content_markdown?: string };
            setMessages(prev => [
                ...prev.filter(item => item.id !== message.id),
                {
                    id: message.id,
                    role: message.role,
                    content: message.content_markdown ?? '',
                    isStreaming: true,
                },
            ]);
        }

        if (eventName === 'message.delta' && messageId) {
            setMessages(prev => prev.map(message =>
                message.id === messageId
                    ? { ...message, content: `${message.content}${String(payload.content ?? '')}`, isStreaming: true }
                    : message,
            ));
        }

        if (eventName === 'document.delta') {
            const nextDocument = typeof payload.document_content === 'string'
                ? payload.document_content
                : `${documentContent}${String(payload.content ?? '')}`;
            setDocumentContent(nextDocument);
            setPanelOpen(true);
            setActiveTab('preview');
        }

        if (eventName === 'message.completed' && messageId) {
            setMessages(prev => prev.map(message =>
                message.id === messageId
                    ? {
                          ...message,
                          content: typeof payload.content === 'string' ? payload.content : message.content,
                          isStreaming: false,
                      }
                    : message,
            ));
            setIsStreaming(false);
        }

        if (eventName === 'message.failed' && messageId) {
            const errorMessage = String(payload.error ?? 'Generation failed.');
            setMessages(prev => prev.map(message =>
                message.id === messageId
                    ? { ...message, isStreaming: false, content: message.content || `Error: ${errorMessage}` }
                    : message,
            ));
            setError(errorMessage);
            setIsStreaming(false);
        }

        if (eventName === 'document.saved' && typeof payload.document_content === 'string') {
            setDocumentContent(payload.document_content);
            void queryClient.invalidateQueries({ queryKey: ['spa', 'doc-builder-sessions'] });
        }
    }, [documentContent, queryClient]);

    useEffect(() => {
        if (!conversationId) {
            return;
        }

        return subscribeToPrivateChannel(
            `conversation.${conversationId}`,
            handleRealtimeEvent,
            {
                onSubscribed: () => {
                    void loadSession(conversationId);
                },
                onError: () => setError('Realtime connection failed. Refresh to resync this document.'),
            },
        );
    }, [conversationId, handleRealtimeEvent, loadSession]);

    useEffect(() => {
        if (!userId) {
            return;
        }

        return subscribeToPrivateChannel(`user.${userId}`, (eventName) => {
            if (eventName === 'conversation.updated') {
                void queryClient.invalidateQueries({ queryKey: ['spa', 'doc-builder-sessions'] });
            }
        });
    }, [queryClient, userId]);

    const sendMessage = useCallback(async (text?: string) => {
        const prompt = (text ?? input).trim();
        if (!prompt || isStreaming) return;

        setInput('');
        setError(null);
        setExportError(null);
        setIsStreaming(true);
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        const localUserId = `user-${Date.now()}`;
        const localAssistantId = `assistant-${Date.now()}`;
        setMessages(prev => [
            ...prev,
            { id: localUserId, role: 'user', content: prompt },
            { id: localAssistantId, role: 'assistant', content: '', isStreaming: true },
        ]);

        try {
            const response = await fetch('/api/doc-builder/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    message: prompt,
                    document: documentContent,
                    title: documentTitle,
                    document_type: documentType,
                    model,
                    conversation_id: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Request failed (${response.status})`);
            }

            const payload = await response.json();
            const nextConversationId = payload.conversation_id as string;
            setConversationId(nextConversationId);
            setMessages(prev => prev.map(message =>
                message.id === localAssistantId
                    ? { ...message, id: payload.assistant_message_id as string }
                    : message,
            ));

            if (!conversationId) {
                navigate(`/doc-builder/${nextConversationId}`, { replace: true });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong.';
            setError(message);
            setMessages(prev => prev.map(item =>
                item.id === localAssistantId ? { ...item, content: `Error: ${message}`, isStreaming: false } : item,
            ));
            setIsStreaming(false);
        }
    }, [conversationId, documentContent, documentTitle, documentType, input, isStreaming, model, navigate]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        event.target.style.height = 'auto';
        event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void sendMessage();
        }
    }, [sendMessage]);

    const exportDocument = useCallback(async (format: 'pdf' | 'docx') => {
        if (!documentContent.trim()) return;
        setIsExporting(true);
        setExportError(null);

        try {
            const response = await fetch('/api/doc-builder/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    content: documentContent,
                    title: documentTitle,
                    format,
                    document_type: documentType,
                }),
            });

            const result: ExportResult = await response.json();
            if (!result.success || !result.url) {
                throw new Error(result.error ?? 'Export failed');
            }

            window.open(result.url, '_blank');
        } catch (error) {
            setExportError(error instanceof Error ? error.message : 'Export failed.');
        } finally {
            setIsExporting(false);
        }
    }, [documentContent, documentTitle, documentType]);

    const copyMarkdown = useCallback(async () => {
        if (!documentContent) return;
        await navigator.clipboard.writeText(documentContent);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }, [documentContent]);

    const clearAll = useCallback(() => {
        setMessages([]);
        setDocumentContent('');
        setDocumentTitle('Untitled Document');
        setDocumentType('general');
        setConversationId(null);
        setPanelOpen(false);
        setError(null);
        setExportError(null);
        setIsStreaming(false);
        navigate('/doc-builder', { replace: true });
    }, [navigate]);

    const handleTitleBlur = useCallback(() => {
        if (!conversationId || !documentTitle.trim()) return;
        void fetch(`/api/doc-builder/sessions/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ title: documentTitle }),
        });
    }, [conversationId, documentTitle]);

    if (isLoadingSession) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const isWelcome = messages.length === 0;

    return (
        <div className="relative flex h-full overflow-hidden">
            <div
                className="relative flex flex-col overflow-hidden transition-all duration-300"
                style={{ width: panelOpen ? '42%' : '100%' }}
            >
                <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain pb-48 pt-6 custom-scrollbar">
                    <div className="mx-auto w-full max-w-2xl px-4">
                        {isWelcome && (
                            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-lg">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                        {firstName ? `Hey ${firstName}, let's write` : 'What should we write?'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">Describe your document and Kwati will draft it live.</p>
                                </div>
                                <div className="grid w-full max-w-xl grid-cols-2 gap-2">
                                    {STARTER_PROMPTS.map(item => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => void sendMessage(item.prompt)}
                                            className="rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
                                        >
                                            <p className="font-medium text-foreground">{item.label}</p>
                                            <p className="mt-0.5 text-xs opacity-60 line-clamp-2">{item.prompt}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {messages.map(message => (
                                <DocMessageBubble key={message.id} message={message} />
                            ))}
                        </div>

                        {documentContent && !panelOpen && (
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(true)}
                                    className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
                                >
                                    <FileText className="h-4 w-4" />
                                    View document
                                    <PanelRight className="ml-auto h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="h-1" />
                    </div>
                </div>

                {showScrollBtn && (
                    <div className="pointer-events-none absolute bottom-36 left-0 right-0 z-20 flex justify-center">
                        <button
                            type="button"
                            onClick={() => scrollToBottom(true)}
                            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/60 bg-[#2a2a2a] px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-[#333333] hover:text-foreground active:scale-95"
                        >
                            <ArrowDown className="h-3.5 w-3.5" />
                            Scroll to bottom
                        </button>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="mx-auto w-full max-w-2xl px-4 pb-5">
                        <div className="rounded-2xl border border-border/60 bg-[#1c1c1c] shadow-lg">
                            <div className="flex items-end gap-3 px-4 py-3">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe the document you want..."
                                    className="min-h-[24px] max-h-[160px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
                                    rows={1}
                                    disabled={isStreaming}
                                />
                                <button
                                    type="button"
                                    onClick={() => void sendMessage()}
                                    disabled={isStreaming || !input.trim()}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-30"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                                                <Sparkles className="h-3 w-3 text-primary" />
                                                {MODELS[model]}
                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="top" className="w-44">
                                            {Object.entries(MODELS).map(([key, value]) => (
                                                <DropdownMenuItem key={key} onSelect={() => setModel(key)}>
                                                    {value}
                                                    {model === key && <Check className="ml-auto h-3 w-3" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                                                <FileText className="h-3 w-3" />
                                                {DOCUMENT_TYPES[documentType]}
                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="top" className="w-40">
                                            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                                                <DropdownMenuItem key={key} onSelect={() => setDocumentType(key)}>
                                                    {value}
                                                    {documentType === key && <Check className="ml-auto h-3 w-3" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-1">
                                    {documentContent && !panelOpen && (
                                        <button
                                            type="button"
                                            onClick={() => setPanelOpen(true)}
                                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
                                        >
                                            <PanelRight className="h-3 w-3" />
                                            View doc
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                        title="New document"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
                            Enter to send. Shift+Enter for newline.
                        </p>
                    </div>
                </div>
            </div>

            {panelOpen && (
                <div className="flex min-w-0 flex-1 flex-col border-l border-border/50 bg-background">
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                        <div className="min-w-0">
                            <input
                                value={documentTitle}
                                onBlur={handleTitleBlur}
                                onChange={(event) => setDocumentTitle(event.target.value)}
                                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                            />
                            <p className="text-xs text-muted-foreground">{DOCUMENT_TYPES[documentType]}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={copyMarkdown} size="sm" variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        {isExporting ? 'Exporting...' : 'Export'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => void exportDocument('pdf')}>Export PDF</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => void exportDocument('docx')}>Export DOCX</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={() => setPanelOpen(false)} size="icon" variant="ghost">
                                <PanelRightClose className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {exportError && (
                        <div className="border-b border-destructive/30 bg-destructive/8 px-4 py-2 text-sm text-destructive">
                            {exportError}
                        </div>
                    )}

                    <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
                        <Button
                            size="sm"
                            variant={activeTab === 'preview' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('preview')}
                        >
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            variant={activeTab === 'edit' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('edit')}
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden">
                        {activeTab === 'preview' ? (
                            <div className="h-full overflow-y-auto px-6 py-5">
                                <article className="prose prose-invert max-w-none">
                                    <ReactMarkdown rehypePlugins={[rehypePrism]} remarkPlugins={[remarkGfm]}>
                                        {documentContent || '# Start writing\n\nYour document preview will appear here.'}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        ) : (
                            <Editor
                                value={documentContent}
                                onChange={(value) => setDocumentContent(value ?? '')}
                                language="markdown"
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    wordWrap: 'on',
                                    fontSize: 14,
                                }}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
