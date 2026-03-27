import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

const textPricing = [
    { model: 'kwati-4.20-reasoning', input: '$3.00', output: '$8.00' },
    { model: 'kwati-4.20-non-reasoning', input: '$3.00', output: '$8.00' },
    { model: 'kwati-4.20-multi-agent', input: '$3.00', output: '$8.00' },
    { model: 'kwati-4.1-fast-reasoning', input: '$0.30', output: '$0.75' },
    { model: 'kwati-4.1-fast-non-reasoning', input: '$0.30', output: '$0.75' },
];

const imagePricing = [
    { model: 'kwati-imagine-image', price: '$0.07' },
    { model: 'kwati-imagine-image-pro', price: '$0.12' },
];

export default function PricingDocs() {
    return (
        <DocsLayout>
            <Head title="Pricing" />
            <div className="space-y-10">
                <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,68,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_35%)]" />
                    <div className="relative">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">API / LLM / Pricing</div>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Clear usage pricing for text and image generation.</h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                            Billing uses prepaid USD credits. Text models are billed per 1M input and output tokens, while image models are billed per generated image.
                        </p>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <Highlight label="Billing" value="Prepaid credits" />
                            <Highlight label="Text billing" value="Per 1M tokens" />
                            <Highlight label="Image billing" value="Per image" />
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="rounded-[1.75rem] border border-border bg-card p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-semibold">Text generation pricing</h2>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    These prices apply when calling the chat completions endpoint with Kwati public model IDs.
                                </p>
                            </div>
                            <code className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">
                                /v1/chat/completions
                            </code>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-border">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-4 font-medium">Model</th>
                                        <th className="px-5 py-4 font-medium">Input / 1M</th>
                                        <th className="px-5 py-4 font-medium">Output / 1M</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/70">
                                    {textPricing.map((row) => (
                                        <tr key={row.model}>
                                            <td className="px-5 py-5">
                                                <code className="font-mono text-[13px] text-foreground">{row.model}</code>
                                            </td>
                                            <td className="px-5 py-5 font-semibold text-foreground">{row.input}</td>
                                            <td className="px-5 py-5 font-semibold text-foreground">{row.output}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-[1.75rem] border border-border bg-card p-6">
                            <h2 className="text-2xl font-semibold">Image pricing</h2>
                            <div className="mt-5 space-y-4">
                                {imagePricing.map((row) => (
                                    <div key={row.model} className="rounded-2xl border border-border bg-muted/30 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <code className="font-mono text-sm text-foreground">{row.model}</code>
                                            <span className="text-lg font-semibold text-foreground">{row.price}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">Billed per generated image.</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-border bg-card p-6">
                            <h2 className="text-2xl font-semibold">How billing works</h2>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                                <li>Fund your balance in advance from the developer console.</li>
                                <li>Text requests are charged after token usage is measured.</li>
                                <li>Image requests are charged by generated image count.</li>
                                <li>Each successful request appears in usage and billing history.</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </DocsLayout>
    );
}

function Highlight({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-background/75 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
        </div>
    );
}
