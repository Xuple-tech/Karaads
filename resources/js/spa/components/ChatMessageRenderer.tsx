import { Copy, RefreshCcw, User2 } from 'lucide-react';
import { useState } from 'react';

import type { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarkdownRenderer from '@/spa/components/MarkdownRenderer';

export default function ChatMessageRenderer({
    message,
    onRegenerate,
}: {
    message: Message;
    onRegenerate?: (messageId: string) => void;
}) {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === 'user';
    const content = message.content_markdown || message.content || '';

    const copy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] rounded-3xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm leading-6">
                    {message.content_text || message.content || ''}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <Card className="w-full max-w-[88%] border-border/60 bg-card/60">
                <CardContent className="space-y-4 p-4">
                    {message.isStreaming && !content ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User2 className="h-4 w-4" />
                            Generating response...
                        </div>
                    ) : (
                        <MarkdownRenderer markdown={content} />
                    )}
                    <div className="flex items-center gap-1">
                        <Button onClick={copy} size="icon" variant="ghost">
                            {copied ? <span className="text-xs">OK</span> : <Copy className="h-4 w-4" />}
                        </Button>
                        {onRegenerate && message.id ? (
                            <Button onClick={() => onRegenerate(message.id)} size="icon" variant="ghost">
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
