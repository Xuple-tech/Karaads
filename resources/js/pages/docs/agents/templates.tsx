import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function AgentTemplatesDocs() {
    return (
        <DocsLayout>
            <Head title="Agent Templates" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Agents / Templates</div>
                    <h1 className="mt-2 text-4xl font-semibold">Start from repeatable agent templates</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                        Templates should reduce setup time, not hide product decisions. Use them as structured starting points for support, sales,
                        lead qualification, or internal operations.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    {[
                        ['Support agent', 'Optimized for issue triage, answers from knowledge base, and escalation.'],
                        ['Sales agent', 'Optimized for qualification, pricing questions, and lead capture.'],
                        ['Operations agent', 'Optimized for workflows that depend on controlled tool usage.'],
                        ['Custom template', 'Start from a blank operational profile when a standard template is too restrictive.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-border bg-card p-5">
                            <div className="text-lg font-semibold">{title}</div>
                            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </section>
            </div>
        </DocsLayout>
    );
}
