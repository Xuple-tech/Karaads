import { Bot, Check, Copy, RefreshCcw, Wrench, AlertCircle, Loader2 } from 'lucide-react';
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
            <div className="flex flex-col items-end gap-1 max-w-[78%]">
                <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
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
        <div className="mt-3 space-y-1.5">
            {activities.map((activity) => {
                const isFailed = activity.status === 'failed';
                const isCompleted = activity.status === 'completed';
                const isRunning = activity.status === 'started';

                return (
                    <div
                        key={activity.tool_name}
                        className={cn(
                            'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all',
                            isFailed
                                ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                : isCompleted
                                ? 'border-border/30 bg-muted/30 text-muted-foreground'
                                : 'border-primary/20 bg-primary/5 text-primary'
                        )}
                    >
                        {isRunning && <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />}
                        {isCompleted && <Wrench className="h-3 w-3 flex-shrink-0" />}
                        {isFailed && <AlertCircle className="h-3 w-3 flex-shrink-0" />}
                        <span className="font-medium capitalize">{activity.tool_name.replace(/_/g, ' ')}</span>
                        {activity.message && (
                            <span className="truncate text-muted-foreground">{activity.message}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ThinkingDots() {
    return (
        <div className="flex items-center gap-1 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
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
            <div className="flex-shrink-0 mt-0.5">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
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
                        <ThinkingDots />
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
