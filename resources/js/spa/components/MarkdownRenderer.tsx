import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ExternalLink, FileText, Globe, ImageIcon, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'katex/dist/katex.min.css';

type Segment =
    | { type: 'markdown'; content: string }
    | { type: 'tool'; payload: any }
    | { type: 'sources'; payload: any[] }
    | { type: 'attachments'; payload: any[] };

function parseSegments(markdown: string): Segment[] {
    const pattern = /```kwati-(tool|sources|attachments)\n([\s\S]*?)```/g;
    const segments: Segment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(markdown)) !== null) {
        const [fullMatch, kind, json] = match;
        const start = match.index;

        if (start > lastIndex) {
            segments.push({ type: 'markdown', content: markdown.slice(lastIndex, start).trim() });
        }

        try {
            const payload = JSON.parse(json);
            segments.push({ type: kind as Segment['type'], payload } as Segment);
        } catch {
            segments.push({ type: 'markdown', content: fullMatch });
        }

        lastIndex = start + fullMatch.length;
    }

    if (lastIndex < markdown.length) {
        segments.push({ type: 'markdown', content: markdown.slice(lastIndex).trim() });
    }

    return segments.filter((segment) => {
        if (segment.type !== 'markdown') {
            return true;
        }

        return segment.content.trim().length > 0;
    });
}

function MarkdownBody({ content }: { content: string }) {
    return (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-pre:rounded-xl prose-table:w-full">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}

function ToolBlock({ payload }: { payload: any }) {
    return (
        <Card className="border-border/60 bg-background/70">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wrench className="h-4 w-4 text-primary" />
                    {payload.title || payload.name || 'Tool'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <Badge variant="secondary" className="capitalize">{payload.status || 'completed'}</Badge>
                {payload.summary ? <p className="text-muted-foreground">{payload.summary}</p> : null}
                {payload.error ? <p className="text-destructive">{payload.error}</p> : null}
            </CardContent>
        </Card>
    );
}

function SourcesBlock({ payload }: { payload: any[] }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-primary" />
                Sources
            </div>
            <div className="grid gap-3">
                {payload.map((source, index) => (
                    <a
                        className="rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:border-primary/40 hover:bg-accent/30"
                        href={source.url}
                        key={`${source.url}-${index}`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-medium">{source.title || source.url || 'Source'}</p>
                                {source.snippet ? <p className="mt-1 text-sm text-muted-foreground">{source.snippet}</p> : null}
                            </div>
                            <ExternalLink className="mt-1 h-4 w-4 text-muted-foreground" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function AttachmentsBlock({ payload }: { payload: any[] }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {payload.map((attachment) => (
                <Card className="border-border/60 bg-background/70" key={attachment.id || attachment.url || attachment.name}>
                    <CardContent className="flex items-center gap-3 p-4">
                        {attachment.kind === 'image' ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{attachment.name || 'Attachment'}</p>
                            {attachment.mime_type ? <p className="text-sm text-muted-foreground">{attachment.mime_type}</p> : null}
                        </div>
                        {attachment.url ? (
                            <a className="text-sm font-medium text-primary" href={attachment.url} rel="noreferrer" target="_blank">
                                Open
                            </a>
                        ) : null}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function MarkdownRenderer({ markdown }: { markdown: string }) {
    const segments = parseSegments(markdown);

    return (
        <div className="space-y-4">
            {segments.map((segment, index) => {
                if (segment.type === 'markdown') {
                    return <MarkdownBody content={segment.content} key={index} />;
                }

                if (segment.type === 'tool') {
                    return <ToolBlock key={index} payload={segment.payload} />;
                }

                if (segment.type === 'sources') {
                    return <SourcesBlock key={index} payload={segment.payload} />;
                }

                return <AttachmentsBlock key={index} payload={segment.payload} />;
            })}
        </div>
    );
}
