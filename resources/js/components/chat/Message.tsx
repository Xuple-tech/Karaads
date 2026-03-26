import { Button } from '@/components/ui/button';
import { Message as MessageType } from '@/types/chat';
import { Clipboard, DownloadCloud, RefreshCcw, Sparkles, CheckCircle, AlertTriangle, Search, Globe, Image as ImageIcon, FileText, File, Music, Video, BookOpen, ExternalLink, Copy, MoreVertical, X } from 'lucide-react';
import { toast } from 'sonner';
import MarkdownMessage from '../MarkdownMessage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle ,SheetTrigger} from "@/components/ui/sheet";
import { useMediaQuery } from '@/hooks/use-media-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader
} from '@/components/ui/dialog';
interface MessageProps {
  message: MessageType;
  onRegenerate?: (messageId: string) => void;
  isProcessing?: boolean;
  onFeedback?: () => void;
}

// Mobile bottom sheet for sources
const MobileSourcesSheet = memo(({
  open,
  onOpenChange,
  references
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  references: any[];
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl p-0">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />
        <SheetHeader className="px-6 pt-8 pb-4 border-b">
          <SheetTitle className="text-lg">Sources</SheetTitle>
        </SheetHeader>
        <div className="p-6 overflow-y-auto h-full">
          <div className="space-y-3">
            {references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-white">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ref.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {ref.url.replace(/^https?:\/\//, '')}
                    </p>
                    {ref.content && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {ref.content}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

MobileSourcesSheet.displayName = 'MobileSourcesSheet';

// Tool status indicator (simplified)
const ToolStatus = memo(({ status, toolName, message }: {
  status: 'executing' | 'failed' | 'completed';
  toolName: string;
  message?: string;
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'executing':
        return {
          icon: <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'failed':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800'
        };
      default:
        return {
          icon: null,
          color: '',
          bg: '',
          border: ''
        };
    }
  };

  const config = getStatusConfig(status);
  const toolLabel = toolName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className={`mb-4 p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`text-sm font-medium ${config.color}`}>
          {status === 'executing' ? `${toolLabel}...` :
           status === 'failed' ? 'Failed' : `${toolLabel} Complete`}
        </span>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground mt-1">
          {message}
        </p>
      )}
    </div>
  );
});

ToolStatus.displayName = 'ToolStatus';


interface FileAttachment {
  url: string;
  filename: string;
  file_size: number;
  mime_type?: string;
}

interface FileAttachmentsProps {
  files: FileAttachment[];
}

const FileAttachments = memo(({ files }: FileAttachmentsProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!files?.length) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (e: React.MouseEvent, file: FileAttachment) => {
    e.stopPropagation();
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.filename;
      a.click();
      toast.success('Download started');
    }
  };

  const handlePreview = (file: FileAttachment) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const isImageFile = (file: FileAttachment) => {
    return file.mime_type?.startsWith('image/') || 
           file.filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  };

  const isVideoFile = (file: FileAttachment) => {
    return file.mime_type?.startsWith('video/') || 
           file.filename.match(/\.(mp4|mov|avi|webm|mkv)$/i);
  };

  const getFileIcon = (file: FileAttachment) => {
    if (isImageFile(file)) return <ImageIcon className="h-4 w-4" />;
    if (isVideoFile(file)) return <Video className="h-4 w-4" />;
    if (file.mime_type?.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (file.mime_type?.includes('pdf') || file.filename.endsWith('.pdf')) 
      return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Calculate grid columns based on screen size
  const gridCols = isMobile ? 'grid-cols-2' : 'grid-cols-3';
  const maxVisibleFiles = isMobile ? 4 : 6;
  
  return (
    <>
      <div className="mb-4">
        <div className={`grid ${gridCols} gap-3`}>
          {files.slice(0, maxVisibleFiles).map((file, idx) => (
            <div
              key={idx}
              className={`
                group relative aspect-square rounded-lg border overflow-hidden 
                bg-card hover:bg-accent/50 transition-all cursor-pointer
                hover:scale-[1.02] active:scale-[0.98]
              `}
              onClick={() => handlePreview(file)}
            >
              {/* Image thumbnail */}
              {isImageFile(file) && file.url ? (
                <div className="relative w-full h-full">
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ) : (
                /* File icon for non-images */
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="p-3 rounded-lg bg-muted mb-2">
                    {getFileIcon(file)}
                  </div>
                  <div className="text-center w-full px-2">
                    <p className="text-xs font-medium truncate">
                      {file.filename}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Download button for images */}
              {isImageFile(file) && (
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={(e) => handleDownload(e, file)}
                  >
                    <DownloadCloud className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Show more indicator */}
        {files.length > maxVisibleFiles && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            +{files.length - maxVisibleFiles} more files
          </p>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">
                {selectedFile?.filename}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => selectedFile && handleDownload(e, selectedFile)}
                >
                  <DownloadCloud className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-4 overflow-auto">
            {selectedFile && (
              <div className="flex items-center justify-center min-h-[60vh]">
                {isImageFile(selectedFile) && selectedFile.url ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.filename}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                ) : isVideoFile(selectedFile) && selectedFile.url ? (
                  <video
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg"
                  >
                    <source src={selectedFile.url} type={selectedFile.mime_type} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-center p-8">
                    <div className="inline-flex items-center justify-center p-6 rounded-full bg-muted mb-4">
                      {getFileIcon(selectedFile)}
                    </div>
                    <h3 className="font-medium mb-2">{selectedFile.filename}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {formatFileSize(selectedFile.file_size)}
                    </p>
                    <Button
                      variant="default"
                      onClick={(e) => handleDownload(e, selectedFile)}
                    >
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

FileAttachments.displayName = 'FileAttachments';

export { FileAttachments };

// Image display component
const ImageDisplay = memo(({ images, onFeedback }: { images: any[], onFeedback?: () => void }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleDownload = (img: any, idx: number) => {
    const link = img.url || img.image_url;
    const a = document.createElement('a');
    a.href = link.startsWith('http') ? link : `https://${link}`;
    a.download = img.filename || `image-${idx + 1}.png`;
    a.click();
    toast.success('Image downloaded');
  };

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${images.length > 1 ? (isMobile ? 'grid-cols-1' : 'grid-cols-2') : ''}`}>
        {images.map((img, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={img.url || img.image_url}
                alt={img.revised_prompt || `Generated image ${idx + 1}`}
                className="aspect-auto w-full"
                loading="lazy"
              />
            </CardContent>
            <CardFooter className="p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {img.revised_prompt && (
                  <p className="text-xs text-muted-foreground truncate">
                    {img.revised_prompt}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDownload(img, idx)}
                >
                  <DownloadCloud className="h-4 w-4" />
                </Button>
                {onFeedback && images.length === 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onFeedback}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
});

ImageDisplay.displayName = 'ImageDisplay';

// Sources/references component
const References = memo(({ references, toolResults }: { references: any[], toolResults: any[] }) => {
  const [showSources, setShowSources] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const allReferences = useMemo(() => {
    const refs = [...references];
    toolResults.forEach((tool) => {
      if (tool.tool_name === "web_search" && tool.result?.results) {
        tool.result.results.forEach((result, idx) => {
          refs.push({
            title: result.title,
            url: result.url,
            content: result.content,
          });
        });
      }
    });
    return refs.slice(0, 5); // Limit to 5 sources
  }, [references, toolResults]);

  if (!allReferences.length) return null;

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSources(true)}
          className="mt-3"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Sources ({allReferences.length})
        </Button>
        <MobileSourcesSheet
          open={showSources}
          onOpenChange={setShowSources}
          references={allReferences}
        />
      </>
    );
  }

  return (
    <div className="mt-4">
      <Sheet open={showSources} onOpenChange={setShowSources}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Sources ({allReferences.length})
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Sources</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {allReferences.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ref.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {ref.url.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});

References.displayName = 'References';

// Thinking process component
const ThinkingProcess = memo(({ thinking }: { thinking: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!thinking?.trim()) return null;

  const shouldTruncate = thinking.length > 200;
  const displayText = expanded || !shouldTruncate ? thinking : thinking.slice(0, 200) + '...';

  return (
    <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-medium">Thinking</span>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {displayText}
      </p>
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 h-7 text-xs"
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
});

ThinkingProcess.displayName = 'ThinkingProcess';

// Main Message Component
export default function Message({ message, onRegenerate, isProcessing, onFeedback }: MessageProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [copied, setCopied] = useState(false);

  const getContent = useCallback(() => {
    if (message.role === 'user') {
      return message.message || message.content || '';
    }
    return message.response || message.message || message.content || '';
  }, [message]);

  const getImages = useCallback(() => {
    if (message.images?.length) return message.images;
    if (message.image) return [message.image];
    if (message.metadata?.image_url) {
      return [{
        url: message.metadata.image_url,
        image_url: message.metadata.image_url,
        filename: message.metadata.image_filename,
        revised_prompt: message.metadata.revised_prompt,
      }];
    }
    return [];
  }, [message]);

  const handleCopy = useCallback(() => {
    const content = getContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [getContent]);

  const renderToolStatus = useCallback(() => {
    const status = message.metadata?.tool_status;
    const toolName = message.metadata?.tool_name;
    const error = message.metadata?.tool_error;
    const executingMessage = message.metadata?.tool_executing_message;

    if (status === 'executing' || status === 'executing_tool') {
      return (
        <ToolStatus
          status="executing"
          toolName={toolName}
          message={executingMessage}
        />
      );
    }

    if (status === 'failed' && error) {
      return (
        <ToolStatus
          status="failed"
          toolName={toolName}
          message={error}
        />
      );
    }

    if (status === 'completed') {
      return (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Tool execution completed successfully
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }, [message.metadata]);

  const renderError = useCallback(() => {
    const content = getContent();
    if (content.startsWith('Error:')) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {content.replace('Error:', '').trim()}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }, [getContent]);

  const isUserMessage = message.role === 'user';
  const images = getImages();
  const content = getContent();
  const hasContent = content?.trim();
  const hasImages = images.length > 0;

  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[90%] ${isMobile ? 'max-w-[95%]' : 'max-w-[80%]'}`}>
        <div className={`rounded-xl p-4 ${isUserMessage ? 'bg-primary/10' : 'bg-card border'}`}>

          {/* File attachments for user messages */}
          {isUserMessage && message.files?.length > 0 && (
            <FileAttachments files={message.files} />
          )}

          {/* Tool status */}
          {!isUserMessage && renderToolStatus()}

          {/* Error message */}
          {!isUserMessage && renderError()}

          {/* Thinking process */}
          {!isUserMessage && <ThinkingProcess thinking={message.thinking} />}

          {/* Image content */}
          {!isUserMessage && hasImages && (
            <ImageDisplay images={images} onFeedback={onFeedback} />
          )}

          {/* Text content */}
          {hasContent && !content.startsWith('Error:') && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownMessage
                message={{
                  content: content,
                  thinking: message.thinking,
                  isStreaming: message.isStreaming,
                  role: message.role,
                  id: message.id,
                  type: message.type,
                  metadata: message.metadata
                }}
                isStreaming={message.isStreaming}
                role={message.role}
                messageId={message.id}
                metadata={message.metadata}
              />
            </div>
          )}

          {/* Sources for assistant messages */}
          {!isUserMessage && hasContent && !content.startsWith('Error:') && (
            <References
              references={message.metadata?.references || []}
              toolResults={message.metadata?.tool_results || []}
            />
          )}

          {/* Message actions */}
          <div className={`mt-3 flex gap-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
            {!isUserMessage && hasContent && !content.startsWith('Error:') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />

                    </>
                  )}
                </Button>

                {onRegenerate && !isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => onRegenerate(message.id!)}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                )}

                {onFeedback && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={onFeedback}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Feedback
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
