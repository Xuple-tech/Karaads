// components/chat/ChatMessage.tsx
import { Bot, User, Search, Globe, FileText, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  canvasMode?: boolean;
}

export default function ChatMessage({ message, canvasMode = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasTools = message.tool_calls && message.tool_calls.length > 0;

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-primary" />
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-card border border-border/50 rounded-bl-sm'
      }`}>
        {/* Tool Calls */}
        {hasTools && (
          <div className="mb-3 space-y-2">
            {message.tool_calls?.map((toolCall, index) => (
              <div key={index} className="flex items-center gap-2 text-xs bg-background/50 rounded-lg p-2">
                {toolCall.function.name === 'web_search' ? (
                  <Search className="w-3 h-3 text-blue-500" />
                ) : (
                  <Globe className="w-3 h-3 text-green-500" />
                )}
                <span className="font-medium">
                  {toolCall.function.name === 'web_search' ? 'Searching' : 'Fetching'}...
                </span>
                <span className="text-muted-foreground">
                  {JSON.parse(toolCall.function.arguments).query}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Thinking Process */}
        {message.thinking && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg border">
            <div className="text-xs font-medium text-muted-foreground mb-1">Thinking:</div>
            <div className="text-sm">{message.thinking}</div>
          </div>
        )}

        {/* File Attachments */}
        {message.files && message.files.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Attachments ({message.files.length})</div>
            <div className="space-y-1">
              {message.files.map((file, idx) => {
                const isImage = file.mime_type?.startsWith('image/');
                const sizeInKB = (file.file_size / 1024).toFixed(1);

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-background/50 rounded-lg p-2 text-xs"
                  >
                    {isImage ? (
                      <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{file.filename}</p>
                      <p className="text-muted-foreground">{sizeInKB} KB</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        {canvasMode && !isUser ? (
          <textarea
            className="w-full min-h-[100px] p-2 bg-background/50 border rounded resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={message.content}
            readOnly
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
