import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Check, ChevronDown, Copy, Download, ExternalLink, FileText, Globe } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

type Segment =
    | { type: 'markdown'; content: string }
    | { type: 'sources'; payload: any[] }
    | { type: 'attachments'; payload: any[] }
    | { type: 'suggestions'; payload: string[] };

/**
 * Strip all kwati-tool/sources/attachments fenced blocks (complete or partial)
 * from the raw markdown string before parsing. Tool status is shown via SSE
 * activities during streaming, so we never render these blocks inline.
 */
function stripKwatiBlocks(markdown: string): string {
    // Remove complete kwati-tool blocks (tool status shown via SSE, not inline)
    let result = markdown.replace(/```kwati-tool[\s\S]*?```/g, '');
    // Remove any partial/incomplete kwati-tool block
    result = result.replace(/```kwati-tool[\s\S]*$/g, '');
    return result;
}

function parseSegments(markdown: string): Segment[] {
    const pattern = /```kwati-(sources|attachments|suggestions)\n([\s\S]*?)```/g;
    const segments: Segment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(markdown)) !== null) {
        const [fullMatch, kind, json] = match;
        const start = match.index;

        if (start > lastIndex) {
            const text = markdown.slice(lastIndex, start).trim();
            if (text) segments.push({ type: 'markdown', content: text });
        }

        try {
            const payload = JSON.parse(json);
            segments.push({ type: kind as 'sources' | 'attachments' | 'suggestions', payload });
        } catch {
            // Malformed JSON — treat as plain markdown
            segments.push({ type: 'markdown', content: fullMatch });
        }

        lastIndex = start + fullMatch.length;
    }

    const remaining = markdown.slice(lastIndex).trim();
    if (remaining) segments.push({ type: 'markdown', content: remaining });

    return segments;
}

// ~20 lines × 19.5px line-height + 2×16px padding
const COLLAPSED_HEIGHT = 20 * 19.5 + 32;

function CodeBlock({ language, value, codeTagProps }: { language: string; value: string; codeTagProps?: any }) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const lineCount = value.split('\n').length;
    const isLong = lineCount > 20;

    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative my-3 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between bg-[#2a2d2e] px-4 py-2">
                <button
                    onClick={() => isLong && setExpanded(e => !e)}
                    className={`flex items-center gap-1.5 text-xs font-mono text-muted-foreground/70 select-none transition-colors ${isLong ? 'hover:text-foreground cursor-pointer' : 'cursor-default'}`}
                    aria-label={expanded ? 'Collapse code' : 'Expand code'}
                >
                    {isLong && (
                        <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                        />
                    )}
                    {language}
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-green-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div
                style={isLong && !expanded ? { maxHeight: COLLAPSED_HEIGHT, overflow: 'hidden' } : undefined}
                className="relative"
            >
                <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        border: 'none',
                        padding: '1rem',
                        fontSize: '13px',
                        overflowX: 'auto',
                        background: '#1d1f21',
                    }}
                    codeTagProps={codeTagProps}
                >
                    {value}
                </SyntaxHighlighter>
                {isLong && !expanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1d1f21] to-transparent pointer-events-none" />
                )}
            </div>
            {isLong && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="w-full bg-[#2a2d2e] py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-[#313435] transition-colors flex items-center justify-center gap-1"
                >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    {expanded ? 'Show less' : `Show all ${lineCount} lines`}
                </button>
            )}
        </div>
    );
}

function MarkdownBody({ content }: { content: string }) {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:scroll-mt-24 prose-headings:leading-snug prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:leading-relaxed prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:rounded-xl prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-hr:border-border/40 prose-img:rounded-xl prose-strong:text-foreground prose-strong:font-semibold">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="not-prose my-4 overflow-x-auto rounded-xl border border-border/40">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-muted/40">{children}</thead>,
                    th: ({ children }) => (
                        <th className="border-b border-border/40 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-border/20 px-4 py-2.5 text-sm [tbody_tr:last-child_&]:border-0">
                            {children}
                        </td>
                    ),
                    tr: ({ children }) => <tr className="transition-colors hover:bg-muted/20">{children}</tr>,
                    ul: ({ children }) => (
                        <ul className="not-prose my-3 space-y-1.5 list-none pl-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="not-prose my-3 space-y-1.5 pl-5 list-decimal [&>li::marker]:text-muted-foreground/60 [&>li::marker]:font-medium">{children}</ol>
                    ),
                    li: ({ children, ordered }: any) => (
                        <li className="flex items-start gap-2.5 text-sm leading-relaxed">
                            {!ordered && (
                                <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                            )}
                            <span className="flex-1 min-w-0 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</span>
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="not-prose my-3 flex gap-3 rounded-r-xl border-l-2 border-primary/50 bg-primary/5 px-4 py-3 text-sm text-muted-foreground italic">
                            <span className="flex-1">{children}</span>
                        </blockquote>
                    ),
                    code: ({ className, children, ...props }: any) => {
                        const language = className?.match(/language-([\w-]+)/)?.[1];
                        const value = String(children).replace(/\n$/, '');

                        if (language) {
                            return <CodeBlock language={language} value={value} codeTagProps={props} />;
                        }

                        return (
                            <code className="rounded bg-muted/60 px-1 py-0.5 text-[0.85em] font-mono text-primary" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

function SourcesBlock({ payload }: { payload: any[] }) {
    return (
        <div className="space-y-2 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5" />
                Sources
            </div>
            <div className="grid gap-2">
                {payload.map((source, index) => (
                    <a
                        className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-accent/30"
                        href={source.url}
                        key={`${source.url}-${index}`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <div className="min-w-0">
                            <p className="font-medium truncate">{source.title || source.url || 'Source'}</p>
                            {source.snippet ? <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{source.snippet}</p> : null}
                        </div>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    </a>
                ))}
            </div>
        </div>
    );
}

function AttachmentsBlock({ payload }: { payload: any[] }) {
    const images = payload.filter((a) => a.kind === 'image' || a.mime_type?.startsWith('image/'));
    const files  = payload.filter((a) => a.kind !== 'image' && !a.mime_type?.startsWith('image/'));

    return (
        <div className="mt-3 space-y-3">
            {/* Images — inline preview */}
            {images.map((attachment) => (
                <div key={attachment.id || attachment.url} className="group/img relative w-fit max-w-full overflow-hidden rounded-2xl border border-border/30">
                    <img
                        src={attachment.url}
                        alt={attachment.name || 'Generated image'}
                        className="block max-h-[480px] max-w-full rounded-2xl object-contain"
                        loading="lazy"
                    />
                    {attachment.url && (
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/60 to-transparent px-3 py-2.5 opacity-0 transition-opacity group-hover/img:opacity-100">
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open
                            </a>
                            <a
                                href={attachment.url}
                                download
                                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                            >
                                <Download className="h-3 w-3" />
                                Save
                            </a>
                        </div>
                    )}
                </div>
            ))}

            {/* Files — Claude-style document card */}
            {files.length > 0 && (
                <div className="flex flex-col gap-2">
                    {files.map((attachment) => {
                        const name = attachment.name || 'Document';
                        const ext = name.match(/\.([a-z0-9]+)$/i)?.[1]?.toUpperCase() ?? 'FILE';
                        return (
                            <div
                                key={attachment.id || attachment.url}
                                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 max-w-sm"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">{name}</p>
                                    <p className="text-xs text-muted-foreground">{ext}</p>
                                </div>
                                {attachment.url && (
                                    <a
                                        href={attachment.url}
                                        download
                                        title="Download"
                                        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function SuggestionsBlock({ payload, isLast }: { payload: string[]; isLast: boolean }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const hide = () => setVisible(false);
        document.addEventListener('kwati:message-sent', hide);
        return () => document.removeEventListener('kwati:message-sent', hide);
    }, []);

    if (!payload.length || !visible || !isLast) return null;

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {payload.map((suggestion) => (
                <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                        document.dispatchEvent(
                            new CustomEvent('kwati:suggestion', { detail: suggestion })
                        )
                    }
                    className="rounded-xl border border-border/60 bg-card px-3.5 py-2 text-left text-[0.8rem] text-muted-foreground transition-colors hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/5 hover:text-foreground"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
}

export default function MarkdownRenderer({ markdown, isLast = false }: { markdown: string; isLast?: boolean }) {
    const cleaned = stripKwatiBlocks(markdown);
    const segments = parseSegments(cleaned);

    return (
        <div className="space-y-3">
            {segments.map((segment, index) => {
                if (segment.type === 'markdown') {
                    return <MarkdownBody content={segment.content} key={index} />;
                }
                if (segment.type === 'sources') {
                    return <SourcesBlock key={index} payload={segment.payload} />;
                }
                if (segment.type === 'suggestions') {
                    return <SuggestionsBlock key={index} payload={segment.payload} isLast={isLast} />;
                }
                return <AttachmentsBlock key={index} payload={segment.payload} />;
            })}
        </div>
    );
}
