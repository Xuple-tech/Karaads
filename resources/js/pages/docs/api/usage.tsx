import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function UsageDocs() {
    return (
        <DocsLayout>
            <Head title="Usage" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Usage</div>
                    <h1 className="mt-2 text-4xl font-semibold">Usage and account endpoints</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        Query current account state with <code>/v1/me</code> and aggregate usage with <code>/v1/usage</code>. Use the console for
                        operational dashboards and ledger history.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-semibold">Account</h2>
                        <pre className="mt-4 overflow-x-auto rounded-xl bg-stone-950 p-4 text-sm text-stone-100">{`GET /v1/me`}</pre>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-semibold">Usage</h2>
                        <pre className="mt-4 overflow-x-auto rounded-xl bg-stone-950 p-4 text-sm text-stone-100">{`GET /v1/usage`}</pre>
                    </div>
                </section>
            </div>
        </DocsLayout>
    );
}
