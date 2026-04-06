import { Bot, Check, Copy, RefreshCcw, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/spa/components/MarkdownRenderer';

export type StreamActivity = {
    tool_name: string;
    status: 'started' | 'completed' | 'failed';
    message?: string | null;
};

function UserMessage({ message }: { message: Message }) {
    const text = message.content_text || message.content || '';
    const hasAttachments = (message.attachments?.length ?? 0) > 0;

    return (
        <div className="flex justify-end gap-3 group">
            <div className="flex flex-col items-end gap-1 max-w-[70%]">
                <div className="rounded-2xl rounded-tr-md bg-primary/90 px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
                    {text}
                </div>
                {hasAttachments && (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                        {message.attachments!.map((att: any) => (
                            <span
                                key={att.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
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

function ActivityIndicator({ activities }: { activities: StreamActivity[] }) {
    if (activities.length === 0) return null;

    return (
        <div className="mt-2 space-y-1">
            {activities.map((activity) => {
                const isFailed = activity.status === 'failed';
                const isCompleted = activity.status === 'completed';
                const isRunning = activity.status === 'started';

                return (
                    <div
                        key={activity.tool_name}
                        className={cn(
                            'flex items-center gap-2 text-xs',
                            isFailed ? 'text-destructive' : 'text-muted-foreground/70'
                        )}
                    >
                        {isFailed && <AlertCircle className="h-3 w-3 flex-shrink-0 text-destructive" />}
                        {isCompleted && <Check className="h-3 w-3 flex-shrink-0 text-muted-foreground/50" />}
                        {isRunning && (
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60 animate-pulse" />
                        )}
                        <span className="capitalize">{activity.tool_name.replace(/_/g, ' ')}</span>
                        {isRunning && (
                            <div className="flex items-center gap-1 animate-pulse">
                                <span className="h-1.5 w-8 rounded-full bg-muted-foreground/20" />
                                <span className="h-1.5 w-5 rounded-full bg-muted-foreground/15" />
                            </div>
                        )}
                        {!isRunning && activity.message && (
                            <span className="truncate opacity-60">{activity.message}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ThinkingSkeleton() {
    return (
        <div className="space-y-2.5 py-1 animate-pulse">
            <div className="h-2.5 w-3/4 rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-full rounded-full bg-muted-foreground/15" />
            <div className="h-2.5 w-1/2 rounded-full bg-muted-foreground/15" />
        </div>
    );
}

function AssistantMessage({
    message,
    activities,
    onRegenerate,
}: {
    message: Message;
    activities?: StreamActivity[];
    onRegenerate?: (id: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const content = message.content_markdown || message.content || '';
    const isStreaming = !!message.isStreaming;
    const isFailed = message.status === 'failed';
    const isEmpty = !content.trim();

    const copy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="flex gap-3 group">
            {/* Avatar */}
            <div className="mt-1 flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                {/* Body */}
                <div className="text-sm leading-relaxed">
                    {isFailed ? (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {message.error_message || 'Something went wrong. Please try again.'}
                        </div>
                    ) : isStreaming && isEmpty ? (
                        <ThinkingSkeleton />
                    ) : (
                        <MarkdownRenderer markdown={content} />
                    )}
                </div>

                {/* Inline activity during streaming */}
                {isStreaming && activities && activities.length > 0 && (
                    <ActivityIndicator activities={activities} />
                )}

                {/* Actions — visible on hover when not streaming */}
                {!isStreaming && !isFailed && content && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
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
    activities,
    onRegenerate,
}: {
    message: Message;
    activities?: StreamActivity[];
    onRegenerate?: (messageId: string) => void;
}) {
    if (message.role === 'user') {
        return <UserMessage message={message} />;
    }

    return (
        <AssistantMessage
            message={message}
            activities={activities}
            onRegenerate={onRegenerate}
        />
    );
}
