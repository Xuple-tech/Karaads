import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ApiKeysDocs() {
    return (
        <DocsLayout>
            <Head title="API Keys" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Keys</div>
                    <h1 className="mt-2 text-4xl font-semibold">API key lifecycle</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        Keys are created and rotated in the developer console. The plaintext secret is shown once. After that, only the key prefix
                        remains visible in the console and logs.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    {[
                        ['Create', 'Create a named key, optionally set expiry, notes, and model scopes.'],
                        ['Reveal once', 'Store the secret immediately. The plaintext value is not recoverable later.'],
                        ['Rotate', 'Regeneration issues a new secret and invalidates the previous one.'],
                        ['Revoke', 'Revoked keys stop authenticating immediately.'],
                        ['Scope', 'Restrict keys to selected branded public model IDs when needed.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
                            <div className="text-lg font-semibold">{title}</div>
                            <p className="mt-2 text-sm text-stone-600">{body}</p>
                        </div>
                    ))}
                </section>
            </div>
        </DocsLayout>
    );
}
