import React from 'react';
import { Head } from '@inertiajs/react';
import { DocsLayout } from '@/layouts/docs-layout';

export default function DeveloperApiDocs() {
    return (
        <DocsLayout>
            <Head title="Developer Console Docs" />
            <div className="mx-auto max-w-4xl space-y-8 py-10">
                <div>
                    <h1 className="text-4xl font-semibold">Developer Console Docs</h1>
                    <p className="mt-3 text-base text-muted-foreground">
                        Integration reference for the Kwati developer console and its branded API at <code>https://api.your-domain.com/v1</code>.
                    </p>
                </div>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Console vs Docs</h2>
                    <p>
                        Use the developer console to manage keys, usage, wallet credits, and model access. Use this docs section for request formats,
                        auth, streaming examples, and integration guidance.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Authentication</h2>
                    <pre className="overflow-x-auto rounded border bg-black p-4 text-sm text-white">
{`Authorization: Bearer kwati_xxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`}
                    </pre>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Models</h2>
                    <pre className="overflow-x-auto rounded border bg-black p-4 text-sm text-white">
{`GET /v1/models`}
                    </pre>
                    <p>Initial public model IDs: <code>kwati-4</code> and <code>kwati-4-fast</code>.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Chat Completions</h2>
                    <pre className="overflow-x-auto rounded border bg-black p-4 text-sm text-white">
{`POST /v1/chat/completions
{
  "model": "kwati-4-fast",
  "messages": [
    { "role": "user", "content": "Write a short API example." }
  ],
  "temperature": 0.7,
  "max_tokens": 300
}`}
                    </pre>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Streaming</h2>
                    <p>Set <code>stream: true</code> to receive SSE chunks with an OpenAI-like chunk envelope.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Pricing</h2>
                    <p>Pricing is configured per public model in your dashboard and charged from prepaid USD wallet credits.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Disclosure</h2>
                    <p>
                        Kwati AI may use third-party infrastructure or upstream model providers to operate the service. Public API contracts, billing,
                        and support remain managed by Kwati AI.
                    </p>
                </section>
            </div>
        </DocsLayout>
    );
}
