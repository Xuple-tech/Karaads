import { AlertCircle, Check, Globe, ImageIcon, Loader2, Search, Terminal, Zap } from 'lucide-react';

import type { ChatToolRun } from '@/types/chat';

const TOOL_META: Record<string, { icon: React.ElementType; label: string }> = {
    web_search: { icon: Search, label: 'Web Search' },
    web_fetch: { icon: Globe, label: 'Web Fetch' },
    generate_image: { icon: ImageIcon, label: 'Generating Image' },
    run_code: { icon: Terminal, label: 'Running Code' },
    code_execution: { icon: Terminal, label: 'Running Code' },
    code_interpreter: { icon: Terminal, label: 'Code Interpreter' },
};

function getToolMeta(name: string): { icon: React.ElementType; label: string } {
    return TOOL_META[name] ?? { icon: Zap, label: name.replace(/_/g, ' ') };
}

export default function ToolTimeline({
    toolRuns,
    isStreaming,
}: {
    toolRuns: ChatToolRun[];
    isStreaming: boolean;
}) {
    if (!toolRuns.length) return null;

    return (
        <div className="mt-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Tool activity
            </div>
            <div className="space-y-2">
                {toolRuns.map((toolRun, index) => {
                    const { icon: Icon, label } = getToolMeta(toolRun.tool_name);
                    const isRunning = toolRun.status === 'started';
                    const isFailed = toolRun.status === 'failed';
                    const detail = toolRun.summary || toolRun.error_message || null;

                    return (
                        <div
                            key={toolRun.id}
                            className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-xs ${
                                isFailed
                                    ? 'border-destructive/20 bg-destructive/5 text-destructive'
                                    : isRunning
                                      ? 'border-white/[0.08] bg-white/[0.04] text-foreground/80'
                                      : 'border-white/[0.06] bg-white/[0.03] text-muted-foreground/80'
                            }`}
                        >
                            <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground/50">{index + 1}</span>
                                {isFailed ? (
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                ) : isRunning ? (
                                    <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-primary/70" />
                                ) : (
                                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" />
                                )}
                            </div>
                            <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground/85">{label}</span>
                                    <span className="rounded-full border border-border/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/60">
                                        {toolRun.status}
                                    </span>
                                </div>
                                {detail && (
                                    <p className="mt-1 line-clamp-2 text-muted-foreground/70">
                                        {detail}
                                    </p>
                                )}
                                {isRunning && isStreaming && !detail && (
                                    <div className="mt-1.5 flex animate-pulse items-center gap-1">
                                        <span className="h-1.5 w-10 rounded-full bg-muted-foreground/15" />
                                        <span className="h-1.5 w-6 rounded-full bg-muted-foreground/10" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
