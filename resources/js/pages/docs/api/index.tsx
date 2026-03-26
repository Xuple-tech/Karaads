import { DocsLayout } from '@/layouts/docs-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type SharedProps = {
    console: {
        base_url: string;
        docs_base_url: string;
    };
};

export default function ApiDocsIndex() {
    const { props } = usePage<SharedProps>();
    const docsBaseUrl = `${props.console.docs_base_url}/api`;
    const consoleBaseUrl = props.console.base_url;

    return (
        <DocsLayout>
            <Head title="API / LLM Docs" />
            <div className="space-y-8">
                <div className="space-y-3">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM</div>
                    <h1 className="text-4xl font-semibold">Developer API documentation</h1>
                    <p className="max-w-3xl text-lg text-stone-600">
                        The API is a branded model surface exposed at <code>https://api.your-domain.com/v1</code>. Manage keys, wallet credits, and
                        access controls in the developer console. Use bearer keys for API requests.
                    </p>
                    <div className="flex gap-3">
                        <Link href={consoleBaseUrl} className="rounded bg-stone-950 px-4 py-2 text-sm font-medium text-white">
                            Open Console
                        </Link>
                        <Link href={`${docsBaseUrl}/reference`} className="rounded border border-stone-300 px-4 py-2 text-sm font-medium">
                            API Reference
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[
                        ['Authentication', `${docsBaseUrl}/authentication`],
                        ['API Keys', `${docsBaseUrl}/keys`],
                        ['Models', `${docsBaseUrl}/models`],
                        ['Chat Completions', `${docsBaseUrl}/chat-completions`],
                        ['Streaming', `${docsBaseUrl}/streaming`],
                        ['Usage', `${docsBaseUrl}/usage`],
                        ['Errors', `${docsBaseUrl}/errors`],
                        ['Pricing', `${docsBaseUrl}/pricing`],
                        ['Reference', `${docsBaseUrl}/reference`],
                    ].map(([title, href]) => (
                        <Link key={href} href={href} className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-400">
                            <div className="text-lg font-semibold">{title}</div>
                            <p className="mt-2 text-sm text-stone-600">Open the {title.toLowerCase()} page.</p>
                        </Link>
                    ))}
                </div>
            </div>
        </DocsLayout>
    );
}
