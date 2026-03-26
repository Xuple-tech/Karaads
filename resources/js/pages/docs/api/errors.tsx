import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ErrorsDocs() {
    return (
        <DocsLayout>
            <Head title="Errors" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Errors</div>
                    <h1 className="mt-2 text-4xl font-semibold">Stable error shape</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        The API sanitizes internal provider failures and returns a stable error structure. Public errors should be handled by type
                        and code rather than by parsing raw provider text.
                    </p>
                </div>

                <section className="rounded-2xl border border-stone-200 bg-white p-6">
                    <pre className="overflow-x-auto rounded-xl bg-stone-950 p-4 text-sm text-stone-100">
{`{
  "error": {
    "message": "Insufficient developer wallet balance.",
    "type": "billing_error",
    "code": "insufficient_credit"
  }
}`}
                    </pre>
                </section>
            </div>
        </DocsLayout>
    );
}
