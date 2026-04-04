export function Component() {
    return (
        <section className="mx-auto max-w-4xl space-y-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Terms</p>
            <h1 className="text-4xl font-semibold">Terms of Service</h1>
            <p className="text-muted-foreground">
                The user experience is now routed client-side, but subscriptions, authentication, and all business rules
                still execute on Laravel through the API layer.
            </p>
        </section>
    );
}
