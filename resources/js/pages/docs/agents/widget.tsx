import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function WidgetDocs() {
    return (
        <DocsLayout>
            <Head title="Agent Widget" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Agents / Widget</div>
                    <h1 className="mt-2 text-4xl font-semibold">Install the website widget</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                        Use the widget when you want a hosted website agent embedded into an existing site. The typical flow is: create the agent,
                        configure the widget, copy the embed snippet, test, and then deploy.
                    </p>
                </div>

                <section className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="text-2xl font-semibold">Embed snippet</h2>
                    <pre className="mt-4 overflow-x-auto rounded-xl bg-foreground p-4 text-sm text-background">
{`<script src="https://kwatiai.com/widget/v1/script.js"></script>
<script>
  window.AIChatWidget.init({
    agentSlug: "your-agent-slug",
    position: "bottom-right",
    botName: "Support",
    primaryColor: "#111827"
  });
</script>`}
                    </pre>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    {[
                        ['1. Create the agent', 'Provision the site and agent in the product before embedding.'],
                        ['2. Configure widget defaults', 'Set appearance, position, behavior, and allowed capabilities.'],
                        ['3. Test before launch', 'Verify load, conversation flow, and browser compatibility on a staging page.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-2xl border border-border bg-card p-5">
                            <div className="font-semibold">{title}</div>
                            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </section>
            </div>
        </DocsLayout>
    );
}
