import { AlertCircle, Check, Copy, Globe, ImageIcon, Loader2, RefreshCcw, Search, Terminal, Zap } from 'lucide-react';
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

const TOOL_META: Record<string, { icon: React.ElementType; label: string }> = {
    web_search:       { icon: Search,   label: 'Web Search' },
    web_fetch:        { icon: Globe,    label: 'Web Fetch' },
    generate_image:   { icon: ImageIcon, label: 'Generating Image' },
    run_code:         { icon: Terminal, label: 'Running Code' },
    code_execution:   { icon: Terminal, label: 'Running Code' },
    code_interpreter: { icon: Terminal, label: 'Code Interpreter' },
};

function getToolMeta(name: string): { icon: React.ElementType; label: string } {
    return TOOL_META[name] ?? { icon: Zap, label: name.replace(/_/g, ' ') };
}

function UserMessage({ message }: { message: Message }) {
    const text = message.content_text || message.content || '';
    const hasAttachments = (message.attachments?.length ?? 0) > 0;

    return (
        <div className="flex justify-end gap-3 group">
            <div className="flex flex-col items-end gap-1 max-w-[75%]">
                <div className="rounded-2xl rounded-tr-sm bg-[#2f2f2f] px-4 py-2.5 text-sm leading-relaxed text-[#e8e8e4]">
                    {text}
                </div>
                {hasAttachments && (
                    <div className="flex flex-wrap gap-1.5 justify-end">
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

function ActivityIndicator({ activities }: { activities: StreamActivity[] }) {
    if (!activities.length) return null;

    const running   = activities.filter(a => a.status === 'started');
    const completed = activities.filter(a => a.status === 'completed');
    const failed    = activities.filter(a => a.status === 'failed');

    return (
        <div className="mt-3 space-y-1.5">
            {/* Running tools — prominent card */}
            {running.map((activity) => {
                const { icon: Icon, label } = getToolMeta(activity.tool_name);
                return (
                    <div
                        key={activity.tool_name}
                        className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs"
                    >
                        <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-primary/70" />
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
                        <span className="font-medium capitalize text-foreground/75">{label}</span>
                        {activity.message && (
                            <span className="ml-1 max-w-[260px] truncate text-muted-foreground/55">{activity.message}</span>
                        )}
                        <div className="ml-auto flex animate-pulse items-center gap-1">
                            <span className="h-1.5 w-10 rounded-full bg-muted-foreground/15" />
                            <span className="h-1.5 w-6 rounded-full bg-muted-foreground/10" />
                        </div>
                    </div>
                );
            })}

            {/* Failed tools */}
            {failed.map((activity) => {
                const { icon: Icon, label } = getToolMeta(activity.tool_name);
                return (
                    <div
                        key={activity.tool_name}
                        className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive"
                    >
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                        <span className="font-medium capitalize">{label} failed</span>
                        {activity.message && (
                            <span className="ml-1 truncate opacity-60">{activity.message}</span>
                        )}
                    </div>
                );
            })}

            {/* Completed tools — compact row of pills */}
            {completed.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {completed.map((activity) => {
                        const { icon: Icon, label } = getToolMeta(activity.tool_name);
                        return (
                            <div
                                key={activity.tool_name}
                                className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground/45"
                                title={activity.message ?? undefined}
                            >
                                <Check className="h-2.5 w-2.5 flex-shrink-0 text-emerald-500/60" />
                                <Icon className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />
                                <span className="capitalize">{label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
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
            <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-sm">
                    <Zap className="h-4 w-4 text-white" />
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
