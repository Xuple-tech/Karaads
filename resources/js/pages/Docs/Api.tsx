import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Copy,
    CheckCircle2,
    Terminal,
    Key,
    Zap,
    BookOpen,
    Code2,
    ArrowRight,
    CheckCheck,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiModel {
    public_id: string;
    name: string;
    description: string | null;
    max_context_tokens: number | null;
    supports_streaming: boolean;
    supports_tools: boolean;
}

interface PageProps {
    models: ApiModel[];
    apiBaseUrl: string;
    appName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    function copy() {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    }
    return (
        <button
            onClick={copy}
            className="absolute top-3 right-3 p-1.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy to clipboard"
        >
            {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
    return (
        <div className="relative group">
            <pre className={`bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-lg p-4 text-xs leading-relaxed overflow-x-auto font-mono language-${language}`}>
                {code}
            </pre>
            <CopyButton text={code} />
        </div>
    );
}

function HttpBadge({ method }: { method: 'GET' | 'POST' | 'DELETE' | 'PUT' }) {
    const colors: Record<string, string> = {
        GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        POST: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        PUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    };
    return (
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded font-mono', colors[method])}>
            {method}
        </span>
    );
}

// ─── Section Components ────────────────────────────────────────────────────────

function IntroSection({ appName, apiBaseUrl }: { appName: string; apiBaseUrl: string }) {
    return (
        <section id="intro" className="space-y-4">
            <h2 className="text-2xl font-bold">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
                The {appName} API lets you integrate our AI models into your own applications.
                It is fully compatible with the OpenAI API, so existing OpenAI client libraries
                work out of the box — just point them at our base URL.
            </p>
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-muted-foreground mb-1">Base URL</p>
                    <code className="font-mono text-sm font-semibold">{apiBaseUrl}</code>
                </CardContent>
            </Card>
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
                {[
                    { icon: CheckCircle2, text: 'OpenAI SDK compatible' },
                    { icon: Zap, text: 'Streaming support (SSE)' },
                    { icon: Key, text: 'Prepaid, per-token billing' },
                ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <span>{text}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AuthSection({ apiBaseUrl }: { apiBaseUrl: string }) {
    return (
        <section id="auth" className="space-y-4">
            <h2 className="text-2xl font-bold">Authentication</h2>
            <p className="text-muted-foreground leading-relaxed">
                All API requests must include a Bearer token in the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Authorization</code> header.
                You can create API keys from the <Link href="/developer-api" className="text-primary underline-offset-2 hover:underline">Developer Portal</Link>.
            </p>
            <CodeBlock code={`Authorization: Bearer kwati_xxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
            <div className="grid sm:grid-cols-2 gap-3">
                <Card>
                    <CardContent className="pt-4 pb-3 space-y-1">
                        <p className="text-xs font-medium">Key format</p>
                        <code className="text-xs text-muted-foreground font-mono">kwati_&lt;12 chars&gt;.&lt;40 chars&gt;</code>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 pb-3 space-y-1">
                        <p className="text-xs font-medium">Error on invalid key</p>
                        <code className="text-xs text-muted-foreground">HTTP 401 — invalid_api_key</code>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

function ModelsSection({ models }: { models: ApiModel[] }) {
    return (
        <section id="models" className="space-y-4">
            <h2 className="text-2xl font-bold">Models</h2>
            <p className="text-muted-foreground">
                Use these model IDs in your requests. You can also retrieve them via the API.
            </p>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Model ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Context Window</TableHead>
                            <TableHead>Streaming</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models.map((m) => (
                            <TableRow key={m.public_id}>
                                <TableCell className="font-mono text-xs font-semibold">{m.public_id}</TableCell>
                                <TableCell className="text-sm">{m.name}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {m.max_context_tokens ? `${(m.max_context_tokens / 1000).toFixed(0)}k tokens` : '—'}
                                </TableCell>
                                <TableCell>
                                    {m.supports_streaming
                                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        : <span className="text-muted-foreground text-xs">No</span>}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                                    {m.description ?? '—'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </section>
    );
}

function EndpointsSection({ apiBaseUrl, models }: { apiBaseUrl: string; models: ApiModel[] }) {
    const defaultModel = models[0]?.public_id ?? 'kwati-4';

    const endpoints = [
        {
            id: 'list-models',
            method: 'GET' as const,
            path: '/models',
            title: 'List Models',
            description: 'Returns a list of all available models.',
            request: null,
            response: `{
  "object": "list",
  "data": [
    {
      "id": "${defaultModel}",
      "object": "model",
      "created": 1712620800,
      "owned_by": "${models[0]?.name?.split(' ')[0] ?? 'Kwati'} AI"
    }
  ]
}`,
            curlExample: `curl ${apiBaseUrl}/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        },
        {
            id: 'chat-completions',
            method: 'POST' as const,
            path: '/chat/completions',
            title: 'Chat Completions',
            description: 'Creates a model response for the given conversation.',
            request: `{
  "model": "${defaultModel}",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Explain quantum computing briefly."}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}`,
            response: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1712620800,
  "model": "${defaultModel}",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing uses quantum bits (qubits)..."
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 28,
    "completion_tokens": 64,
    "total_tokens": 92
  }
}`,
            curlExample: `curl -X POST ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${defaultModel}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
        },
        {
            id: 'account',
            method: 'GET' as const,
            path: '/me',
            title: 'Account Info',
            description: 'Returns your account details including wallet balance.',
            request: null,
            response: `{
  "id": "user_abc123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "wallet_balance_usd": 12.5000
}`,
            curlExample: `curl ${apiBaseUrl}/me \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        },
        {
            id: 'usage',
            method: 'GET' as const,
            path: '/usage',
            title: 'Usage Stats',
            description: 'Returns aggregated usage and cost metrics for your account.',
            request: null,
            response: `{
  "total_requests": 142,
  "successful_requests": 141,
  "failed_requests": 1,
  "total_tokens": 84200,
  "total_cost_usd": "0.674560",
  "avg_tokens_per_request": 593
}`,
            curlExample: `curl ${apiBaseUrl}/usage \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        },
    ];

    return (
        <section id="endpoints" className="space-y-8">
            <h2 className="text-2xl font-bold">Endpoints</h2>
            {endpoints.map((ep) => (
                <div key={ep.id} id={ep.id} className="space-y-3 scroll-mt-24">
                    <div className="flex items-center gap-3">
                        <HttpBadge method={ep.method} />
                        <code className="font-mono text-sm font-semibold">{ep.path}</code>
                        <span className="text-muted-foreground text-sm">{ep.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{ep.description}</p>
                    <Tabs defaultValue="curl">
                        <TabsList className="h-8">
                            <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                            {ep.request && <TabsTrigger value="request" className="text-xs">Request Body</TabsTrigger>}
                            <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
                        </TabsList>
                        <TabsContent value="curl">
                            <CodeBlock code={ep.curlExample} />
                        </TabsContent>
                        {ep.request && (
                            <TabsContent value="request">
                                <CodeBlock code={ep.request} language="json" />
                            </TabsContent>
                        )}
                        <TabsContent value="response">
                            <CodeBlock code={ep.response} language="json" />
                        </TabsContent>
                    </Tabs>
                </div>
            ))}
        </section>
    );
}

function StreamingSection({ apiBaseUrl, models }: { apiBaseUrl: string; models: ApiModel[] }) {
    const defaultModel = models[0]?.public_id ?? 'kwati-4';

    const streamExample = `curl -X POST ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${defaultModel}",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'`;

    const streamResponse = `data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","model":"${defaultModel}","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","model":"${defaultModel}","choices":[{"index":0,"delta":{"content":"Once"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","model":"${defaultModel}","choices":[{"index":0,"delta":{"content":" upon"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc","object":"chat.completion.chunk","model":"${defaultModel}","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":14,"completion_tokens":52,"total_tokens":66}}

data: [DONE]`;

    const pythonStream = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiBaseUrl}",
)

stream = client.chat.completions.create(
    model="${defaultModel}",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="", flush=True)`;

    return (
        <section id="streaming" className="space-y-4">
            <h2 className="text-2xl font-bold">Streaming</h2>
            <p className="text-muted-foreground leading-relaxed">
                Set <code className="text-xs bg-muted px-1.5 py-0.5 rounded">"stream": true</code> to receive responses as Server-Sent Events (SSE).
                Each line prefixed with <code className="text-xs bg-muted px-1.5 py-0.5 rounded">data:</code> contains a JSON chunk.
                The stream ends with <code className="text-xs bg-muted px-1.5 py-0.5 rounded">data: [DONE]</code>.
            </p>
            <Tabs defaultValue="curl">
                <TabsList className="h-8">
                    <TabsTrigger value="curl" className="text-xs">cURL Request</TabsTrigger>
                    <TabsTrigger value="response" className="text-xs">SSE Response</TabsTrigger>
                    <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl"><CodeBlock code={streamExample} /></TabsContent>
                <TabsContent value="response"><CodeBlock code={streamResponse} language="text" /></TabsContent>
                <TabsContent value="python"><CodeBlock code={pythonStream} language="python" /></TabsContent>
            </Tabs>
        </section>
    );
}

function ErrorsSection() {
    const errors = [
        { status: 400, code: 'invalid_request_error', description: 'Malformed request or missing required field.' },
        { status: 401, code: 'invalid_api_key', description: 'Missing, expired, or revoked API key.' },
        { status: 402, code: 'insufficient_balance', description: 'Wallet balance too low to complete the request.' },
        { status: 403, code: 'model_not_allowed', description: 'This API key is not permitted to use the requested model.' },
        { status: 404, code: 'model_not_found', description: 'The requested model does not exist or is not active.' },
        { status: 429, code: 'rate_limit_exceeded', description: 'Too many requests. Slow down and retry.' },
        { status: 500, code: 'server_error', description: 'Internal server error. Retry with exponential backoff.' },
    ];

    const errorExample = `{
  "error": {
    "message": "Insufficient balance. Required $0.001200, current balance $0.000800.",
    "type": "insufficient_balance",
    "param": null,
    "code": "insufficient_balance"
  }
}`;

    return (
        <section id="errors" className="space-y-4">
            <h2 className="text-2xl font-bold">Errors</h2>
            <p className="text-muted-foreground">
                All errors follow the OpenAI error format with an <code className="text-xs bg-muted px-1.5 py-0.5 rounded">error</code> object at the root.
            </p>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Status</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {errors.map((e) => (
                            <TableRow key={e.code}>
                                <TableCell>
                                    <span className={cn(
                                        'text-xs font-mono font-bold',
                                        e.status < 500 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {e.status}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{e.code}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{e.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            <CodeBlock code={errorExample} language="json" />
        </section>
    );
}

function SdkSection({ apiBaseUrl, models }: { apiBaseUrl: string; models: ApiModel[] }) {
    const model = models[0]?.public_id ?? 'kwati-4';

    const python = `pip install openai`;
    const pythonCode = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiBaseUrl}",
)

response = client.chat.completions.create(
    model="${model}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the speed of light?"},
    ],
)

print(response.choices[0].message.content)
`;

    const node = `npm install openai`;
    const nodeCode = `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${apiBaseUrl}',
});

const response = await client.chat.completions.create({
  model: '${model}',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the speed of light?' },
  ],
});

console.log(response.choices[0].message.content);
`;

    return (
        <section id="sdks" className="space-y-4">
            <h2 className="text-2xl font-bold">SDK Examples</h2>
            <p className="text-muted-foreground">
                Any OpenAI-compatible SDK works by setting the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">base_url</code> /
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded"> baseURL</code> parameter.
            </p>
            <Tabs defaultValue="python">
                <TabsList className="h-8">
                    <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                    <TabsTrigger value="node" className="text-xs">Node.js / TypeScript</TabsTrigger>
                </TabsList>
                <TabsContent value="python" className="space-y-2">
                    <CodeBlock code={python} />
                    <CodeBlock code={pythonCode} language="python" />
                </TabsContent>
                <TabsContent value="node" className="space-y-2">
                    <CodeBlock code={node} />
                    <CodeBlock code={nodeCode} language="javascript" />
                </TabsContent>
            </Tabs>
        </section>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiDocs({ models, apiBaseUrl, appName }: PageProps) {
    const navItems = [
        { id: 'intro', label: 'Introduction' },
        { id: 'auth', label: 'Authentication' },
        { id: 'models', label: 'Models' },
        { id: 'endpoints', label: 'Endpoints' },
        { id: 'streaming', label: 'Streaming' },
        { id: 'errors', label: 'Errors' },
        { id: 'sdks', label: 'SDK Examples' },
    ];

    return (
        <>
            <Head title={`API Reference — ${appName}`} />

            {/* Minimal nav header */}
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-lg font-bold tracking-tight">{appName}</Link>
                        <Badge variant="outline" className="text-xs">API Docs</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/developer-api"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            Developer Portal <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Button size="sm" asChild>
                            <Link href="/register">Get API Key</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-10">
                {/* Sidebar nav */}
                <aside className="hidden lg:block w-52 shrink-0">
                    <div className="sticky top-24 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Reference
                        </p>
                        {navItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                            >
                                {item.label}
                            </a>
                        ))}
                        <div className="pt-4 border-t mt-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Endpoints
                            </p>
                            {[
                                { id: 'list-models', label: 'List Models', method: 'GET' },
                                { id: 'chat-completions', label: 'Chat Completions', method: 'POST' },
                                { id: 'account', label: 'Account Info', method: 'GET' },
                                { id: 'usage', label: 'Usage Stats', method: 'GET' },
                            ].map((ep) => (
                                <a
                                    key={ep.id}
                                    href={`#${ep.id}`}
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                                >
                                    <span className={cn(
                                        'font-bold font-mono',
                                        ep.method === 'GET' && 'text-blue-500',
                                        ep.method === 'POST' && 'text-green-500',
                                    )}>
                                        {ep.method}
                                    </span>
                                    {ep.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="min-w-0 flex-1 space-y-16">
                    {/* Hero */}
                    <div className="space-y-3 pb-6 border-b">
                        <Badge className="text-xs">v1</Badge>
                        <h1 className="text-4xl font-extrabold tracking-tight">{appName} API Reference</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            A powerful, OpenAI-compatible AI API. Build intelligent applications
                            using state-of-the-art language models with simple REST calls.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <Button asChild>
                                <Link href="/register" className="flex items-center gap-1.5">
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/developer-api">Developer Portal</Link>
                            </Button>
                        </div>
                    </div>

                    <IntroSection appName={appName} apiBaseUrl={apiBaseUrl} />
                    <AuthSection apiBaseUrl={apiBaseUrl} />
                    <ModelsSection models={models} />
                    <EndpointsSection apiBaseUrl={apiBaseUrl} models={models} />
                    <StreamingSection apiBaseUrl={apiBaseUrl} models={models} />
                    <ErrorsSection />
                    <SdkSection apiBaseUrl={apiBaseUrl} models={models} />
                </main>
            </div>
        </>
    );
}
