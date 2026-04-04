import { useLocation } from 'react-router-dom';

export function Component() {
    const location = useLocation();

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-semibold">SPA route placeholder</h1>
            <p className="text-muted-foreground">
                This user route is now owned by React Router. The API layer is still available underneath, and this page can
                be expanded feature-by-feature without moving the route boundary back to Inertia.
            </p>
            <div className="rounded-3xl border border-border/70 bg-background p-6">
                <p className="text-sm text-muted-foreground">Current path</p>
                <p className="mt-2 font-mono text-sm">{location.pathname}</p>
            </div>
        </div>
    );
}
