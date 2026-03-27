import { DocsLayout } from '@/layouts/docs-layout';
import { Head, Link, usePage } from '@inertiajs/react';

type SharedProps = {
    console: {
        docs_base_url: string;
    };
};

export default function AgentsDocsIndex() {
    const { props } = usePage<SharedProps>();
    const base = `${props.console.docs_base_url}/agents`;

    return (
        <DocsLayout>
            <Head title="Agents Docs" />
            <div className="space-y-8">
                <div className="space-y-3">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Agents</div>
                    <h1 className="text-4xl font-semibold">Agent documentation</h1>
                    <p className="max-w-3xl text-lg text-muted-foreground">
                        This section covers the website-agent product only: widget setup, agent configuration, reusable templates, tool extensions,
                        and knowledge-base operations.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[
                        ['Widget', `${base}/widget`, 'Install the web widget and ship the embed flow cleanly.'],
                        ['Configuration', `${base}/configuration`, 'Set behavior, appearance, guardrails, and deployment defaults.'],
                        ['Templates', `${base}/templates`, 'Start from reusable agent patterns for common business use cases.'],
                        ['Knowledge Base', `${base}/knowledge-base`, 'Organize facts, policy, and structured context for retrieval.'],
                        ['Tools', `${base}/tools`, 'Extend the agent with operational tools and external actions.'],
                    ].map(([title, href, description]) => (
                        <Link key={href} href={href} className="rounded-2xl border border-border bg-card p-5 transition hover:border-border">
                            <div className="text-lg font-semibold">{title}</div>
                            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </DocsLayout>
    );
}
