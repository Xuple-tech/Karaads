import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ApiReferenceDocs() {
    return (
        <DocsLayout>
            <Head title="API Reference" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">API / LLM / Reference</div>
                    <h1 className="mt-2 text-4xl font-semibold">Implemented route reference</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">Only the currently implemented routes are documented here.</p>
                </div>

                <section className="rounded-2xl border border-border bg-card p-6">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2 pr-4">Method</th>
                                <th className="py-2 pr-4">Path</th>
                                <th className="py-2">Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['GET', '/v1/models', 'List branded public model IDs available to the calling key.'],
                                ['POST', '/v1/chat/completions', 'Create a text completion response, optionally streamed.'],
                                ['GET', '/v1/usage', 'Return usage summary for the authenticated developer key/account.'],
                                ['GET', '/v1/me', 'Return key/account metadata and current wallet state.'],
                            ].map(([method, path, purpose]) => (
                                <tr key={path} className="border-b align-top">
                                    <td className="py-3 pr-4 font-mono">{method}</td>
                                    <td className="py-3 pr-4 font-mono">{path}</td>
                                    <td className="py-3">{purpose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </DocsLayout>
    );
}
