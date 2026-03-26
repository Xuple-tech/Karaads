import { DocsLayout } from '@/layouts/docs-layout';
import { Head } from '@inertiajs/react';

export default function ApiAuthenticationDocs() {
    return (
        <DocsLayout>
            <Head title="API Authentication" />
            <div className="space-y-8">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">API / LLM / Authentication</div>
                    <h1 className="mt-2 text-4xl font-semibold">Authentication model</h1>
                    <p className="mt-3 max-w-3xl text-lg text-stone-600">
                        The console and the API use different authentication systems. Console pages use a browser session on the console surface.
                        API requests use bearer keys issued from the console.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-semibold">Console session auth</h2>
                        <p className="mt-3 text-stone-600">
                            Sign in on the console surface to manage keys, billing, models, and usage. Console-hosted docs share the same console
                            session so users can move between operational pages and docs without signing in again.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-white p-6">
                        <h2 className="text-2xl font-semibold">Bearer key API auth</h2>
                        <p className="mt-3 text-stone-600">
                            Send your developer API key in the <code>Authorization</code> header for every request to <code>/v1</code> endpoints.
                        </p>
                        <pre className="mt-4 overflow-x-auto rounded-xl bg-stone-950 p-4 text-sm text-stone-100">
{`Authorization: Bearer kwati_xxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`}
                        </pre>
                    </div>
                </section>
            </div>
        </DocsLayout>
    );
}
