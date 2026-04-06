import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Component() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-[480px] space-y-10 text-center">
                {/* Logo + Brand */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#d4844a] to-[#b86c3c] shadow-lg shadow-[#d4844a]/20">
                        <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Kwati AI</h1>
                        <p className="mt-2 text-base text-muted-foreground">
                            Your intelligent AI assistant
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                    <Link
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4844a] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#c27640] active:scale-[0.98] shadow-sm"
                        to="/app"
                    >
                        Get started
                        <ArrowRight className="h-4.5 w-4.5" />
                    </Link>
                    <Link
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
                        to="/login"
                    >
                        Sign in
                    </Link>
                </div>

                {/* Footer links */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground/60">
                    <Link className="hover:text-muted-foreground transition-colors" to="/privacy">Privacy</Link>
                    <Link className="hover:text-muted-foreground transition-colors" to="/pricing">Pricing</Link>
                    <Link className="hover:text-muted-foreground transition-colors" to="/terms">Terms</Link>
                </div>
            </div>
        </div>
    );
}
