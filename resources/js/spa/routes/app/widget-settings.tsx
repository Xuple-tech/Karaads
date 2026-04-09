import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bot, Code2, Copy, Globe2, Loader2, Save, Settings2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';
import { authHeaders } from '@/spa/lib/auth-token';
import { queryClient } from '@/spa/lib/query-client';

type WidgetKnowledge = {
    id: string;
    name: string;
    type: 'text' | 'url' | 'pdf';
    source_url?: string | null;
    status: 'processing' | 'ready' | 'failed';
    content: string;
};

type WidgetTool = {
    id: string;
    tool_type: 'http' | 'mcp_server';
    name: string;
    description: string;
    endpoint_url: string;
    method: string;
    transport?: string | null;
    is_active: boolean;
};

type WidgetDetail = {
    id: string;
    name: string;
    token: string;
    bot_name: string;
    greeting: string;
    theme_color: string;
    avatar_url?: string | null;
    system_prompt?: string | null;
    is_active: boolean;
    allow_file_uploads: boolean;
    allowed_domains: string[];
    knowledge: WidgetKnowledge[];
    tools: WidgetTool[];
    embed_code: string;
    preview_url: string;
    analytics: {
        sessions: number;
        messages: number;
    };
};

export function Component() {
    const { widgetId } = useParams();
    const [widget, setWidget] = useState<WidgetDetail | null>(null);
    const [textKnowledge, setTextKnowledge] = useState({ name: '', content: '' });
    const [urlKnowledge, setUrlKnowledge] = useState({ name: '', url: '' });
    const [toolForm, setToolForm] = useState({
        tool_type: 'http' as 'http' | 'mcp_server',
        name: '',
        description: '',
        endpoint_url: '',
        method: 'GET',
        transport: 'http',
        headers: '{}',
        parameters: '{ "type": "object", "properties": {} }',
        configuration: '{}',
    });

    const widgetQuery = useQuery({
        queryKey: ['spa', 'widget', widgetId],
        queryFn: async () => apiRequest<{ widget: WidgetDetail }>(`/api/widget/${widgetId}`),
        enabled: Boolean(widgetId),
    });

    useEffect(() => {
        if (widgetQuery.data?.widget) {
            setWidget(widgetQuery.data.widget);
        }
    }, [widgetQuery.data?.widget]);

    const saveMutation = useMutation({
        mutationFn: () => apiRequest(`/api/widget/${widgetId}`, { method: 'PUT', json: widget }),
        onSuccess: async () => {
            toast.success('Widget updated');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] }),
                queryClient.invalidateQueries({ queryKey: ['spa', 'widgets'] }),
            ]);
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to save widget.'),
    });

    const addTextMutation = useMutation({
        mutationFn: () => apiRequest(`/api/widget/${widgetId}/knowledge`, { method: 'POST', json: { type: 'text', name: textKnowledge.name || 'Text note', content: textKnowledge.content } }),
        onSuccess: async () => {
            toast.success('Text knowledge added');
            setTextKnowledge({ name: '', content: '' });
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to save text knowledge.'),
    });

    const addUrlMutation = useMutation({
        mutationFn: () => apiRequest(`/api/widget/${widgetId}/knowledge`, { method: 'POST', json: { type: 'url', name: urlKnowledge.name || urlKnowledge.url, url: urlKnowledge.url } }),
        onSuccess: async () => {
            toast.success('URL knowledge added');
            setUrlKnowledge({ name: '', url: '' });
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to fetch URL knowledge.'),
    });

    const uploadPdfMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`/api/widget/${widgetId}/knowledge/pdf`, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    ...authHeaders(),
                    ...xsrfHeader(),
                },
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.message || 'Failed to upload PDF.');
            }

            return response.json();
        },
        onSuccess: async () => {
            toast.success('PDF knowledge uploaded');
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to upload PDF.'),
    });

    const addToolMutation = useMutation({
        mutationFn: () => apiRequest(`/api/widget/${widgetId}/tools`, {
            method: 'POST',
            json: {
                tool_type: toolForm.tool_type,
                name: toolForm.name,
                description: toolForm.description,
                endpoint_url: toolForm.endpoint_url,
                method: toolForm.method,
                transport: toolForm.transport,
                headers: parseJson(toolForm.headers),
                parameters: parseJson(toolForm.parameters),
                configuration: parseJson(toolForm.configuration),
                is_active: true,
            },
        }),
        onSuccess: async () => {
            toast.success('Tool saved');
            setToolForm({
                tool_type: 'http',
                name: '',
                description: '',
                endpoint_url: '',
                method: 'GET',
                transport: 'http',
                headers: '{}',
                parameters: '{ "type": "object", "properties": {} }',
                configuration: '{}',
            });
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
        onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Failed to save tool.'),
    });

    const deleteKnowledgeMutation = useMutation({
        mutationFn: (knowledgeId: string) => apiRequest(`/api/widget/${widgetId}/knowledge/${knowledgeId}`, { method: 'DELETE' }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
    });

    const deleteToolMutation = useMutation({
        mutationFn: (toolId: string) => apiRequest(`/api/widget/${widgetId}/tools/${toolId}`, { method: 'DELETE' }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['spa', 'widget', widgetId] });
        },
    });

    if (widgetQuery.isLoading || !widget) {
        return (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
                <Skeleton className="h-40 w-full rounded-3xl" />
                <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <section className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/8 via-background to-emerald-500/8 p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-3">
                        <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground">
                            <Link to="/widget">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to widgets
                            </Link>
                        </Button>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{widget.name}</h1>
                                <Badge variant={widget.is_active ? 'default' : 'secondary'}>
                                    {widget.is_active ? 'Active' : 'Paused'}
                                </Badge>
                            </div>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Manage branding, embed code, knowledge, API tools, and remote MCP servers for this widget.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <StatCard label="Sessions" value={widget.analytics.sessions} />
                        <StatCard label="Messages" value={widget.analytics.messages} />
                    </div>
                </div>
            </section>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="embed">Embed Code</TabsTrigger>
                    <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                    <TabsTrigger value="tools">API Tools</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-4 w-4 text-primary" />
                                General settings
                            </CardTitle>
                            <CardDescription>Control branding, prompt behavior, domain restrictions, and uploads.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <Field label="Widget name">
                                <Input value={widget.name} onChange={(event) => setWidget({ ...widget, name: event.target.value })} />
                            </Field>
                            <Field label="Bot name">
                                <Input value={widget.bot_name} onChange={(event) => setWidget({ ...widget, bot_name: event.target.value })} />
                            </Field>
                            <Field label="Greeting" className="md:col-span-2">
                                <Input value={widget.greeting} onChange={(event) => setWidget({ ...widget, greeting: event.target.value })} />
                            </Field>
                            <Field label="Theme color">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={widget.theme_color}
                                        onChange={(event) => setWidget({ ...widget, theme_color: event.target.value })}
                                        className="h-10 w-10 cursor-pointer rounded-lg border border-input p-0.5"
                                    />
                                    <Input
                                        value={widget.theme_color}
                                        onChange={(event) => setWidget({ ...widget, theme_color: event.target.value })}
                                        className="font-mono"
                                        placeholder="#7c3aed"
                                        maxLength={7}
                                    />
                                </div>
                            </Field>
                            <Field label="Avatar URL">
                                <Input value={widget.avatar_url ?? ''} onChange={(event) => setWidget({ ...widget, avatar_url: event.target.value })} />
                            </Field>
                            <Field label="System prompt" className="md:col-span-2">
                                <Textarea rows={7} value={widget.system_prompt ?? ''} onChange={(event) => setWidget({ ...widget, system_prompt: event.target.value })} />
                            </Field>
                            <Field label="Allowed domains" hint="One domain per line. Leave blank to allow all domains." className="md:col-span-2">
                                <Textarea
                                    rows={5}
                                    value={(widget.allowed_domains ?? []).join('\n')}
                                    onChange={(event) =>
                                        setWidget({
                                            ...widget,
                                            allowed_domains: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean),
                                        })
                                    }
                                />
                            </Field>
                            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                                <div>
                                    <Label className="font-medium">Active</Label>
                                    <p className="text-sm text-muted-foreground">Show the widget publicly and accept new sessions.</p>
                                </div>
                                <Switch checked={widget.is_active} onCheckedChange={(value) => setWidget({ ...widget, is_active: value })} />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                                <div>
                                    <Label className="font-medium">Allow visitor file uploads</Label>
                                    <p className="text-sm text-muted-foreground">Expose file attachments inside the widget input.</p>
                                </div>
                                <Switch checked={widget.allow_file_uploads} onCheckedChange={(value) => setWidget({ ...widget, allow_file_uploads: value })} />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save widget settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="embed">
                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-primary" />
                                    Embed snippet
                                </CardTitle>
                                <CardDescription>Paste this snippet into any site where you want the widget to appear.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                                    <span className="text-xs text-muted-foreground">Widget token:</span>
                                    <code className="flex-1 truncate font-mono text-xs text-foreground">{widget.token}</code>
                                    <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => copyText(widget.token)}>
                                        <Copy className="mr-1 h-3 w-3" />
                                        Copy
                                    </Button>
                                </div>
                                <pre className="overflow-x-auto rounded-2xl border border-border/60 bg-muted/40 p-4 text-xs text-foreground">
                                    <code>{widget.embed_code}</code>
                                </pre>
                                <Button type="button" variant="outline" onClick={() => copyText(widget.embed_code)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy embed code
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle>Live preview</CardTitle>
                                <CardDescription>Preview the real widget bundle in an isolated frame.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <iframe src={widget.preview_url} title="Widget preview" className="h-[520px] w-full rounded-2xl border border-border/60 bg-white" />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="knowledge">
                    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-primary" />
                                    Add knowledge
                                </CardTitle>
                                <CardDescription>Text, URLs, and PDFs can all feed the widget’s system context.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Field label="Text note">
                                    <Input value={textKnowledge.name} onChange={(event) => setTextKnowledge({ ...textKnowledge, name: event.target.value })} placeholder="Shipping policy" />
                                    <Textarea className="mt-2" rows={5} value={textKnowledge.content} onChange={(event) => setTextKnowledge({ ...textKnowledge, content: event.target.value })} />
                                    <Button type="button" className="mt-3" onClick={() => addTextMutation.mutate()} disabled={addTextMutation.isPending || !textKnowledge.content.trim()}>
                                        Save text knowledge
                                    </Button>
                                </Field>

                                <Field label="Website URL">
                                    <Input value={urlKnowledge.url} onChange={(event) => setUrlKnowledge({ ...urlKnowledge, url: event.target.value })} placeholder="https://example.com/faq" />
                                    <Input className="mt-2" value={urlKnowledge.name} onChange={(event) => setUrlKnowledge({ ...urlKnowledge, name: event.target.value })} placeholder="Optional title" />
                                    <Button type="button" className="mt-3" variant="outline" onClick={() => addUrlMutation.mutate()} disabled={addUrlMutation.isPending || !urlKnowledge.url.trim()}>
                                        <Globe2 className="mr-2 h-4 w-4" />
                                        Fetch URL
                                    </Button>
                                </Field>

                                <Field label="PDF file">
                                    <Input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                uploadPdfMutation.mutate(file);
                                            }
                                        }}
                                    />
                                </Field>
                            </CardContent>
                        </Card>

                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle>Knowledge items</CardTitle>
                                <CardDescription>Ready items are injected into the widget context when relevant.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[640px] pr-4">
                                    <div className="space-y-3">
                                        {widget.knowledge.length ? widget.knowledge.map((item) => (
                                            <div key={item.id} className="rounded-2xl border border-border/60 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium text-foreground">{item.name}</p>
                                                            <Badge variant="outline">{item.type}</Badge>
                                                            <Badge variant={item.status === 'ready' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                                                                {item.status}
                                                            </Badge>
                                                        </div>
                                                        {item.source_url ? <p className="mt-1 text-xs text-muted-foreground">{item.source_url}</p> : null}
                                                    </div>
                                                    <Button type="button" size="sm" variant="ghost" onClick={() => deleteKnowledgeMutation.mutate(item.id)}>
                                                        Remove
                                                    </Button>
                                                </div>
                                                <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{item.content || 'No extracted content available.'}</p>
                                            </div>
                                        )) : (
                                            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                                                No knowledge items yet.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tools">
                    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-primary" />
                                    Add tool or MCP server
                                </CardTitle>
                                <CardDescription>Configure HTTPS tools or remote MCP servers for this widget.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Type">
                                    <Select
                                        value={toolForm.tool_type}
                                        onValueChange={(value) => setToolForm({ ...toolForm, tool_type: value as 'http' | 'mcp_server' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="http">HTTP tool</SelectItem>
                                            <SelectItem value="mcp_server">Remote MCP server</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label="Name">
                                    <Input value={toolForm.name} onChange={(event) => setToolForm({ ...toolForm, name: event.target.value })} />
                                </Field>
                                <Field label="Description">
                                    <Textarea rows={4} value={toolForm.description} onChange={(event) => setToolForm({ ...toolForm, description: event.target.value })} />
                                </Field>
                                <Field label="Endpoint URL">
                                    <Input value={toolForm.endpoint_url} onChange={(event) => setToolForm({ ...toolForm, endpoint_url: event.target.value })} placeholder="https://api.example.com/tool" />
                                </Field>
                                <Field label="Method / transport">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Select
                                            value={toolForm.method}
                                            onValueChange={(value) => setToolForm({ ...toolForm, method: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GET">GET</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                                <SelectItem value="PUT">PUT</SelectItem>
                                                <SelectItem value="PATCH">PATCH</SelectItem>
                                                <SelectItem value="DELETE">DELETE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={toolForm.transport}
                                            onValueChange={(value) => setToolForm({ ...toolForm, transport: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="http">HTTP</SelectItem>
                                                <SelectItem value="sse">SSE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </Field>
                                <Field label="Headers JSON">
                                    <Textarea rows={3} value={toolForm.headers} onChange={(event) => setToolForm({ ...toolForm, headers: event.target.value })} />
                                </Field>
                                <Field label="Parameters JSON Schema">
                                    <Textarea rows={5} value={toolForm.parameters} onChange={(event) => setToolForm({ ...toolForm, parameters: event.target.value })} />
                                </Field>
                                <Field label="Extra configuration JSON">
                                    <Textarea rows={4} value={toolForm.configuration} onChange={(event) => setToolForm({ ...toolForm, configuration: event.target.value })} />
                                </Field>
                                <Button type="button" onClick={() => addToolMutation.mutate()} disabled={addToolMutation.isPending || !toolForm.name.trim() || !toolForm.endpoint_url.trim()}>
                                    {addToolMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save tool
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle>Configured tools</CardTitle>
                                <CardDescription>HTTP tools and remote MCP servers available to this widget.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[680px] pr-4">
                                    <div className="space-y-3">
                                        {widget.tools.length ? widget.tools.map((tool) => (
                                            <div key={tool.id} className="rounded-2xl border border-border/60 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-medium text-foreground">{tool.name}</p>
                                                            <Badge variant="outline">{tool.tool_type === 'mcp_server' ? 'MCP' : tool.method}</Badge>
                                                            <Badge variant={tool.is_active ? 'default' : 'secondary'}>
                                                                {tool.is_active ? 'Active' : 'Paused'}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                                                        <p className="mt-2 text-xs text-muted-foreground">{tool.endpoint_url}</p>
                                                    </div>
                                                    <Button type="button" size="sm" variant="ghost" onClick={() => deleteToolMutation.mutate(tool.id)}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                                                No tools configured yet.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>Current widget activity and space for deeper reporting.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <StatCard label="Sessions" value={widget.analytics.sessions} />
                            <StatCard label="Messages" value={widget.analytics.messages} />
                            <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                                Detailed analytics can expand here later.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
    return (
        <div className={className}>
            <Label className="mb-2 block">{label}</Label>
            {children}
            {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-border/60 p-4">
            <div className="text-2xl font-semibold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
        </div>
    );
}

function parseJson(value: string) {
    try {
        return JSON.parse(value);
    } catch {
        return {};
    }
}

async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
}

function xsrfHeader(): Record<string, string> {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? { 'X-XSRF-TOKEN': decodeURIComponent(match[1]) } : {};
}
