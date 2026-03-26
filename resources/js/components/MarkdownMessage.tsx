import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Check, Copy, Download, Eye, Code, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import 'katex/dist/katex.min.css';

interface MarkdownMessageProps {
  message: {
    content: string;
    thinking?: string;
    isStreaming?: boolean;
    role: 'user' | 'assistant';
    id?: number;
    type?: 'text' | 'image';
    metadata?: {
      prompt?: string;
    };
  };
  className?: string;
  isStreaming?: boolean;
  role: 'user' | 'assistant';
  type?: 'text' | 'image';
  metadata?: {
    prompt?: string;
  };
}

// Optimized Code Block with cleaner UI
const CodeBlock = memo(({
  language,
  code,
  isHtml = false
}: {
  language: string;
  code: string;
  isHtml?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const cleanCode = useMemo(() => code.trim(), [code]);
  const lineCount = useMemo(() => cleanCode.split('\n').length, [cleanCode]);
  const shouldCollapse = lineCount > 20 && !expanded;
  const displayCode = useMemo(() => 
    shouldCollapse ? cleanCode.split('\n').slice(0, 20).join('\n') : cleanCode,
    [cleanCode, shouldCollapse]
  );
  
  const isTerminal = useMemo(() => 
    ['bash', 'shell', 'sh', 'zsh', 'terminal', 'console', 'cmd'].includes(language?.toLowerCase() || ''),
    [language]
  );
  const displayLanguage = isTerminal ? 'terminal' : (language || 'code');

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    const extension = language === 'javascript' ? 'js' :
                     language === 'typescript' ? 'ts' :
                     language === 'python' ? 'py' :
                     language === 'html' ? 'html' : 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  return (
    <div className="relative group my-3">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/50">
          <div className="flex items-center gap-2 min-w-0">
            {isTerminal ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
            ) : (
              <Code className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-xs font-medium text-foreground truncate">
              {displayLanguage}
            </span>
            {lineCount > 1 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {lineCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isHtml && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-muted"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <div className="relative">
          <SyntaxHighlighter
            language={isTerminal ? 'bash' : (language || 'text')}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '0.875rem',
              fontSize: '0.8125rem',
              lineHeight: '1.5',
              backgroundColor: isTerminal ? '#1a1a1a' : '#1e1e1e',
              overflowX: 'auto',
              maxHeight: shouldCollapse ? '400px' : 'none',
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
            }}
            showLineNumbers={lineCount > 1 && !isTerminal}
            wrapLongLines={false}
            lineNumberStyle={{
              minWidth: '2.25em',
              paddingRight: '0.75em',
              color: '#4a5568',
              userSelect: 'none'
            }}
          >
            {displayCode}
          </SyntaxHighlighter>
          
          {/* Expand/Collapse Controls */}
          {shouldCollapse && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/90 to-transparent flex items-end justify-center pb-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExpanded(true)}
                className="h-6 text-xs shadow-lg"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                {lineCount - 20} more
              </Button>
            </div>
          )}
          {expanded && lineCount > 20 && (
            <div className="border-t border-border/50 bg-muted/20 px-3 py-1.5 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
                className="h-6 text-xs"
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Collapse
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* HTML Preview Sheet */}
      {isHtml && previewOpen && (
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent className="w-full sm:max-w-3xl p-0">
            <div className="h-full flex flex-col">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-sm">HTML Preview</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden bg-white">
                <iframe
                  srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>body { margin: 20px; font-family: system-ui, sans-serif; }</style>
</head>
<body>${code}</body>
</html>`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title="HTML Preview"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

// Minimal Thinking Process Component
const ThinkingProcess = memo(({ thinking }: { thinking: string }) => (
  <div className="mb-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-md">
    <div className="flex items-center gap-2 mb-1.5">
      <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
        Thinking
      </span>
    </div>
    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
      {thinking}
    </p>
  </div>
));

ThinkingProcess.displayName = 'ThinkingProcess';

// Minimal Streaming Indicator
const StreamingIndicator = memo(() => (
  <div className="flex items-center gap-2 mt-3 text-muted-foreground">
    <div className="flex gap-1">
      <div className="h-1 w-1 bg-primary rounded-full animate-pulse" />
      <div className="h-1 w-1 bg-primary rounded-full animate-pulse [animation-delay:150ms]" />
      <div className="h-1 w-1 bg-primary rounded-full animate-pulse [animation-delay:300ms]" />
    </div>
    <span className="text-xs">Generating...</span>
  </div>
));

StreamingIndicator.displayName = 'StreamingIndicator';

// Optimized Table Component
const TableWrapper = memo(({ children }: any) => (
  <div className="my-4 -mx-1 overflow-hidden">
    <div className="overflow-x-auto rounded-md border border-border shadow-sm">
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  </div>
));

TableWrapper.displayName = 'TableWrapper';

export default function MarkdownMessage({
  message,
  className = '',
  isStreaming = false,
  role = 'assistant',
  type = 'text',
  metadata,
}: MarkdownMessageProps) {
  const [displayContent, setDisplayContent] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized content processing with better markdown spacing
  const processContent = useCallback((content: string) => {
    return content
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$')
      .replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2')
      .replace(/(#{1,6}\s[^\n]*)\n([^\n])/g, '$1\n\n$2')
      .replace(/([^\n\s])\n(\s*[-*+]\s)/g, '$1\n\n$2')
      .replace(/([^\n])\n(\d+\.\s)/g, '$1\n\n$2')
      .replace(/([^\n`])(```)/g, '$1\n\n$2')
      .replace(/(```[^\n]*\n[\s\S]*?```)\n([^\n])/g, '$1\n\n$2')
      .replace(/([^\n])\n(>\s)/g, '$1\n\n$2')
      .replace(/\n\n\n+/g, '\n\n');
  }, []);

  // Debounced content update for streaming
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    const processed = processContent(message.content);
    
    if (isStreaming) {
      updateTimeoutRef.current = setTimeout(() => {
        setDisplayContent(processed);
      }, 30);
    } else {
      setDisplayContent(processed);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [message.content, processContent, isStreaming]);

  // Streamlined markdown components
  const markdownComponents = useMemo(() => ({
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-5 mb-2.5 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-3 mb-1.5 text-foreground">
        {children}
      </h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-sm font-semibold mt-3 mb-1.5 text-foreground">
        {children}
      </h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-sm font-medium mt-2 mb-1 text-foreground">
        {children}
      </h6>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 leading-relaxed text-foreground/90">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">
        {children}
      </em>
    ),
    del: ({ children }: any) => (
      <del className="line-through opacity-70">
        {children}
      </del>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),
    ul: ({ children }: any) => (
      <ul className="my-3 ml-5 list-disc space-y-1.5 marker:text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="my-3 ml-5 list-decimal space-y-1.5 marker:text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      const terminalPatterns = [
        /^\$\s+/m, /^>\s+/m, /^#\s+/m,
        /npm\s+(install|run|start|build|test)/i,
        /yarn\s+(add|install|run|start|build)/i,
        /pip\s+install/i,
        /git\s+(clone|pull|push|commit|add)/i,
        /docker\s+(run|build|ps|exec)/i,
        /kubectl\s+/i,
        /curl\s+-/i,
        /wget\s+/i,
        /cd\s+/, /ls\s*(-[a-z]+)?/i,
        /mkdir\s+/i, /rm\s+/i, /mv\s+/i, /cp\s+/i,
      ];

      const looksLikeCommand = !inline && codeString.trim() && (
        ['bash', 'shell', 'sh', 'zsh', 'terminal', 'console', 'cmd', 'powershell'].includes(language) ||
        terminalPatterns.some(pattern => pattern.test(codeString))
      );

      if (!inline && codeString.trim() && (language || looksLikeCommand)) {
        return (
          <CodeBlock
            language={language || 'bash'}
            code={codeString}
            isHtml={language === 'html'}
          />
        );
      }

      return (
        <code
          className="px-1.5 py-0.5 bg-muted/70 rounded text-[0.875em] font-mono border border-border/40"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => <>{children}</>,
    table: ({ children }: any) => (
      <TableWrapper>{children}</TableWrapper>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-muted/60 border-b border-border">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-border/50 bg-card">
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-muted/30 transition-colors">
        {children}
      </tr>
    ),
    td: ({ children }: any) => (
      <td className="px-3 py-2 text-sm align-top">
        {children}
      </td>
    ),
    th: ({ children }: any) => (
      <th className="px-3 py-2 text-left text-sm font-semibold">
        {children}
      </th>
    ),
    blockquote: ({ children }: any) => (
      <div className="my-3 border-l-2 border-primary/60 bg-muted/30 pl-4 py-2">
        <div className="text-foreground/80 italic text-sm space-y-2">
          {children}
        </div>
      </div>
    ),
    hr: () => (
      <Separator className="my-4" />
    ),
    img: ({ src, alt, title }: any) => (
      <div className="my-4 overflow-hidden rounded-lg border border-border shadow-sm">
        <img
          src={src}
          alt={alt || 'Image'}
          title={title}
          className="w-full h-auto max-h-[500px] object-contain bg-muted/20"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {alt && (
          <div className="px-3 py-2 bg-muted/40 border-t border-border/50">
            <p className="text-xs text-muted-foreground">{alt}</p>
          </div>
        )}
      </div>
    ),
  }), []);

  if (type === 'image' && role === 'assistant') {
    return (
      <div className={className}>
        {metadata?.prompt && (
          <div className="mb-3 p-3 bg-muted/50 rounded-md border border-border/50">
            <p className="text-xs font-medium mb-1">Prompt:</p>
            <p className="text-xs text-muted-foreground">{metadata.prompt}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} ${role === 'user' ? 'bg-muted/30 rounded-lg p-3' : ''}`}>
      {role === 'user' ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm m-0">
            {displayContent}
          </p>
        </div>
      ) : (
        <>
          {message.thinking && <ThinkingProcess thinking={message.thinking} />}
          <div className="markdown-content text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
        </>
      )}
      {isStreaming && <StreamingIndicator />}
    </div>
  );
}