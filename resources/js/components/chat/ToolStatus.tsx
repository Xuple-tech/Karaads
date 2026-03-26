// components/chat/ToolStatus.tsx
import { Globe, Search, Zap, CheckCircle, AlertCircle, Wand2, ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface ToolStatusProps {
  isUsingTools: boolean;
  currentTool: string | null;
  status: string;
  toolResult?: any;
}

export default function ToolStatus({ isUsingTools, currentTool, status, toolResult }: ToolStatusProps) {
  const [showResult, setShowResult] = useState(false);

  if (!isUsingTools && !status) return null;

  const getToolIcon = (tool: string | null) => {
    switch (tool) {
      case 'web_search':
        return <Search className="w-4 h-4" />;
      case 'web_fetch':
        return <Globe className="w-4 h-4" />;
      case 'generate_image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getToolLabel = (tool: string | null) => {
    switch (tool) {
      case 'web_search':
        return 'Web Search';
      case 'web_fetch':
        return 'Web Fetch';
      case 'generate_image':
        return 'Image Generation';
      default:
        return 'Processing';
    }
  };

  const toolIcon = getToolIcon(currentTool);
  const toolLabel = getToolLabel(currentTool);

  if (isUsingTools) {
    return (
      <div className="relative mb-3 group">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-purple-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-1" />

        {/* Main container with animated gradient */}
        <div className="relative px-3 py-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200/50 dark:border-blue-800/50 rounded-lg backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            {/* Animated spinner icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm animate-pulse" />
              <div className="relative animate-spin text-blue-600 dark:text-blue-400">
                {toolIcon}
              </div>
            </div>

            {/* Tool label with gradient text */}
            <span className="font-semibold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              {toolLabel}
            </span>

            {/* Status message */}
            {status && (
              <span className="text-blue-600 dark:text-blue-400 text-xs font-medium ml-auto">
                {status}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  return (
    <div className="relative mb-3">
      <button
        onClick={() => toolResult && setShowResult(!showResult)}
        className="w-full text-left px-3 py-2 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border border-green-200/50 dark:border-green-800/50 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="font-semibold text-green-700 dark:text-green-300">
            {toolLabel} Complete
          </span>
          {toolResult && (
            <span className="text-xs text-green-600 dark:text-green-400 ml-auto group-hover:translate-x-1 transition-transform">
              {showResult ? '▼' : '▶'}
            </span>
          )}
        </div>
      </button>

      {/* Expandable result panel */}
      {showResult && toolResult && (
        <div className="mt-2 p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-200/30 dark:border-green-800/30 rounded-lg max-h-48 overflow-y-auto">
          <pre className="text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap break-words font-mono">
            {typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
