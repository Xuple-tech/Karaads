import { DocsLayout } from '@/layouts/docs-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type SharedProps = {
    console: {
        base_url: string;
        docs_base_url: string;
    };
};

export default function DocsIndex() {
    const { props } = usePage<SharedProps>();
    const docsBaseUrl = props.console.docs_base_url;
    const consoleBaseUrl = props.console.base_url;

    return (
        <DocsLayout>
            <Head title="Developer Documentation" />
            <div className="space-y-10">
                <section className="space-y-4">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Documentation</div>
                    <h1 className="text-5xl font-semibold tracking-tight text-stone-950">Clear docs for agents and API integrations.</h1>
                    <p className="max-w-3xl text-lg text-stone-600">
                        The developer product is split into two tracks. Use the agent docs for website agents, widgets, tools, and knowledge
                        operations. Use the API / LLM docs for model access, authentication, request formats, pricing, and operational usage.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href={consoleBaseUrl} className="rounded bg-stone-950 px-5 py-3 text-sm font-medium text-white">
                            Open Developer Console
                        </Link>
                        <Link href={`${docsBaseUrl}/api`} className="rounded border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900">
                            View API / LLM Docs
                        </Link>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <article className="rounded-2xl border border-stone-200 bg-white p-6">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Agents</div>
                        <h2 className="mt-3 text-2xl font-semibold">Website agents and embedded experiences</h2>
                        <p className="mt-3 text-stone-600">
                            Covers agent creation, widget installation, configuration, templates, tool extensions, and knowledge-base design.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-stone-700">
                            <li>Widget installation and deployment flow</li>
                            <li>Agent configuration and template selection</li>
                            <li>Knowledge-base structure and tool operations</li>
                        </ul>
                        <Link href={`${docsBaseUrl}/agents`} className="mt-6 inline-flex rounded border border-stone-300 px-4 py-2 text-sm font-medium">
                            Open Agents Docs
                        </Link>
                    </article>

                    <article className="rounded-2xl border border-stone-200 bg-white p-6">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM</div>
                        <h2 className="mt-3 text-2xl font-semibold">Branded model API and operational reference</h2>
                        <p className="mt-3 text-stone-600">
                            Covers bearer-key authentication, branded models, chat completions, streaming, pricing, usage, and route reference.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-stone-700">
                            <li>Console auth vs bearer-key API auth</li>
                            <li>API key creation, rotation, and scoped access</li>
                            <li>Implemented `/v1` route reference and examples</li>
                        </ul>
                        <Link href={`${docsBaseUrl}/api`} className="mt-6 inline-flex rounded border border-stone-300 px-4 py-2 text-sm font-medium">
                            Open API / LLM Docs
                        </Link>
                    </article>
                </section>
            </div>
        </DocsLayout>
    );
}
