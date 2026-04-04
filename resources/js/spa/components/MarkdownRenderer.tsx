import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import { Download, ExternalLink, FileText, Globe, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import 'katex/dist/katex.min.css';
import 'prismjs/themes/prism-tomorrow.css';

type Segment =
    | { type: 'markdown'; content: string }
    | { type: 'sources'; payload: any[] }
    | { type: 'attachments'; payload: any[] };

/**
 * Strip all kwati-tool/sources/attachments fenced blocks (complete or partial)
 * from the raw markdown string before parsing. Tool status is shown via SSE
 * activities during streaming, so we never render these blocks inline.
 */
function stripKwatiBlocks(markdown: string): string {
    // Remove complete blocks
    let result = markdown.replace(/```kwati-tool[\s\S]*?```/g, '');
    // Remove any partial/incomplete block that hasn't received its closing ```
    result = result.replace(/```kwati-tool[\s\S]*$/g, '');
    return result;
}

function parseSegments(markdown: string): Segment[] {
    const pattern = /```kwati-(sources|attachments)\n([\s\S]*?)```/g;
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
            segments.push({ type: kind as 'sources' | 'attachments', payload });
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

function MarkdownBody({ content }: { content: string }) {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:rounded-xl prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-table:w-full prose-th:text-left prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground prose-img:rounded-xl prose-hr:border-border/40">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, [rehypePrism, { ignoreMissing: true }]]}
                components={{
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                            {children}
                        </a>
                    ),
                    pre: ({ children }) => (
                        <pre className="rounded-xl border border-border/40 bg-[#1d1f21] text-[13px] overflow-x-auto my-3">
                            {children}
                        </pre>
                    ),
                    code: ({ className, children, ...props }: any) => {
                        const isBlock = !!className;
                        if (isBlock) {
                            return <code className={className} {...props}>{children}</code>;
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
    const extensionFor = (attachment: any) => {
        const name = attachment.name || '';
        const match = name.match(/\.([a-z0-9]+)$/i);

        if (match) return match[1].toUpperCase();
        if (attachment.mime_type === 'application/pdf') return 'PDF';
        if (attachment.mime_type?.includes('wordprocessingml')) return 'DOCX';

        return attachment.kind === 'image' ? 'IMAGE' : 'FILE';
    };

    return (
        <div className="grid gap-3 md:grid-cols-2 mt-4">
            {payload.map((attachment) => (
                <Card className="overflow-hidden border-border/60 bg-background/80 shadow-sm" key={attachment.id || attachment.url || attachment.name}>
                    <CardContent className="flex items-start gap-3 p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            {attachment.kind === 'image'
                                ? <ImageIcon className="h-4 w-4" />
                                : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {extensionFor(attachment)}
                                </span>
                                {attachment.size ? (
                                    <span className="text-[11px] text-muted-foreground">
                                        {(attachment.size / 1024).toFixed(1)} KB
                                    </span>
                                ) : null}
                            </div>
                            <div>
                                <p className="truncate text-sm font-semibold text-foreground">{attachment.name || 'Attachment'}</p>
                                {attachment.mime_type ? <p className="truncate text-xs text-muted-foreground">{attachment.mime_type}</p> : null}
                            </div>
                            {attachment.url ? (
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <a className="inline-flex items-center gap-1 text-primary hover:underline" href={attachment.url} rel="noreferrer" target="_blank">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Open
                                    </a>
                                    <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" download href={attachment.url}>
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function MarkdownRenderer({ markdown }: { markdown: string }) {
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
                return <AttachmentsBlock key={index} payload={segment.payload} />;
            })}
        </div>
    );
}
