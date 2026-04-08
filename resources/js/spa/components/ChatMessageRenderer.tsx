import { AlertCircle, Check, Copy, RefreshCcw, Zap } from 'lucide-react';
import { useState } from 'react';

import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from '@/spa/components/MarkdownRenderer';
import ToolTimeline from '@/spa/components/ToolTimeline';

function UserMessage({ message }: { message: Message }) {
    const text = message.content_text || message.content || '';
    const hasAttachments = (message.attachments?.length ?? 0) > 0;

    return (
        <div className="flex justify-end gap-3 group">
            <div className="flex max-w-[75%] flex-col items-end gap-1">
                <div className="rounded-2xl rounded-tr-sm bg-[#2f2f2f] px-4 py-2.5 text-sm leading-relaxed text-[#e8e8e4]">
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

function ThinkingSkeleton() {
    return (
        <div className="animate-pulse space-y-2.5 py-1">
            <div className="h-2.5 w-3/4 rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-full rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/15" />
        </div>
    );
}

function AssistantMessage({
    message,
    onRegenerate,
}: {
    message: Message;
    onRegenerate?: (id: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const content = message.content_markdown || message.content || '';
    const isStreaming = !!message.isStreaming;
    const isFailed = message.status === 'failed';
    const isEmpty = !content.trim();
    const toolRuns = message.tool_runs ?? [];

    const copy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex gap-3 group">
            <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-sm">
                    <Zap className="h-4 w-4 text-white" />
                </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm leading-relaxed">
                    {isFailed ? (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {message.error_message || 'Something went wrong. Please try again.'}
                        </div>
                    ) : isStreaming && isEmpty ? (
                        <ThinkingSkeleton />
                    ) : (
                        <MarkdownRenderer markdown={content} />
                    )}
                </div>

                <ToolTimeline toolRuns={toolRuns} isStreaming={isStreaming} />

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

export default function ChatMessageRenderer({
    message,
    onRegenerate,
}: {
    message: Message;
    onRegenerate?: (messageId: string) => void;
}) {
    if (message.role === 'user') {
        return <UserMessage message={message} />;
    }

    return (
        <AssistantMessage
            message={message}
            onRegenerate={onRegenerate}
        />
    );
}
