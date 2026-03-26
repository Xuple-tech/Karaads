import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function AgentConfigurationDocs() {
    return (
        <DocsLayout>
            <Head title="Agent Configuration" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Agents / Configuration</div>
                    <h1 className="mt-2 text-4xl font-semibold">Configure behavior and deployment defaults</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        Agent configuration should be explicit. Define voice, purpose, business boundaries, escalation behavior, tools, and
                        knowledge sources before you put the widget in production.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    {[
                        ['Identity', 'Set the public name, introduction, and business role the agent should represent.'],
                        ['Behavior', 'Define response style, escalation boundaries, and refusal behavior.'],
                        ['Knowledge', 'Attach the knowledge base and keep high-value operational facts current.'],
                        ['Tools', 'Enable only the tools required for the agent’s job and test them independently.'],
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
