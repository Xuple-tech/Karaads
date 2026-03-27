import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function StreamingDocs() {
    return (
        <DocsLayout>
            <Head title="Streaming" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">API / LLM / Streaming</div>
                    <h1 className="mt-2 text-4xl font-semibold">Server-sent event streaming</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                        Set <code>stream: true</code> to receive server-sent event chunks. The API emits an OpenAI-like chunk envelope until the
                        response completes.
                    </p>
                </div>

                <section className="rounded-2xl border border-border bg-card p-6">
                    <pre className="overflow-x-auto rounded-xl bg-foreground p-4 text-sm text-background">
{`POST /v1/chat/completions
{
  "model": "kwati-4",
  "messages": [{ "role": "user", "content": "Stream the answer." }],
  "stream": true
}`}
                    </pre>
                </section>
            </div>
        </DocsLayout>
    );
}
