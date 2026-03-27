import React, { useMemo } from 'react';
import { ArrowUpRight, BrainCircuit, Image as ImageIcon, Layers3, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ApiModel } from '../types';

type Props = {
    models: ApiModel[];
    docsUrl: string;
};

export function ModelsSection({ models, docsUrl }: Props) {
    const groups = useMemo(() => {
        const textModels = models.filter((model) => model.model_type === 'text');
        const imageModels = models.filter((model) => model.model_type === 'image');

        return {
            flagship: textModels.filter((model) => model.public_id.includes('4.20')),
            fast: textModels.filter((model) => model.public_id.includes('4.1') || model.public_id === 'kwati-4-fast'),
            image: imageModels,
        };
    }, [models]);

    if (!models.length) {
        return (
            <div className="rounded-[1.75rem] border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No models are currently available.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-7 py-8 shadow-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,68,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]" />
                <div className="relative">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Model Catalog</div>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                        Reasoning, speed, and image generation in one clean catalog.
                    </h2>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                        The catalog is split into flagship reasoning models, fast lower-latency models, and dedicated image generation models.
                        Prices shown here are the public Kwati API prices for each model family.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <MetricPill label="Text models" value={String(models.filter((model) => model.model_type === 'text').length)} />
                        <MetricPill label="Image models" value={String(models.filter((model) => model.model_type === 'image').length)} />
                        <MetricPill label="Reasoning tiers" value={String(models.filter((model) => model.supports_reasoning).length)} />
                    </div>
                </div>
            </section>

            <ModelGroup
                title="Flagship Text Models"
                description="High-capacity reasoning and non-reasoning tiers for complex production workloads."
                icon={<Layers3 className="h-4 w-4" />}
                models={groups.flagship}
                docsUrl={docsUrl}
            />

            <ModelGroup
                title="Fast Text Models"
                description="Lower-latency text models for interactive workloads and higher request volume."
                icon={<Zap className="h-4 w-4" />}
                models={groups.fast}
                docsUrl={docsUrl}
            />

            <ModelGroup
                title="Image Generation Models"
                description="Per-image billing for standard and premium image generation."
                icon={<ImageIcon className="h-4 w-4" />}
                models={groups.image}
                docsUrl={docsUrl}
            />
        </div>
    );
}

function ModelGroup({
    title,
    description,
    icon,
    models,
    docsUrl,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    models: ApiModel[];
    docsUrl: string;
}) {
    if (!models.length) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {icon}
                        {title}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                {models.map((model) => (
                    <ModelCard key={model.id} model={model} docsUrl={docsUrl} />
                ))}
            </div>
        </section>
    );
}

function ModelCard({ model, docsUrl }: { model: ApiModel; docsUrl: string }) {
    const isImage = model.model_type === 'image';

    return (
        <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-xs text-foreground">
                            {model.public_id}
                        </code>
                        <Badge variant={model.is_active ? 'default' : 'secondary'}>
                            {model.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{isImage ? 'Image' : 'Text'}</Badge>
                        {model.supports_reasoning && (
                            <Badge variant="outline" className="gap-1">
                                <BrainCircuit className="h-3 w-3" />
                                Reasoning
                            </Badge>
                        )}
                        {model.supports_streaming && <Badge variant="outline">Streaming</Badge>}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{model.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {model.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                {isImage ? (
                    <>
                        <PricePanel
                            label="Pricing"
                            primary={`$${model.price_per_image_usd ?? '0'}`}
                            secondary="per image"
                        />
                    </>
                ) : (
                    <>
                        <PricePanel
                            label="Input pricing"
                            primary={`$${model.input_price_per_1m_tokens}`}
                            secondary="per 1M tokens"
                        />
                        <PricePanel
                            label="Output pricing"
                            primary={`$${model.output_price_per_1m_tokens}`}
                            secondary="per 1M tokens"
                        />
                    </>
                )}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
                <MetaCard
                    label="Context window"
                    value={
                        model.max_context_tokens
                            ? `${model.max_context_tokens.toLocaleString()} tokens`
                            : 'Not applicable'
                    }
                />
                <MetaCard
                    label="Mode"
                    value={
                        isImage
                            ? 'Image generation'
                            : model.supports_reasoning
                              ? 'Reasoning text'
                              : 'Non-reasoning text'
                    }
                />
            </div>

            <div className="mt-5 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                    <a href={`${docsUrl}/pricing`}>
                        Pricing details
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>
        </article>
    );
}

function MetricPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-full border border-border bg-background/75 px-4 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}

function PricePanel({
    label,
    primary,
    secondary,
}: {
    label: string;
    primary: string;
    secondary: string;
}) {
    return (
        <div className="rounded-[1.25rem] border border-border bg-muted/35 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{primary}</div>
            <div className="mt-1 text-xs text-muted-foreground">{secondary}</div>
        </div>
    );
}

function MetaCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-border bg-background/70 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
            <div className="mt-2 text-sm text-foreground">{value}</div>
        </div>
    );
}
