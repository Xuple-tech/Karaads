export function Component() {
    return (
        <section className="mx-auto max-w-4xl space-y-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Privacy</p>
            <h1 className="text-4xl font-semibold">Privacy Policy</h1>
            <p className="text-muted-foreground">
                This user-facing route is now served by the SPA shell. Laravel still owns the data layer, session auth,
                and operational policy enforcement behind the scenes.
            </p>
        </section>
    );
}
