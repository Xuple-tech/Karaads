type WidgetToolRun = {
    id: string;
    tool_name: string;
    status: 'started' | 'completed' | 'failed';
    summary?: string | null;
    arguments?: Record<string, unknown> | null;
    result?: unknown;
    error_message?: string | null;
};

function getLabel(name: string): string {
    return name
        .replace(/^widget_[a-z0-9]+_/i, '')
        .replace(/^mcp_[a-z0-9]+_/i, '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function WidgetToolTimeline({ toolRuns }: { toolRuns: WidgetToolRun[] }) {
    if (!toolRuns.length) {
        return null;
    }

    return (
        <div className="kwati-tool-timeline" aria-live="polite">
            {toolRuns.map((toolRun) => {
                const detail = toolRun.error_message || toolRun.summary || null;

                return (
                    <div key={toolRun.id} className={`kwati-tool-run is-${toolRun.status}`}>
                        <span className="kwati-tool-icon" aria-hidden="true">
                            {toolRun.status === 'started' ? '◌' : toolRun.status === 'failed' ? '!' : '✓'}
                        </span>
                        <div className="kwati-tool-copy">
                            <div className="kwati-tool-title">
                                {toolRun.status === 'started' ? 'Using tool' : toolRun.status === 'failed' ? 'Tool failed' : 'Tool finished'}
                            </div>
                            <div className="kwati-tool-name">{getLabel(toolRun.tool_name)}</div>
                            {detail ? <div className="kwati-tool-detail">{detail}</div> : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
