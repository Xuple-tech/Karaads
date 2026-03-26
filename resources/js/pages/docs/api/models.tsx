import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ApiModelsDocs() {
    return (
        <DocsLayout>
            <Head title="API Models" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Models</div>
                    <h1 className="mt-2 text-4xl font-semibold">Public model catalog</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        Clients select branded public model IDs. Upstream provider identity stays internal to the platform and is not part of the
                        public API contract.
                    </p>
                </div>

                <section className="rounded-2xl border border-stone-200 bg-white p-6">
                    <h2 className="text-2xl font-semibold">Current public model IDs</h2>
                    <ul className="mt-4 space-y-3 text-sm text-stone-700">
                        <li><code>kwati-4</code> for the primary flagship model tier.</li>
                        <li><code>kwati-4-fast</code> for lower-latency general-purpose usage.</li>
                    </ul>
                    <pre className="mt-5 overflow-x-auto rounded-xl bg-stone-950 p-4 text-sm text-stone-100">
{`GET /v1/models`}
                    </pre>
                </section>
            </div>
        </DocsLayout>
    );
}
