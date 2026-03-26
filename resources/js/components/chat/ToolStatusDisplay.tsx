import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    AlertTriangle,
    Clock,
    Loader2,
    Zap
} from 'lucide-react';
import { ToolStatus } from '@/hooks/useToolStatus';
import { cn } from '@/lib/utils';

interface ToolStatusDisplayProps {
    tools: ToolStatus[];
    className?: string;
    compact?: boolean;
}

interface ToolStatusCardProps {
    tool: ToolStatus;
    compact?: boolean;
    getToolIcon: (toolName: string) => React.ComponentType<any>;
    getToolLabel: (toolName: string) => string;
}

const ToolStatusCard = memo(({
    tool,
    compact = false,
    getToolIcon,
    getToolLabel
}: ToolStatusCardProps) => {
    const statusConfig = useMemo(() => {
        const Icon = getToolIcon(tool.name);
        const label = getToolLabel(tool.name);
        const duration = tool.endTime && tool.startTime
            ? ((tool.endTime - tool.startTime) / 1000).toFixed(1)
            : null;

        switch (tool.status) {
            case 'executing':
                return {
                    bgClass: 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40',
                    borderClass: 'border-blue-200 dark:border-blue-800',
                    textClass: 'text-blue-700 dark:text-blue-300',
                    subtextClass: 'text-blue-600 dark:text-blue-400',
                    badgeVariant: 'secondary' as const,
                    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    icon: (
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
                            <Loader2 className="relative h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                    ),
                    statusIcon: <Clock className="h-3 w-3" />,
                    title: tool.message || `${label}...`,
                    subtitle: 'In Progress',
                    showProgress: true
                };
            case 'failed':
                return {
                    bgClass: 'bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/40 dark:to-orange-950/40',
                    borderClass: 'border-red-200 dark:border-red-800',
                    textClass: 'text-red-700 dark:text-red-300',
                    subtextClass: 'text-red-600 dark:text-red-400',
                    badgeVariant: 'destructive' as const,
                    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    icon: <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />,
                    statusIcon: <AlertTriangle className="h-3 w-3" />,
                    title: 'Tool Failed',
                    subtitle: tool.message || 'Execution failed',
                    showProgress: false
                };
            case 'completed':
                return {
                    bgClass: 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40',
                    borderClass: 'border-green-200 dark:border-green-800',
                    textClass: 'text-green-700 dark:text-green-300',
                    subtextClass: 'text-green-600 dark:text-green-400',
                    badgeVariant: 'secondary' as const,
                    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    icon: <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />,
                    statusIcon: <CheckCircle className="h-3 w-3" />,
                    title: `${label} Complete`,
                    subtitle: duration ? `Completed in ${duration}s` : 'Completed',
                    showProgress: false
                };
            default:
                return {
                    bgClass: 'bg-muted/50',
                    borderClass: 'border-border',
                    textClass: 'text-foreground',
                    subtextClass: 'text-muted-foreground',
                    badgeVariant: 'outline' as const,
                    badgeClass: '',
                    icon: <Icon className="h-4 w-4" />,
                    statusIcon: <Zap className="h-3 w-3" />,
                    title: label,
                    subtitle: 'Ready',
                    showProgress: false
                };
        }
    }, [tool, getToolIcon, getToolLabel]);

    if (compact) {
        return (
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200",
                statusConfig.bgClass,
                statusConfig.borderClass
            )}>
                <div className={statusConfig.textClass}>
                    {statusConfig.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-medium truncate", statusConfig.textClass)}>
                            {statusConfig.title}
                        </span>
                        <Badge
                            variant={statusConfig.badgeVariant}
                            className={cn("text-xs", statusConfig.badgeClass)}
                        >
                            <div className="flex items-center gap-1">
                                {statusConfig.statusIcon}
                                {tool.status}
                            </div>
                        </Badge>
                    </div>
                    {statusConfig.showProgress && tool.progress !== undefined && (
                        <Progress
                            value={tool.progress}
                            className="h-1 mt-1"
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <Card className={cn(
            "transition-all duration-200 hover:shadow-md",
            statusConfig.bgClass,
            statusConfig.borderClass
        )}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={statusConfig.textClass}>
                        {statusConfig.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-sm font-medium", statusConfig.textClass)}>
                                {statusConfig.title}
                            </span>
                            <Badge
                                variant={statusConfig.badgeVariant}
                                className={cn("text-xs", statusConfig.badgeClass)}
                            >
                                <div className="flex items-center gap-1">
                                    {statusConfig.statusIcon}
                                    {tool.status}
                                </div>
                            </Badge>
                        </div>

                        <p className={cn("text-xs", statusConfig.subtextClass)}>
                            {statusConfig.subtitle}
                        </p>

                        {statusConfig.showProgress && tool.progress !== undefined && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className={statusConfig.subtextClass}>Progress</span>
                                    <span className={statusConfig.subtextClass}>{tool.progress}%</span>
                                </div>
                                <Progress
                                    value={tool.progress}
                                    className="h-2"
                                />
                            </div>
                        )}

                        {tool.metadata && Object.keys(tool.metadata).length > 0 && (
                            <div className="pt-2 border-t border-border/50">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(tool.metadata).slice(0, 4).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className={cn("font-medium capitalize", statusConfig.subtextClass)}>
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className={statusConfig.subtextClass}>
                                                {typeof value === 'string' ? value : JSON.stringify(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ToolStatusCard.displayName = 'ToolStatusCard';

const ToolStatusDisplay = memo(({
    tools,
    className,
    compact = false
}: ToolStatusDisplayProps) => {
    const getToolIcon = (toolName: string) => {
        // This would normally come from the hook, but we'll define it here for the component
        const icons = {
            web_search: () => <Zap className="h-4 w-4" />,
            web_fetch: () => <Zap className="h-4 w-4" />,
            generate_image: () => <Zap className="h-4 w-4" />,
            default: () => <Zap className="h-4 w-4" />
        };
        return icons[toolName as keyof typeof icons] || icons.default;
    };

    const getToolLabel = (toolName: string) => {
        const labels = {
            web_search: 'Web Search',
            web_fetch: 'Web Fetch',
            generate_image: 'Image Generation',
        };
        return labels[toolName as keyof typeof labels] ||
               toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (tools.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-2", className)}>
            {tools.map((tool) => (
                <ToolStatusCard
                    key={tool.id}
                    tool={tool}
                    compact={compact}
                    getToolIcon={getToolIcon}
                    getToolLabel={getToolLabel}
                />
            ))}
        </div>
    );
});

ToolStatusDisplay.displayName = 'ToolStatusDisplay';

export default ToolStatusDisplay;
