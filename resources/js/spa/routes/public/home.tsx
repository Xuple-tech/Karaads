import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Component() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-[480px] space-y-10 text-center">

                {/* Logo + Brand */}
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo.png" alt="Kwati AI" className="h-10 w-auto select-none" draggable={false} />
                    <p className="text-base text-muted-foreground">
                        Your intelligent AI assistant
                    </p>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    <Link
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3.5 text-base font-semibold text-white transition-all hover:bg-[#7c3aed] active:scale-[0.98] shadow-sm"
                        to="/app"
                    >
                        Get started
                        <ArrowRight className="h-4 w-4" />
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
