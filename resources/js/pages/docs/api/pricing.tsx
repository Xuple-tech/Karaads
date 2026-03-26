import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function PricingDocs() {
    return (
        <DocsLayout>
            <Head title="Pricing" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Pricing</div>
                    <h1 className="mt-2 text-4xl font-semibold">Pricing and prepaid credits</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        Billing is prepaid in USD credits. Cost is computed from the selected public model’s input and output token rates and then
                        debited from the developer wallet.
                    </p>
                </div>

                <section className="rounded-2xl border border-stone-200 bg-white p-6">
                    <ul className="space-y-3 text-sm text-stone-700">
                        <li>Top up the wallet from the console.</li>
                        <li>Per-request usage records capture tokens and cost.</li>
                        <li>Estimated token fallback may be used when upstream token counts are unavailable.</li>
                    </ul>
                </section>
            </div>
        </DocsLayout>
    );
}
