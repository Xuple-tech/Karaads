import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, PlugZap, Send, Wrench } from 'lucide-react';

type WorkspaceProject = {
    id: string;
    title: string;
    description?: string | null;
    status?: string | null;
    visibility?: string | null;
    conversations_count?: number;
    agents_count?: number;
    tools_count?: number;
    mcp_servers_count?: number;
};

type Conversation = { id: string; title: string };
type Message = { id: string; role: string; content: string };
type Agent = { id: string; name: string; instructions?: string | null; status: string; enabled_tools?: string[] };
type Tool = { id: string; name: string; slug: string; handler: string; status: string };
type McpServer = { id: string; name: string; slug: string; type: string; status: string };

export default function WorkspaceShow({ project }: { project: WorkspaceProject }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [servers, setServers] = useState<McpServer[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [message, setMessage] = useState('');
    const [conversationTitle, setConversationTitle] = useState('General');
    const [agentForm, setAgentForm] = useState({ name: '', instructions: '', enabled_tools: '' });
    const [toolForm, setToolForm] = useState({ name: '', slug: '', handler: 'echo' });
    const [serverForm, setServerForm] = useState({ name: '', slug: '', endpoint: '' });

    useEffect(() => {
        void bootstrap();
    }, []);

    async function bootstrap() {
        const [conversationData, agentData, toolData, serverData] = await Promise.all([
            api(`/api/workspace/projects/${project.id}/chat/conversations`),
            api(`/api/workspace/projects/${project.id}/agents`),
            api(`/api/workspace/projects/${project.id}/tools`),
            api(`/api/workspace/projects/${project.id}/mcp/servers`),
        ]);

        setConversations(conversationData.data ?? []);
        setAgents(agentData.data ?? []);
        setTools(toolData.data ?? []);
        setServers(serverData.data ?? []);

        const firstConversation = conversationData.data?.[0];
        if (firstConversation) {
            setActiveConversationId(firstConversation.id);
            void loadMessages(firstConversation.id);
        }
    }

    async function loadMessages(conversationId: string) {
        const payload = await api(`/api/workspace/projects/${project.id}/chat/conversations/${conversationId}/messages`);
        setMessages(payload.data ?? []);
        setActiveConversationId(conversationId);
    }

    async function createConversation() {
        const payload = await api(`/api/workspace/projects/${project.id}/chat/conversations`, 'POST', {
            title: conversationTitle,
        });

        const next = payload.data as Conversation;
        setConversations((current) => [next, ...current]);
        setConversationTitle('General');
        await loadMessages(next.id);
    }

    async function sendMessage() {
        if (!activeConversationId || !message.trim()) {
            return;
        }

        await api(`/api/workspace/projects/${project.id}/chat/conversations/${activeConversationId}/messages`, 'POST', {
            content: message,
            agent_id: selectedAgentId || undefined,
        });

        setMessage('');
        await loadMessages(activeConversationId);
    }

    async function createAgent() {
        const payload = await api(`/api/workspace/projects/${project.id}/agents`, 'POST', {
            name: agentForm.name,
            instructions: agentForm.instructions,
            enabled_tools: agentForm.enabled_tools
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean),
        });

        setAgents((current) => [...current, payload.data]);
        setAgentForm({ name: '', instructions: '', enabled_tools: '' });
    }

    async function createTool() {
        const payload = await api(`/api/workspace/projects/${project.id}/tools`, 'POST', toolForm);
        setTools((current) => [...current, payload.data]);
        setToolForm({ name: '', slug: '', handler: 'echo' });
    }

    async function createServer() {
        const payload = await api(`/api/workspace/projects/${project.id}/mcp/servers`, 'POST', {
            ...serverForm,
            type: serverForm.endpoint ? 'external' : 'internal',
        });
        setServers((current) => [...current, payload.data]);
        setServerForm({ name: '', slug: '', endpoint: '' });
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Workspace', href: '/workspace' },
                { title: project.title, href: `/workspace/${project.id}` },
            ]}
        >
            <Head title={project.title} />
            <div className="space-y-8">
                <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <Card className="border-0 bg-[linear-gradient(135deg,_#111827,_#1f2937_55%,_#334155)] text-white shadow-xl">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-3xl tracking-tight">{project.title}</CardTitle>
                                    <CardDescription className="mt-2 max-w-2xl text-slate-200">
                                        {project.description || 'Workspace project on the rebuilt core.'}
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="border border-white/10 bg-white/10 text-white">
                                    {project.status ?? 'active'}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                    <div className="grid grid-cols-2 gap-4">
                        <PanelStat icon={MessageSquare} label="Conversations" value={project.conversations_count ?? conversations.length} />
                        <PanelStat icon={Bot} label="Agents" value={project.agents_count ?? agents.length} />
                        <PanelStat icon={Wrench} label="Tools" value={project.tools_count ?? tools.length} />
                        <PanelStat icon={PlugZap} label="MCP Servers" value={project.mcp_servers_count ?? servers.length} />
                    </div>
                </section>

                <Tabs defaultValue="chat" className="space-y-5">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                        <TabsTrigger value="tools">Tools</TabsTrigger>
                        <TabsTrigger value="mcp">MCP</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat" className="grid gap-5 xl:grid-cols-[320px_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Conversations</CardTitle>
                                <CardDescription>Create and switch project conversations.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={conversationTitle} onChange={(event) => setConversationTitle(event.target.value)} />
                                    <Button onClick={createConversation}>Add</Button>
                                </div>
                                <div className="space-y-2">
                                    {conversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() => void loadMessages(conversation.id)}
                                            className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                                                conversation.id === activeConversationId ? 'border-slate-900 bg-slate-900 text-white' : 'bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            {conversation.title}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Project Chat</CardTitle>
                                <CardDescription>Send messages directly into the rebuilt workspace conversation flow.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
                                    {messages.length > 0 ? (
                                        messages.map((item) => (
                                            <div key={item.id} className={`rounded-2xl px-4 py-3 text-sm ${item.role === 'assistant' ? 'bg-white' : 'bg-amber-50'}`}>
                                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{item.role}</p>
                                                <p className="whitespace-pre-wrap text-slate-900">{item.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No messages yet.</p>
                                    )}
                                </div>
                                <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                                    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask the project agent something..." />
                                    <div className="space-y-3">
                                        <Label htmlFor="agent-select">Agent</Label>
                                        <select
                                            id="agent-select"
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                            value={selectedAgentId}
                                            onChange={(event) => setSelectedAgentId(event.target.value)}
                                        >
                                            <option value="">No agent</option>
                                            {agents.map((agent) => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Button className="w-full gap-2" onClick={sendMessage}>
                                            <Send className="h-4 w-4" />
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="agents">
                        <Card>
                            <CardHeader>
                                <CardTitle>Agents</CardTitle>
                                <CardDescription>Create simplified v1 project agents with instructions and enabled tools.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 xl:grid-cols-[360px_1fr]">
                                <div className="space-y-3">
                                    <Input placeholder="Agent name" value={agentForm.name} onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value }))} />
                                    <Textarea placeholder="Instructions" value={agentForm.instructions} onChange={(event) => setAgentForm((current) => ({ ...current, instructions: event.target.value }))} />
                                    <Input
                                        placeholder="Enabled tools, comma separated"
                                        value={agentForm.enabled_tools}
                                        onChange={(event) => setAgentForm((current) => ({ ...current, enabled_tools: event.target.value }))}
                                    />
                                    <Button onClick={createAgent}>Create Agent</Button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {agents.map((agent) => (
                                        <Card key={agent.id} className="border-slate-200/70">
                                            <CardHeader>
                                                <CardTitle className="text-base">{agent.name}</CardTitle>
                                                <CardDescription>{agent.instructions || 'No instructions yet.'}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm">
                                                <Badge variant="outline">{agent.status}</Badge>
                                                <p className="text-muted-foreground">Tools: {(agent.enabled_tools ?? []).join(', ') || 'None'}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tools">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tools</CardTitle>
                                <CardDescription>Register internal tools that agents and MCP can expose.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 xl:grid-cols-[320px_1fr]">
                                <div className="space-y-3">
                                    <Input placeholder="Tool name" value={toolForm.name} onChange={(event) => setToolForm((current) => ({ ...current, name: event.target.value }))} />
                                    <Input placeholder="Slug" value={toolForm.slug} onChange={(event) => setToolForm((current) => ({ ...current, slug: event.target.value }))} />
                                    <Input placeholder="Handler" value={toolForm.handler} onChange={(event) => setToolForm((current) => ({ ...current, handler: event.target.value }))} />
                                    <Button onClick={createTool}>Create Tool</Button>
                                </div>
                                <div className="space-y-3">
                                    {tools.map((tool) => (
                                        <div key={tool.id} className="rounded-2xl border px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">{tool.name}</p>
                                                    <p className="text-sm text-muted-foreground">{tool.slug}</p>
                                                </div>
                                                <Badge variant="outline">{tool.handler}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mcp">
                        <Card>
                            <CardHeader>
                                <CardTitle>MCP</CardTitle>
                                <CardDescription>Attach project-scoped MCP servers backed by the rebuilt gateway.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 xl:grid-cols-[320px_1fr]">
                                <div className="space-y-3">
                                    <Input placeholder="Server name" value={serverForm.name} onChange={(event) => setServerForm((current) => ({ ...current, name: event.target.value }))} />
                                    <Input placeholder="Slug" value={serverForm.slug} onChange={(event) => setServerForm((current) => ({ ...current, slug: event.target.value }))} />
                                    <Input placeholder="Endpoint (optional)" value={serverForm.endpoint} onChange={(event) => setServerForm((current) => ({ ...current, endpoint: event.target.value }))} />
                                    <Button onClick={createServer}>Attach MCP Server</Button>
                                </div>
                                <div className="space-y-3">
                                    {servers.map((server) => (
                                        <div key={server.id} className="rounded-2xl border px-4 py-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">{server.name}</p>
                                                    <p className="text-sm text-muted-foreground">{server.slug}</p>
                                                </div>
                                                <Badge variant="outline">{server.type}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function PanelStat({ icon: Icon, label, value }: { icon: typeof Bot; label: string; value: number }) {
    return (
        <Card className="border-slate-200/70">
            <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

async function api(url: string, method = 'GET', body?: unknown) {
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.message || `Request failed for ${url}`);
    }

    return payload;
}
