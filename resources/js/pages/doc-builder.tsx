import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import Editor from '@monaco-editor/react';
import {
    ArrowDown,
    Bot,
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
    Square,
    User,
    X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAuthToken } from '@/spa/lib/auth-token';
import { useSessionQuery } from '@/spa/lib/session';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

interface ExportResult {
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── SSE reader (same pattern as SpaChatInterface) ────────────────────────────

async function readDocSse(
    response: Response,
    onEvent: (event: string, data: Record<string, string>) => void,
    signal: AbortSignal,
) {
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        if (signal.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';

        for (const chunk of chunks) {
            let eventName = 'message';
            let rawData = '';
            for (const line of chunk.split('\n')) {
                if (line.startsWith('event: ')) eventName = line.slice(7).trim();
                if (line.startsWith('data: ')) rawData += line.slice(6);
            }
            if (!rawData) continue;
            try { onEvent(eventName, JSON.parse(rawData)); } catch { /* ignore */ }
        }
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DocBuilderPage() {
    useEffect(() => { document.title = 'Doc Builder — Kwati AI'; }, []);

    const { sessionId } = useParams<{ sessionId?: string }>();
    const navigate = useNavigate();

    const sessionQuery = useSessionQuery();
    const firstName = sessionQuery.data?.user?.name?.split(' ')[0];

    // Chat state
    const [messages, setMessages]    = useState<DocMessage[]>([]);
    const [input, setInput]          = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError]          = useState<string | null>(null);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [userScrolledUp, setUserScrolledUp] = useState(false);

    // Document state
    const [documentContent, setDocumentContent] = useState('');
    const [documentTitle, setDocumentTitle]     = useState('Untitled Document');
    const [documentType, setDocumentType]       = useState('general');
    const [model, setModel]                     = useState('grok-4');

    // Session state
    const [conversationId, setConversationId] = useState<string | null>(sessionId ?? null);
    const [isLoadingSession, setIsLoadingSession] = useState(!!sessionId);

    // Panel state
    const [panelOpen, setPanelOpen]   = useState(false);
    const [activeTab, setActiveTab]   = useState<'edit' | 'preview'>('preview');
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [copied, setCopied]           = useState(false);

    // Refs
    const scrollRef      = useRef<HTMLDivElement>(null);
    const inputRef       = useRef<HTMLTextAreaElement>(null);
    const abortRef       = useRef<AbortController | null>(null);

    // ── Load existing session from URL ─────────────────────────────────────
    useEffect(() => {
        if (!sessionId) return;
        setIsLoadingSession(true);
        fetch(`/api/doc-builder/sessions/${sessionId}`, {
            headers: { ...authHeaders() },
        })
            .then(r => r.json())
            .then(({ session }) => {
                setConversationId(session.id);
                setDocumentTitle(session.title ?? 'Untitled Document');
                setDocumentType(session.document_type ?? 'general');
                setModel(session.doc_model ?? 'grok-4');
                setDocumentContent(session.document_content ?? '');
                if (session.document_content) {
                    setPanelOpen(true);
                }
                const loadedMessages: DocMessage[] = (session.messages ?? []).map(
                    (m: { id: string; role: 'user' | 'assistant'; content: string }) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                    })
                );
                setMessages(loadedMessages);
            })
            .catch(() => { /* session not found — start fresh */ })
            .finally(() => setIsLoadingSession(false));
    }, [sessionId]);

    // ── Scroll helpers ─────────────────────────────────────────────────────

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
        if (near) setUserScrolledUp(false);
        else setUserScrolledUp(true);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (!userScrolledUp) scrollToBottom(true);
    }, [messages.length, userScrolledUp, scrollToBottom]);

    // ── Auto-resize textarea ───────────────────────────────────────────────

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
    }, []);

    // ── Send message ───────────────────────────────────────────────────────

    const sendMessage = useCallback(async (text?: string) => {
        const msgText = (text ?? input).trim();
        if (!msgText || isStreaming) return;

        setInput('');
        setError(null);
        setExportError(null);
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        const userId    = `user-${Date.now()}`;
        const assistId  = `asst-${Date.now()}`;

        setMessages(prev => [
            ...prev,
            { id: userId,   role: 'user',      content: msgText },
            { id: assistId, role: 'assistant',  content: '', isStreaming: true },
        ]);
        setIsStreaming(true);

        const history = messages.map(m => ({ role: m.role, content: m.content }));

        abortRef.current = new AbortController();
        const { signal } = abortRef.current;

        let chatBuffer = '';
        let docBuffer  = '';
        let docStarted = false;

        try {
            const response = await fetch('/api/doc-builder/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream', ...authHeaders() },
                body: JSON.stringify({
                    message:         msgText,
                    document:        documentContent,
                    title:           documentTitle,
                    document_type:   documentType,
                    model,
                    history,
                    conversation_id: conversationId,
                }),
                signal,
            });

            if (!response.ok) throw new Error(`Request failed (${response.status})`);

            await readDocSse(response, (eventName, data) => {
                if (eventName === 'session' && data.conversation_id) {
                    const cid = data.conversation_id;
                    setConversationId(cid);
                    // Update URL without reloading the page
                    if (!conversationId) {
                        navigate(`/doc-builder/${cid}`, { replace: true });
                    }
                }
                if (eventName === 'chat' && data.content) {
                    chatBuffer += data.content;
                    const snap = chatBuffer;
                    setMessages(prev => prev.map(m =>
                        m.id === assistId ? { ...m, content: snap } : m
                    ));
                }
                if (eventName === 'document' && data.content) {
                    docBuffer += data.content;
                    setDocumentContent(docBuffer);
                    if (!docStarted) {
                        docStarted = true;
                        setPanelOpen(true);
                        setActiveTab('preview');
                    }
                }
                if (eventName === 'done') {
                    // handled in finally
                }
                if (eventName === 'error' && data.message) {
                    setError(data.message);
                }
            }, signal);

        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return;
            const msg = err instanceof Error ? err.message : 'Something went wrong.';
            setError(msg);
            setMessages(prev => prev.map(m =>
                m.id === assistId ? { ...m, content: m.content || `⚠️ ${msg}`, isStreaming: false } : m
            ));
        } finally {
            setMessages(prev => prev.map(m =>
                m.id === assistId ? { ...m, isStreaming: false } : m
            ));
            setIsStreaming(false);
            abortRef.current = null;
        }
    }, [input, isStreaming, messages, documentContent, documentTitle, documentType, model]);

    const stopStreaming = useCallback(() => { abortRef.current?.abort(); }, []);

    // ── Export ─────────────────────────────────────────────────────────────

    const exportDocument = useCallback(async (format: 'pdf' | 'docx') => {
        if (!documentContent.trim()) return;
        setIsExporting(true);
        setExportError(null);
        try {
            const res = await fetch('/api/doc-builder/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ content: documentContent, title: documentTitle, format, document_type: documentType }),
            });
            const result: ExportResult = await res.json();
            if (!result.success || !result.url) throw new Error(result.error ?? 'Export failed');
            window.open(result.url, '_blank');
        } catch (err) {
            setExportError(err instanceof Error ? err.message : 'Export failed.');
        } finally {
            setIsExporting(false);
        }
    }, [documentContent, documentTitle, documentType]);

    const copyMarkdown = useCallback(async () => {
        if (!documentContent) return;
        await navigator.clipboard.writeText(documentContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [documentContent]);

    const clearAll = useCallback(() => {
        if (isStreaming) stopStreaming();
        setMessages([]);
        setDocumentContent('');
        setDocumentTitle('Untitled Document');
        setDocumentType('general');
        setConversationId(null);
        setPanelOpen(false);
        setError(null);
        setExportError(null);
        navigate('/doc-builder', { replace: true });
    }, [isStreaming, stopStreaming, navigate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    }, [sendMessage]);

    // Save title on blur if session exists
    const handleTitleBlur = useCallback(() => {
        if (!conversationId || !documentTitle.trim()) return;
        fetch(`/api/doc-builder/sessions/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ title: documentTitle }),
        }).catch(() => {});
    }, [conversationId, documentTitle]);

    const isWelcome = messages.length === 0 && !isLoadingSession;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    if (isLoadingSession) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="relative flex h-full overflow-hidden">

            {/* ── Chat column ──────────────────────────────────────────── */}
            <div
                className="relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
                style={{ width: panelOpen ? '42%' : '100%' }}
            >
                {/* Scrollable messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto overscroll-contain pb-48 pt-6 custom-scrollbar"
                >
                    <div className="mx-auto w-full max-w-2xl px-4">

                        {/* Welcome */}
                        {isWelcome && (
                            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-lg">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                        {firstName ? `Hey ${firstName}, let's write` : 'What should we write?'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Describe your document and I'll draft it for you
                                    </p>
                                </div>
                                <div className="grid w-full max-w-xl grid-cols-2 gap-2">
                                    {STARTER_PROMPTS.map(({ label, prompt }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => sendMessage(prompt)}
                                            className="rounded-xl border border-border bg-card px-4 py-3.5 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-accent hover:text-foreground"
                                        >
                                            <p className="font-medium text-foreground">{label}</p>
                                            <p className="text-xs mt-0.5 opacity-60 line-clamp-2">{prompt}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="space-y-6">
                            {messages.map(msg => (
                                <DocMessageBubble key={msg.id} message={msg} />
                            ))}
                        </div>

                        {/* If doc is streaming show a doc-ready hint */}
                        {documentContent && !panelOpen && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setPanelOpen(true)}
                                    className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <FileText className="h-4 w-4" />
                                    View document
                                    <PanelRight className="h-4 w-4 ml-auto" />
                                </button>
                            </div>
                        )}

                        <div className="h-1" />
                    </div>
                </div>

                {/* Scroll-to-bottom button */}
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

                {/* ── Chat input (pinned to bottom, same style as SpaChatInput) ── */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="mx-auto w-full max-w-2xl px-4 pb-5">
                        {/* Input container */}
                        <div className="rounded-2xl border border-border/60 bg-[#1c1c1c] shadow-lg">
                            <div className="flex items-end gap-3 px-4 py-3">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe the document you want…"
                                    className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 min-h-[24px] max-h-[160px]"
                                    rows={1}
                                    disabled={isStreaming}
                                />
                                {isStreaming ? (
                                    <button
                                        onClick={stopStreaming}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80"
                                    >
                                        <Square className="h-3.5 w-3.5 fill-current" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim()}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-30"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Bottom bar */}
                            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    {/* Model */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors">
                                                <Sparkles className="h-3 w-3 text-primary" />
                                                {MODELS[model]}
                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="top" className="w-44">
                                            {Object.entries(MODELS).map(([k, v]) => (
                                                <DropdownMenuItem key={k} onSelect={() => setModel(k)}
                                                    className={model === k ? 'text-primary font-medium' : ''}>
                                                    {v}
                                                    {model === k && <Check className="ml-auto h-3 w-3" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Doc type */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors">
                                                <FileText className="h-3 w-3" />
                                                {DOCUMENT_TYPES[documentType]}
                                                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="top" className="w-40">
                                            {Object.entries(DOCUMENT_TYPES).map(([k, v]) => (
                                                <DropdownMenuItem key={k} onSelect={() => setDocumentType(k)}
                                                    className={documentType === k ? 'text-primary font-medium' : ''}>
                                                    {v}
                                                    {documentType === k && <Check className="ml-auto h-3 w-3" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* View doc button when panel is closed */}
                                    {documentContent && !panelOpen && (
                                        <button
                                            onClick={() => setPanelOpen(true)}
                                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <PanelRight className="h-3 w-3" />
                                            View doc
                                        </button>
                                    )}
                                    {/* Reset */}
                                    <button
                                        onClick={clearAll}
                                        className="rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                                        title="New document"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="mt-2 text-center text-[11px] text-muted-foreground/40">
                            ↵ send · Shift+↵ newline
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Document panel (Claude-style, slides in) ─────────────── */}
            <div
                className={`flex flex-col overflow-hidden border-l border-border transition-all duration-300 ease-in-out ${
                    panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ width: panelOpen ? '58%' : '0%' }}
            >
                {/* Panel header */}
                <div className="flex shrink-0 items-center gap-2 border-b bg-background px-4 py-2.5">
                    {/* Title */}
                    <input
                        type="text"
                        value={documentTitle}
                        onChange={e => setDocumentTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40 truncate"
                        placeholder="Untitled Document"
                        maxLength={255}
                    />

                    {/* Word count */}
                    {documentContent && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                            {documentContent.trim().split(/\s+/).length.toLocaleString()} words
                        </span>
                    )}

                    {/* Streaming badge */}
                    {isStreaming && (
                        <span className="flex shrink-0 items-center gap-1 text-[11px] text-primary animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Writing
                        </span>
                    )}

                    {/* Copy */}
                    <button
                        onClick={copyMarkdown}
                        disabled={!documentContent}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors disabled:opacity-30"
                        title={copied ? 'Copied!' : 'Copy markdown'}
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    {/* Export */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="sm" className="h-7 gap-1.5 text-xs shrink-0"
                                disabled={!documentContent.trim() || isExporting}>
                                {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                                Export
                                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => exportDocument('pdf')}>Export as PDF</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => exportDocument('docx')}>Export as Word (.docx)</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={copyMarkdown}>Copy as Markdown</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Close panel */}
                    <button
                        onClick={() => setPanelOpen(false)}
                        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                        title="Collapse document panel"
                    >
                        <PanelRightClose className="h-3.5 w-3.5" />
                    </button>
                </div>

                {exportError && (
                    <div className="shrink-0 border-b border-destructive/20 bg-destructive/5 px-4 py-1.5 text-xs text-destructive">
                        {exportError}
                    </div>
                )}

                {/* Edit / Preview tabs */}
                <TabsPrimitive.Root
                    value={activeTab}
                    onValueChange={v => setActiveTab(v as 'edit' | 'preview')}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <TabsPrimitive.List className="flex shrink-0 items-center gap-0 border-b bg-muted/20 px-4">
                        {(['preview', 'edit'] as const).map(tab => (
                            <TabsPrimitive.Trigger
                                key={tab}
                                value={tab}
                                className="relative px-4 py-2 text-xs font-medium capitalize text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-[2px] data-[state=active]:after:rounded-full data-[state=active]:after:bg-primary"
                            >
                                {tab === 'edit' ? 'Markdown' : 'Preview'}
                            </TabsPrimitive.Trigger>
                        ))}
                    </TabsPrimitive.List>

                    <TabsPrimitive.Content value="preview" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
                        <DocumentPreview content={documentContent} isStreaming={isStreaming} />
                    </TabsPrimitive.Content>

                    <TabsPrimitive.Content value="edit" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
                        {documentContent ? (
                            <Editor
                                height="100%"
                                language="markdown"
                                value={documentContent}
                                onChange={v => setDocumentContent(v ?? '')}
                                theme="vs-dark"
                                options={{
                                    fontSize: 13,
                                    lineHeight: 1.75,
                                    wordWrap: 'on',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 20, bottom: 20 },
                                    renderLineHighlight: 'none',
                                    overviewRulerLanes: 0,
                                    lineNumbers: 'off',
                                    glyphMargin: false,
                                    lineDecorationsWidth: 24,
                                    smoothScrolling: true,
                                }}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-zinc-600 text-sm">
                                No content yet
                            </div>
                        )}
                    </TabsPrimitive.Content>
                </TabsPrimitive.Root>
            </div>
        </div>
    );
}

// ─── DocMessageBubble ─────────────────────────────────────────────────────────

function DocMessageBubble({ message }: { message: DocMessage }) {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#2a2a2a] px-4 py-2.5 text-sm text-foreground">
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]">
                <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                {message.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words
                        prose-p:my-1 prose-p:leading-relaxed
                        prose-headings:my-2
                        prose-li:my-0.5
                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                ) : message.isStreaming ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Thinking…</span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// ─── DocumentPreview ──────────────────────────────────────────────────────────

function DocumentPreview({ content, isStreaming }: { content: string; isStreaming: boolean }) {
    if (!content.trim() && !isStreaming) {
        return (
            <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-zinc-900/30">
                <div className="text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm text-muted-foreground">Document preview will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-zinc-100 dark:bg-zinc-900/40 custom-scrollbar">
            <div className="min-h-full py-8 px-6">
                {/* A4 page */}
                <article className="relative mx-auto max-w-[760px] min-h-[1040px] rounded border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl">

                    {/* Writing indicator */}
                    {isStreaming && (
                        <div className="absolute right-4 top-3 flex items-center gap-1.5 text-[10px] text-primary animate-pulse">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            Writing…
                        </div>
                    )}

                    {/* Document body */}
                    <div className="px-16 py-14">
                        <div className="prose prose-zinc dark:prose-invert max-w-none
                            prose-h1:text-[26px] prose-h1:font-bold prose-h1:tracking-tight prose-h1:leading-tight
                            prose-h1:pb-4 prose-h1:mb-6 prose-h1:border-b prose-h1:border-zinc-200 dark:prose-h1:border-zinc-800
                            prose-h2:text-[20px] prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
                            prose-h3:text-[16px] prose-h3:font-semibold prose-h3:mt-7 prose-h3:mb-3
                            prose-h4:text-[14px] prose-h4:font-semibold prose-h4:mt-5 prose-h4:mb-2
                            prose-p:text-[15px] prose-p:leading-[1.85] prose-p:my-4
                            prose-p:text-zinc-800 dark:prose-p:text-zinc-200
                            prose-li:text-[15px] prose-li:leading-[1.75]
                            prose-li:text-zinc-800 dark:prose-li:text-zinc-200 prose-li:my-1.5
                            prose-ul:my-4 prose-ol:my-4
                            prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
                            prose-blockquote:border-l-[3px] prose-blockquote:border-primary/50
                            prose-blockquote:pl-5 prose-blockquote:italic
                            prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400 prose-blockquote:my-6
                            prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800 prose-hr:my-8
                            prose-table:w-full prose-table:text-[14px] prose-table:border-collapse
                            prose-thead:border-b-2 prose-thead:border-zinc-300 dark:prose-thead:border-zinc-700
                            prose-th:px-4 prose-th:py-2.5 prose-th:font-semibold prose-th:text-left prose-th:bg-zinc-50 dark:prose-th:bg-zinc-900
                            prose-td:px-4 prose-td:py-2.5 prose-td:border-b prose-td:border-zinc-100 dark:prose-td:border-zinc-800
                            prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg
                            prose-pre:text-[13px] prose-pre:leading-relaxed prose-pre:my-6 prose-pre:overflow-x-auto
                            prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none
                            prose-code:bg-zinc-100 dark:prose-code:bg-zinc-900
                            prose-code:text-zinc-800 dark:prose-code:text-zinc-200
                            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypePrism]}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
