import React from 'react';
import { usePage } from '@inertiajs/react';
import DeveloperPortalLayout from '@/layouts/developer-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Terminal, BookOpen, Copy, CheckCircle2, XCircle, CircleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import type { SharedData } from '@/types';
import { developerPortalUrl, normalizeDeveloperPortalBaseUrl } from '@/lib/developer-portal-url';

interface ApiModel {
    id: string;
    public_id: string;
    name: string;
    description: string | null;
    max_context_tokens: number | null;
    supports_streaming: boolean;
    supports_tools: boolean;
}

interface PageProps {
    apiBaseUrl: string;
    models: ApiModel[];
}

function copyToClipboard(text: string, label = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function CodeBlock({ code }: { code: string }) {
    return (
        <div className="relative group">
            <pre className="bg-muted rounded-md p-4 overflow-x-auto font-mono text-xs leading-relaxed">{code}</pre>
            <button
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(code, 'Copied!')}
                title="Copy code"
            >
                <Copy className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}

export default function DeveloperApiQuickstart({ apiBaseUrl, models }: PageProps) {
    const { developerPortal } = usePage<SharedData>().props;
    const baseUrl = normalizeDeveloperPortalBaseUrl(developerPortal?.base_url);
    const defaultModel = models[0]?.public_id ?? 'kwati-4';

    const curlExample = `curl -X POST ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${defaultModel}",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`;

    const pythonExample = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiBaseUrl}",
)

response = client.chat.completions.create(
    model="${defaultModel}",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`;

    const nodeExample = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${apiBaseUrl}",
});

const response = await client.chat.completions.create({
  model: "${defaultModel}",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

    return (
        <DeveloperPortalLayout title="Quickstart">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold">Quickstart</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Get up and running with the Kwati API in minutes.
                    </p>
                </div>

                <Alert>
                    <Terminal className="w-4 h-4" />
                    <AlertDescription>
                        The API is fully compatible with the <strong>OpenAI SDK</strong>. Point{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">base_url</code> to{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{apiBaseUrl}</code> and use your Kwati API key.
                    </AlertDescription>
                </Alert>

                {/* Step 1 */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">1</span>
                        Create an API Key
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Go to{' '}
                        <a href={developerPortalUrl(baseUrl, 'keys')} className="text-primary underline underline-offset-2">
                            API Keys
                        </a>{' '}
                        and create your first key. Store it securely — it will only be shown once.
                    </p>
                </section>

                {/* Step 2 */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">2</span>
                        Make your first request
                    </h2>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> cURL
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CodeBlock code={curlExample} />
                        </CardContent>
                    </Card>
                </section>

                {/* Step 3 — SDK examples */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">3</span>
                        Use an SDK
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Install the OpenAI SDK and point it at the Kwati API.
                    </p>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Python (openai)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <CodeBlock code="pip install openai" />
                            <CodeBlock code={pythonExample} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Node.js / TypeScript (openai)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <CodeBlock code="npm install openai" />
                            <CodeBlock code={nodeExample} />
                        </CardContent>
                    </Card>
                </section>

                {/* Streaming */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">Streaming</h2>
                    <Alert>
                        <CircleAlert className="w-4 h-4" />
                        <AlertDescription>
                            Streaming is not available on the Kwati Developer API yet. For now, use standard chat completion requests without <code className="text-xs bg-muted px-1 py-0.5 rounded">stream=true</code>.
                        </AlertDescription>
                    </Alert>
                </section>

                {/* Models table */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">Available Models</h2>
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Context</TableHead>
                                        <TableHead>Streaming</TableHead>
                                        <TableHead>Tools</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.map((m) => (
                                        <TableRow key={m.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="font-mono text-xs">{m.public_id}</code>
                                                    <button onClick={() => copyToClipboard(m.public_id, 'Model ID copied!')}>
                                                        <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{m.name}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {m.max_context_tokens ? `${(m.max_context_tokens / 1000).toFixed(0)}k` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {m.supports_streaming ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {m.supports_tools ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </section>

                {/* API Reference */}
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">API Reference</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { method: 'POST', path: '/chat/completions', desc: 'Create a chat completion' },
                            { method: 'GET', path: '/models', desc: 'List available models' },
                        ].map((e) => (
                            <Card key={e.path}>
                                <CardContent className="py-3 flex items-center gap-3">
                                    <Badge variant={e.method === 'POST' ? 'default' : 'secondary'} className="font-mono shrink-0">
                                        {e.method}
                                    </Badge>
                                    <div>
                                        <code className="font-mono text-xs">{apiBaseUrl}{e.path}</code>
                                        <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </DeveloperPortalLayout>
    );
}
