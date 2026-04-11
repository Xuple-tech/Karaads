import { type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-dvh flex-col bg-background">

            {/* ── Top logo bar ── */}
            <header className="flex items-center justify-center px-6 pt-10">
                <Link to="/" className="transition-opacity hover:opacity-70">
                    <img
                        src="/logo.png"
                        alt="Kwati AI"
                        className="h-8 w-auto select-none"
                        draggable={false}
                    />
                </Link>
            </header>

            {/* ── Form area ── */}
            <main className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-[360px]">

                    {/* Title block */}
                    {(title || description) && (
                        <div className="mb-7 text-center">
                            {title && (
                                <h1 className="text-[1.55rem] font-semibold tracking-tight text-foreground leading-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                            )}
                        </div>
                    )}

                    {/* Form slot */}
                    {children}
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="flex items-center justify-center gap-5 px-6 pb-8 pt-2">
                <Link to="/privacy" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    Privacy
                </Link>
                <span className="text-xs text-muted-foreground/20">·</span>
                <Link to="/terms" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    Terms
                </Link>
                <span className="text-xs text-muted-foreground/20">·</span>
                <Link to="/pricing" className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    Pricing
                </Link>
            </footer>
        </div>
    );
}
