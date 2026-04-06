import AppLogoIcon from '@/components/app-logo-icon';
import { type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-[380px]">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]">
                            <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold text-foreground tracking-tight">Kwati AI</span>
                    </Link>
                </div>

                {/* Heading */}
                {(title || description) && (
                    <div className="text-center mb-6 space-y-1.5">
                        {title && (
                            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}

                {/* Form — no heavy card, just clean spacing */}
                <div className="bg-card border border-border/60 rounded-2xl p-7 shadow-sm">
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground/60">
                    <Link to="/privacy" className="hover:text-muted-foreground transition-colors">
                        Privacy
                    </Link>
                    <span>·</span>
                    <Link to="/terms" className="hover:text-muted-foreground transition-colors">
                        Terms
                    </Link>
                </div>
            </div>
        </div>
    );
}
