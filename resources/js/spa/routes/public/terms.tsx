export function Component() {
    return (
        <section className="mx-auto max-w-4xl space-y-8 px-6 py-16">
            <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Terms</p>
                <h1 className="text-4xl font-semibold">Terms of Service</h1>
                <p className="text-lg text-muted-foreground">
                    These terms govern your use of KwatiAI chat, voice, billing, and related user-facing services.
                </p>
                <p className="text-sm text-muted-foreground">Effective date: April 4, 2026</p>
            </div>

            <div className="space-y-6 text-sm leading-7 text-foreground">
                <section>
                    <h2 className="text-lg font-semibold">Acceptable use</h2>
                    <p className="mt-2 text-muted-foreground">
                        You must use the service lawfully, avoid abusive or harmful activity, and keep account credentials secure.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">Subscriptions and payments</h2>
                    <p className="mt-2 text-muted-foreground">
                        Paid plans, renewals, cancellations, refunds, and usage limits are governed by the subscription details shown at checkout and inside the billing area.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">Service changes</h2>
                    <p className="mt-2 text-muted-foreground">
                        Features, limits, supported models, and user interfaces may change over time. We may suspend access for abuse, fraud, unpaid balances, or legal reasons.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold">Liability and support</h2>
                    <p className="mt-2 text-muted-foreground">
                        The service is provided on an evolving basis. To the maximum extent permitted by law, liability is limited and support obligations are defined by the active plan and applicable law.
                    </p>
                </section>
            </div>
        </section>
    );
}
