import { AlertCircle, Check, ChevronDown, ChevronRight, Globe, ImageIcon, Loader2, Search, Terminal, Zap } from 'lucide-react';
import { useState } from 'react';

import type { ChatToolRun } from '@/types/chat';

const TOOL_META: Record<string, { icon: React.ElementType; label: string }> = {
    web_search:       { icon: Search,    label: 'Searched the web' },
    web_fetch:        { icon: Globe,     label: 'Fetched a page' },
    generate_image:   { icon: ImageIcon, label: 'Generated image' },
    run_code:         { icon: Terminal,  label: 'Ran code' },
    code_execution:   { icon: Terminal,  label: 'Ran code' },
    code_interpreter: { icon: Terminal,  label: 'Code interpreter' },
};

function getToolMeta(name: string): { icon: React.ElementType; label: string } {
    return TOOL_META[name] ?? { icon: Zap, label: name.replace(/_/g, ' ') };
}

function ToolRow({ toolRun, index }: { toolRun: ChatToolRun; index: number }) {
    const [open, setOpen] = useState(false);
    const { icon: Icon, label } = getToolMeta(toolRun.tool_name);
    const isRunning = toolRun.status === 'started';
    const isFailed  = toolRun.status === 'failed';
    const detail    = toolRun.summary || toolRun.error_message || null;

    return (
        <div>
            <button
                type="button"
                onClick={() => detail && setOpen((v) => !v)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                    detail ? 'cursor-pointer hover:bg-white/[0.04]' : 'cursor-default'
                }`}
            >
                {/* status icon */}
                <span className="shrink-0">
                    {isFailed ? (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8b5cf6]/70" />
                    ) : (
                        <Check className="h-3.5 w-3.5 text-[#8b5cf6]/60" />
                    )}
                </span>

                {/* tool icon */}
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />

                {/* label */}
                <span className={`flex-1 ${isFailed ? 'text-destructive' : 'text-muted-foreground/70'}`}>
                    {isRunning ? `${label}…` : label}
                </span>

                {/* expand chevron */}
                {detail && (
                    <span className="text-muted-foreground/30">
                        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </span>
                )}
            </button>

            {open && detail && (
                <p className="ml-[52px] mt-0.5 rounded-md bg-white/[0.03] px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground/60">
                    {detail}
                </p>
            )}
        </div>
    );
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
        <div className="mt-2 space-y-px">
            {toolRuns.map((toolRun, index) => (
                <ToolRow key={toolRun.id} toolRun={toolRun} index={index} />
            ))}
        </div>
    );
}
