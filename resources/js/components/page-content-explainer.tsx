import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageContent } from '@/hooks/use-page-content';
import { BookMarked, ChevronDown, ChevronUp, Code, Eye, Lightbulb, Link as LinkIcon, List, Loader, MessageCircle, Table, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExplanationMessage {
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
    sourceSection?: string;
}

interface ContentExplanation {
    summary: string;
    keyPoints: string[];
    contentType: string;
    importance: 'high' | 'medium' | 'low';
    relatedSections: string[];
}

export function PageContentExplainer() {
    const pageContent = usePageContent();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ExplanationMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('explain');
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Generate initial summary on page load
    useEffect(() => {
        if (pageContent.title && messages.length === 0) {
            generateInitialSummary();
        }
    }, [pageContent.title]);

    /**
     * Generate initial summary of page content
     */
    const generateInitialSummary = async () => {
        try {
            setIsLoading(true);
            const summary = await explainPageContent('Summarize this page for me');

            const message: ExplanationMessage = {
                id: `msg-${Date.now()}`,
                type: 'agent',
                content: summary.summary || 'Page loaded successfully!',
                timestamp: new Date(),
            };

            setMessages([message]);
        } catch (error) {
            console.error('Error generating summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Send user query to agent
     */
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMessage: ExplanationMessage = {
            id: `msg-${Date.now()}`,
            type: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await explainPageContent(input);

            const agentMessage: ExplanationMessage = {
                id: `msg-${Date.now() + 1}`,
                type: 'agent',
                content: response.summary,
                timestamp: new Date(),
                sourceSection: response.relatedSections[0],
            };

            setMessages((prev) => [...prev, agentMessage]);
        } catch (error) {
            const errorMessage: ExplanationMessage = {
                id: `msg-${Date.now() + 1}`,
                type: 'agent',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Call agent API to explain content
     */
    const explainPageContent = async (query: string): Promise<ContentExplanation> => {
        try {
            const response = await fetch('/api/agent/explain-page-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    query,
                    pageContent: {
                        title: pageContent.title,
                        subtitle: pageContent.subtitle,
                        sections: pageContent.sections,
                        headings: pageContent.headings,
                        paragraphs: pageContent.paragraphs,
                        rawText: pageContent.rawText,
                    },
                }),
            });

            if (!response.ok) throw new Error('Agent request failed');

            return await response.json();
        } catch (error) {
            console.error('Error calling agent API:', error);
            // Fallback to local explanation
            return generateLocalExplanation(query);
        }
    };

    /**
     * Fallback: Generate explanation locally without API
     */
    const generateLocalExplanation = (query: string): ContentExplanation => {
        const summary = `Based on the page content, here's what I found regarding: "${query}"\n\nThis page contains ${pageContent.sections.length} main sections and covers topics like: ${pageContent.headings
            .slice(0, 3)
            .map((h) => h.text)
            .join(', ')}.`;

        return {
            summary,
            keyPoints: pageContent.headings.slice(0, 3).map((h) => h.text),
            contentType: 'documentation',
            importance: 'medium',
            relatedSections: pageContent.sections.slice(0, 2).map((s) => s.title),
        };
    };

    if (!pageContent.title) {
        return null; // Don't render if no page content found
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <div className="fixed right-6 bottom-6 z-40">
                <Button onClick={() => setIsOpen(!isOpen)} size="lg" className="rounded-full shadow-lg transition-all hover:shadow-xl">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {isOpen ? 'Close' : 'Ask Agent'}
                    {isOpen ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronUp className="ml-1 h-4 w-4" />}
                </Button>
            </div>

            {/* Chat Panel */}
            {isOpen && (
                <div className="bg-background fixed right-6 bottom-20 z-40 max-h-[600px] w-96 overflow-hidden rounded-lg border shadow-2xl">
                    <Card className="flex h-full flex-col">
                        <CardHeader className="border-b pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-500" />
                                        Page Content Agent
                                    </CardTitle>
                                    <CardDescription>Ask questions about this page</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
                            <TabsList className="w-full rounded-none border-b">
                                <TabsTrigger value="explain" className="flex-1">
                                    <Eye className="mr-1 h-4 w-4" />
                                    Explain
                                </TabsTrigger>
                                <TabsTrigger value="analyze" className="flex-1">
                                    <Lightbulb className="mr-1 h-4 w-4" />
                                    Analyze
                                </TabsTrigger>
                                <TabsTrigger value="content" className="flex-1">
                                    <BookMarked className="mr-1 h-4 w-4" />
                                    Content
                                </TabsTrigger>
                            </TabsList>

                            {/* Explain Tab */}
                            <TabsContent value="explain" className="flex flex-1 flex-col">
                                <ScrollArea className="flex-1 p-4">
                                    {messages.length === 0 ? (
                                        <div className="text-muted-foreground py-8 text-center">
                                            <Zap className="mx-auto mb-2 h-12 w-12 opacity-50" />
                                            <p>Ask me about this page content!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((msg) => (
                                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-3 ${
                                                            msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                        <span className="mt-1 block text-xs opacity-70">{msg.timestamp.toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex justify-start">
                                                    <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
                                                        <Loader className="h-4 w-4 animate-spin" />
                                                        <span className="text-sm">Thinking...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ScrollArea>

                                <form onSubmit={handleSendMessage} className="space-y-2 border-t p-4">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about this page..."
                                        className="focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Send'}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Analyze Tab */}
                            <TabsContent value="analyze" className="flex flex-1 flex-col">
                                <ScrollArea className="flex-1 space-y-4 p-4">
                                    <div>
                                        <h4 className="mb-2 text-sm font-semibold">📊 Page Statistics</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-muted rounded p-2">
                                                <p className="text-muted-foreground">Headings</p>
                                                <p className="text-lg font-bold">{pageContent.headings.length}</p>
                                            </div>
                                            <div className="bg-muted rounded p-2">
                                                <p className="text-muted-foreground">Sections</p>
                                                <p className="text-lg font-bold">{pageContent.sections.length}</p>
                                            </div>
                                            <div className="bg-muted rounded p-2">
                                                <p className="text-muted-foreground">Links</p>
                                                <p className="text-lg font-bold">{pageContent.links.length}</p>
                                            </div>
                                            <div className="bg-muted rounded p-2">
                                                <p className="text-muted-foreground">Code Blocks</p>
                                                <p className="text-lg font-bold">{pageContent.codeBlocks.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {pageContent.headings.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 text-sm font-semibold">📑 Page Structure</h4>
                                            <div className="space-y-1">
                                                {pageContent.headings.map((h, i) => (
                                                    <div key={i} style={{ paddingLeft: `${h.level * 8}px` }} className="text-xs">
                                                        <Badge variant="outline" className="text-xs">
                                                            H{h.level}
                                                        </Badge>
                                                        <span className="text-muted-foreground ml-2 line-clamp-1">{h.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            {/* Content Tab */}
                            <TabsContent value="content" className="flex flex-1 flex-col">
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {pageContent.links.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <LinkIcon className="h-4 w-4" />
                                                    <h4 className="text-sm font-semibold">Links ({pageContent.links.length})</h4>
                                                </div>
                                                <div className="max-h-[100px] space-y-1 overflow-y-auto text-xs">
                                                    {pageContent.links.slice(0, 5).map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="line-clamp-1 block text-blue-600 hover:underline"
                                                            title={link.text}
                                                        >
                                                            {link.text || link.url}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {pageContent.codeBlocks.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Code className="h-4 w-4" />
                                                    <h4 className="text-sm font-semibold">Code Blocks ({pageContent.codeBlocks.length})</h4>
                                                </div>
                                                <div className="space-y-1 text-xs">
                                                    {pageContent.codeBlocks.slice(0, 3).map((block, i) => (
                                                        <Badge key={i} variant="secondary">
                                                            {block.language}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {pageContent.lists.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <List className="h-4 w-4" />
                                                    <h4 className="text-sm font-semibold">Lists ({pageContent.lists.length})</h4>
                                                </div>
                                                <p className="text-muted-foreground text-xs">{pageContent.lists.length} list(s) found</p>
                                            </div>
                                        )}

                                        {pageContent.tables.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Table className="h-4 w-4" />
                                                    <h4 className="text-sm font-semibold">Tables ({pageContent.tables.length})</h4>
                                                </div>
                                                <p className="text-muted-foreground text-xs">{pageContent.tables.length} table(s) found</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            )}
        </>
    );
}
