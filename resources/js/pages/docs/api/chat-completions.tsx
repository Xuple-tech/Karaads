import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ChatCompletionsDocs() {
    return (
        <DocsLayout>
            <Head title="Chat Completions" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">API / LLM / Chat Completions</div>
                    <h1 className="mt-2 text-4xl font-semibold">Text generation interface</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                        Use <code>POST /v1/chat/completions</code> for the current text-generation surface. Requests follow an OpenAI-style chat
                        structure with branded model IDs.
                    </p>
                </div>

                <section className="rounded-2xl border border-border bg-card p-6">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-4 text-sm text-background">
{`POST /v1/chat/completions
{
  "model": "kwati-4-fast",
  "messages": [
    { "role": "system", "content": "You are concise." },
    { "role": "user", "content": "Write a short API example." }
  ],
  "temperature": 0.7,
  "max_tokens": 300,
  "stream": false
}`}
                    </pre>
                </section>
            </div>
        </DocsLayout>
    );
}
