import { AlertCircle, Check, Copy, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/spa/components/MarkdownRenderer';
import ToolTimeline from '@/spa/components/ToolTimeline';

// ─── user message ─────────────────────────────────────────────────────────────

function UserMessage({ message }: { message: Message }) {
    const text = message.content_text || message.content || '';
    const hasAttachments = (message.attachments?.length ?? 0) > 0;

    return (
        <div className="flex justify-end gap-3 group">
            <div className="flex min-w-0 max-w-[75%] flex-col items-end gap-1">
                <div className="min-w-0 rounded-2xl rounded-tr-sm bg-[#2f2f2f] px-4 py-2.5 text-sm leading-relaxed text-[#e8e8e4] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {text}
                </div>
                {hasAttachments && (
                    <div className="flex flex-wrap justify-end gap-1.5">
                        {message.attachments!.map((att: any) => (
                            <span
                                key={att.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-border/40 bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                            >
                                {att.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── thinking skeleton ────────────────────────────────────────────────────────

function ThinkingSkeleton() {
    return (
        <div className="animate-pulse space-y-2.5 py-1">
            <div className="h-2.5 w-3/4 rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-full rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/15" />
        </div>
    );
}

// ─── assistant message ────────────────────────────────────────────────────────

function AssistantMessage({
    message,
    onRegenerate,
    isLast,
}: {
    message: Message;
    onRegenerate?: (id: string) => void;
    isLast?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const content     = message.content_markdown || message.content || '';
    const isStreaming = !!message.isStreaming;
    const isFailed    = message.status === 'failed';
    const isEmpty     = !content.trim();
    const toolRuns    = message.tool_runs ?? [];
    const attachments = message.attachments ?? [];

    const copy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex gap-3 group">
            {/* avatar */}
            <div className="mt-1 flex-shrink-0">
                <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 select-none opacity-80" draggable={false} />
            </div>

            <div className="min-w-0 max-w-full flex-1 space-y-1 overflow-hidden">

                {/* tool activity — above content, subtle */}
                <ToolTimeline toolRuns={toolRuns} isStreaming={isStreaming} />

                {/* message body */}
                <div className="min-w-0 max-w-full overflow-hidden text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:break-word]">
                    {isFailed ? (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {message.error_message || 'Something went wrong. Please try again.'}
                        </div>
                    ) : isStreaming && isEmpty ? (
                        <ThinkingSkeleton />
                    ) : (
                        <MarkdownRenderer markdown={content} isLast={isLast} attachments={attachments} />
                    )}
                </div>

                {/* action row */}
                {!isStreaming && !isFailed && content && (
                    <div className="flex items-center gap-0.5 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            onClick={copy}
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Copy"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                        {onRegenerate && message.id && (
                            <Button
                                onClick={() => onRegenerate(message.id)}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Regenerate"
                            >
                                <RefreshCcw className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── export ───────────────────────────────────────────────────────────────────

export default function ChatMessageRenderer({
    message,
    onRegenerate,
    isLast,
}: {
    message: Message;
    onRegenerate?: (messageId: string) => void;
    isLast?: boolean;
}) {
    if (message.role === 'user') return <UserMessage message={message} />;
    return <AssistantMessage message={message} onRegenerate={onRegenerate} isLast={isLast} />;
}
