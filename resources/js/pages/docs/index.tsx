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
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Documentation</div>
                    <h1 className="text-5xl font-semibold tracking-tight text-foreground">Clear docs for agents and API integrations.</h1>
                    <p className="max-w-3xl text-lg text-muted-foreground">
                        The developer product is split into two tracks. Use the agent docs for website agents, widgets, tools, and knowledge
                        operations. Use the API / LLM docs for model access, authentication, request formats, pricing, and operational usage.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link href={consoleBaseUrl} className="rounded bg-foreground px-5 py-3 text-sm font-medium text-white">
                            Open Developer Console
                        </Link>
                        <Link href={`${docsBaseUrl}/api`} className="rounded border border-border px-5 py-3 text-sm font-medium text-foreground">
                            View API / LLM Docs
                        </Link>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <article className="rounded-2xl border border-border bg-card p-6">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Agents</div>
                        <h2 className="mt-3 text-2xl font-semibold">Website agents and embedded experiences</h2>
                        <p className="mt-3 text-muted-foreground">
                            Covers agent creation, widget installation, configuration, templates, tool extensions, and knowledge-base design.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground">
                            <li>Widget installation and deployment flow</li>
                            <li>Agent configuration and template selection</li>
                            <li>Knowledge-base structure and tool operations</li>
                        </ul>
                        <Link href={`${docsBaseUrl}/agents`} className="mt-6 inline-flex rounded border border-border px-4 py-2 text-sm font-medium">
                            Open Agents Docs
                        </Link>
                    </article>

                    <article className="rounded-2xl border border-border bg-card p-6">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">API / LLM</div>
                        <h2 className="mt-3 text-2xl font-semibold">Branded model API and operational reference</h2>
                        <p className="mt-3 text-muted-foreground">
                            Covers bearer-key authentication, branded models, chat completions, streaming, pricing, usage, and route reference.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground">
                            <li>Console auth vs bearer-key API auth</li>
                            <li>API key creation, rotation, and scoped access</li>
                            <li>Implemented `/v1` route reference and examples</li>
                        </ul>
                        <Link href={`${docsBaseUrl}/api`} className="mt-6 inline-flex rounded border border-border px-4 py-2 text-sm font-medium">
                            Open API / LLM Docs
                        </Link>
                    </article>
                </section>
            </div>
        </DocsLayout>
    );
}
