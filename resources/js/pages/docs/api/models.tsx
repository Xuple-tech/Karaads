import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

const textModels = [
    {
        id: 'kwati-4.20-reasoning',
        family: 'Flagship text',
        capability: 'Reasoning',
        context: '2,000,000 tokens',
        limits: '4M TPM / 600 RPM',
        bestFor: 'deep reasoning, long-context analysis, multi-step tasks',
    },
    {
        id: 'kwati-4.20-non-reasoning',
        family: 'Flagship text',
        capability: 'Non-reasoning',
        context: '2,000,000 tokens',
        limits: '4M TPM / 600 RPM',
        bestFor: 'large-scale generation without reasoning overhead',
    },
    {
        id: 'kwati-4.20-multi-agent',
        family: 'Flagship text',
        capability: 'Multi-agent',
        context: '2,000,000 tokens',
        limits: '4M TPM / 600 RPM',
        bestFor: 'agent coordination and complex orchestration',
    },
    {
        id: 'kwati-4.1-fast-reasoning',
        family: 'Fast text',
        capability: 'Reasoning',
        context: '2,000,000 tokens',
        limits: '4M TPM / 600 RPM',
        bestFor: 'responsive reasoning and interactive tasks',
    },
    {
        id: 'kwati-4.1-fast-non-reasoning',
        family: 'Fast text',
        capability: 'Non-reasoning',
        context: '2,000,000 tokens',
        limits: '4M TPM / 600 RPM',
        bestFor: 'lower-latency general text generation',
    },
];

const imageModels = [
    {
        id: 'kwati-imagine-image',
        className: 'Image generation',
        limits: '300 RPM / 5 RPS',
        bestFor: 'standard production image generation',
    },
    {
        id: 'kwati-imagine-image-pro',
        className: 'Premium image generation',
        limits: '30 RPM / 1 RPS',
        bestFor: 'higher-quality image output',
    },
];

export default function ApiModelsDocs() {
    return (
        <DocsLayout>
            <Head title="API Models" />
            <div className="space-y-10">
                <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                    <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(109,68,255,0.18),transparent_48%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_42%)]" />
                    <div className="relative">
                        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">API / LLM / Models</div>
                        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-foreground">
                            A clean public catalog for text and image generation.
                        </h1>
                        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                            Use Kwati public model IDs across text and image workflows. The catalog is organized by model family, capability style, and intended workload.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3 text-sm">
                            <Pill>Flagship text</Pill>
                            <Pill>Fast text</Pill>
                            <Pill>Image generation</Pill>
                            <Pill>Reasoning and non-reasoning</Pill>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Text models</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                                Choose reasoning models for deeper multi-step tasks. Choose non-reasoning models when you want faster direct generation behavior.
                            </p>
                        </div>
                        <code className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">
                            POST /v1/chat/completions
                        </code>
                    </div>
                    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Model</th>
                                    <th className="px-5 py-4 font-medium">Family</th>
                                    <th className="px-5 py-4 font-medium">Capability</th>
                                    <th className="px-5 py-4 font-medium">Context</th>
                                    <th className="px-5 py-4 font-medium">Rate Limits</th>
                                    <th className="px-5 py-4 font-medium">Best For</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/70">
                                {textModels.map((model) => (
                                    <tr key={model.id} className="align-top">
                                        <td className="px-5 py-5">
                                            <code className="font-mono text-[13px] text-foreground">{model.id}</code>
                                        </td>
                                        <td className="px-5 py-5 text-foreground">{model.family}</td>
                                        <td className="px-5 py-5">
                                            <span className="inline-flex rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                                                {model.capability}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-foreground">{model.context}</td>
                                        <td className="px-5 py-5 text-muted-foreground">{model.limits}</td>
                                        <td className="px-5 py-5 text-muted-foreground">{model.bestFor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Image models</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                                Use image models only for image generation requests. These models are optimized for visual output rather than chat completions.
                            </p>
                        </div>
                        <code className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground">
                            POST /v1/images/generations
                        </code>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {imageModels.map((model) => (
                            <article key={model.id} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{model.className}</div>
                                <h3 className="mt-2 font-mono text-sm font-semibold text-foreground">{model.id}</h3>
                                <div className="mt-5 grid gap-3">
                                    <InfoCard label="Rate Limits" value={model.limits} />
                                    <InfoCard label="Best For" value={model.bestFor} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </DocsLayout>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground">
            {children}
        </span>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-muted/35 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-sm text-foreground">{value}</div>
        </div>
    );
}
