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
            <div className="w-full max-w-[400px]">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 hover:opacity-75 transition-opacity"
                    >
                        <AppLogoIcon />
                        <span className="text-base font-semibold text-foreground tracking-tight">Kwati AI</span>
                    </Link>
                </div>

                {/* Heading */}
                {(title || description) && (
                    <div className="text-center mb-6 space-y-1">
                        {title && (
                            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-card border border-border rounded-xl p-7 shadow-sm">
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
                    <Link to="/privacy" className="hover:text-foreground transition-colors">
                        Privacy policy
                    </Link>
                    <span className="text-border">·</span>
                    <Link to="/terms" className="hover:text-foreground transition-colors">
                        Terms of use
                    </Link>
                </div>
            </div>
        </div>
    );
}
