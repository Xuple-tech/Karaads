import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Search,
    Globe,
    ImageIcon,
    Zap,
    FileText,
    Calculator,
    Code,
    Database,
    CheckCircle,
    AlertTriangle,
    Clock,
    Loader2
} from 'lucide-react';

export interface ToolStatus {
    id: string;
    name: string;
    status: 'idle' | 'executing' | 'completed' | 'failed';
    message?: string;
    progress?: number;
    startTime?: number;
    endTime?: number;
    metadata?: Record<string, any>;
}

export interface ToolStatusUpdate {
    tool_name: string;
    tool_status: 'executing_tool' | 'tool_completed' | 'tool_failed';
    tool_executing_message?: string;
    progress?: number;
    metadata?: Record<string, any>;
}

const TOOL_ICONS = {
    web_search: Search,
    web_fetch: Globe,
    generate_image: ImageIcon,
    edit_image: ImageIcon,
    file_upload: FileText,
    calculate: Calculator,
    code_execution: Code,
    database_query: Database,
    default: Zap,
} as const;

const TOOL_LABELS = {
    web_search: 'Web Search',
    web_fetch: 'Web Fetch',
    generate_image: 'Image Generation',
    edit_image: 'Image Editing',
    file_upload: 'File Upload',
    calculate: 'Calculation',
    code_execution: 'Code Execution',
    database_query: 'Database Query',
} as const;

export const useToolStatus = () => {
    const [activeTools, setActiveTools] = useState<Map<string, ToolStatus>>(new Map());
    const toastRefs = useRef<Map<string, string | number>>(new Map());
    const toolIdRef = useRef<Map<string, string>>(new Map());

    const getToolIcon = useCallback((toolName: string) => {
        return TOOL_ICONS[toolName as keyof typeof TOOL_ICONS] || TOOL_ICONS.default;
    }, []);

    const getToolLabel = useCallback((toolName: string) => {
        return TOOL_LABELS[toolName as keyof typeof TOOL_LABELS] ||
               toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }, []);

    const generateToolId = useCallback((toolName: string) => {
        return `${toolName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }, []);

    const getExistingToolId = useCallback((toolName: string): string | undefined => {
        return toolIdRef.current.get(toolName);
    }, []);

    const setToolId = useCallback((toolName: string, toolId: string) => {
        toolIdRef.current.set(toolName, toolId);
    }, []);

    const removeToolId = useCallback((toolName: string) => {
        toolIdRef.current.delete(toolName);
    }, []);

    const updateToolStatus = useCallback((update: ToolStatusUpdate) => {
        const now = Date.now();

        setActiveTools(prev => {
            const newMap = new Map(prev);

            const existingToolId = getExistingToolId(update.tool_name);
            const existingTool = existingToolId ? newMap.get(existingToolId) : undefined;

            if (update.tool_status === 'executing_tool') {
                let toolId: string;
                let toolStatus: ToolStatus;

                if (existingTool && existingTool.status === 'executing') {
                    toolId = existingTool.id;
                    toolStatus = {
                        ...existingTool,
                        message: update.tool_executing_message,
                        progress: update.progress,
                        metadata: { ...existingTool.metadata, ...update.metadata },
                    };
                } else {
                    toolId = generateToolId(update.tool_name);
                    toolStatus = {
                        id: toolId,
                        name: update.tool_name,
                        status: 'executing',
                        message: update.tool_executing_message,
                        progress: update.progress,
                        startTime: now,
                        metadata: update.metadata,
                    };
                    setToolId(update.tool_name, toolId);
                }

                newMap.set(toolId, toolStatus);

                const Icon = getToolIcon(update.tool_name);
                const label = getToolLabel(update.tool_name);

                const toastMessage = update.tool_executing_message || 'Processing...';
                const progressText = update.progress !== undefined ? `Progress: ${update.progress}%` : '';

                if (existingTool && existingTool.status === 'executing') {
                    toast.loading(
                        `${label}: ${toastMessage} ${progressText}`.trim(),
                        {
                            duration: Infinity,
                            id: toolId,
                        }
                    );
                } else {
                    const toastId = toast.loading(
                        `${label}: ${toastMessage} ${progressText}`.trim(),
                        {
                            duration: Infinity,
                            id: toolId,
                        }
                    );
                    toastRefs.current.set(toolId, toastId);
                }

            } else if (update.tool_status === 'tool_completed' || update.tool_status === 'tool_failed') {
                if (!existingTool) {
                    console.warn(`No active tool found for completion/failure: ${update.tool_name}`);
                    return prev;
                }

                const isCompleted = update.tool_status === 'tool_completed';
                const updatedTool: ToolStatus = {
                    ...existingTool,
                    status: isCompleted ? 'completed' : 'failed',
                    endTime: now,
                    progress: isCompleted ? 100 : existingTool.progress,
                    message: update.tool_executing_message || existingTool.message,
                    metadata: { ...existingTool.metadata, ...update.metadata },
                };

                newMap.set(existingTool.id, updatedTool);

                const label = getToolLabel(update.tool_name);
                const duration = isCompleted ? 3000 : 5000;
                const executionTime = ((now - (existingTool.startTime || now)) / 1000).toFixed(1);

                if (isCompleted) {
                    toast.success(
                        `${label} Complete - ${executionTime}s`,
                        {
                            id: existingTool.id,
                            duration,
                        }
                    );
                } else {
                    const errorMessage = updatedTool.message || 'Tool execution failed';
                    toast.error(
                        `${label} Failed: ${errorMessage}`,
                        {
                            id: existingTool.id,
                            duration,
                        }
                    );
                }

                const cleanupDelay = isCompleted ? 5000 : 8000;
                setTimeout(() => {
                    setActiveTools(current => {
                        const updated = new Map(current);
                        const currentTool = updated.get(existingTool.id);
                        if (currentTool?.status === updatedTool.status) {
                            updated.delete(existingTool.id);
                        }
                        return updated;
                    });
                    toastRefs.current.delete(existingTool.id);
                    removeToolId(update.tool_name);
                }, cleanupDelay);
            }

            return newMap;
        });
    }, [generateToolId, getToolIcon, getToolLabel, getExistingToolId, setToolId, removeToolId]);

    const clearAllTools = useCallback(() => {
        toastRefs.current.forEach(toastId => {
            toast.dismiss(toastId);
        });

        setActiveTools(new Map());
        toastRefs.current.clear();
        toolIdRef.current.clear();
    }, []);

    const cancelTool = useCallback((toolId: string) => {
        setActiveTools(prev => {
            const newMap = new Map(prev);
            const tool = newMap.get(toolId);

            if (tool) {
                const toastId = toastRefs.current.get(toolId);
                if (toastId) {
                    toast.dismiss(toastId);
                    toastRefs.current.delete(toolId);
                }

                removeToolId(tool.name);
                newMap.delete(toolId);
            }

            return newMap;
        });
    }, [removeToolId]);

    const getActiveToolsArray = useCallback(() => {
        return Array.from(activeTools.values());
    }, [activeTools]);

    const getToolsByStatus = useCallback((status: ToolStatus['status']) => {
        return Array.from(activeTools.values()).filter(tool => tool.status === status);
    }, [activeTools]);

    const hasActiveTools = useCallback(() => {
        return activeTools.size > 0;
    }, [activeTools]);

    return {
        activeTools: getActiveToolsArray(),
        updateToolStatus,
        clearAllTools,
        cancelTool,
        getToolsByStatus,
        getToolIcon,
        getToolLabel,
        hasActiveTools,
    };
};
