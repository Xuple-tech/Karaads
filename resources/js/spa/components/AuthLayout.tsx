import { type PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

const features = [
    {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        ),
        label: 'Smart conversations',
        desc: 'Chat naturally and get intelligent, contextual responses.',
    },
    {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
        ),
        label: 'Code & analysis',
        desc: 'Write, debug, and explain code across any language.',
    },
    {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
        ),
        label: 'Writing & editing',
        desc: 'Draft, refine, and improve your writing with AI assistance.',
    },
    {
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
        ),
        label: 'Research & summarize',
        desc: 'Quickly distill complex information into clear insights.',
    },
];

export default function AuthLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-dvh bg-background flex">
            {/* ── Left panel (branding) ── */}
            <div className="hidden lg:flex lg:w-[520px] xl:w-[560px] flex-col bg-[#171717] border-r border-[#252525] p-12 relative overflow-hidden shrink-0">
                {/* Subtle radial glow */}
                <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#6d28d9]/8 blur-3xl" />

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity relative z-10">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-lg">
                        <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span className="text-[16px] font-semibold text-foreground tracking-tight">Kwati AI</span>
                </Link>

                {/* Hero copy */}
                <div className="mt-auto mb-auto relative z-10 pt-16">
                    <h2 className="text-3xl font-semibold text-foreground tracking-tight leading-snug">
                        Your AI assistant,<br />
                        <span className="text-[#8b5cf6]">always ready.</span>
                    </h2>
                    <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed max-w-sm">
                        Kwati AI helps you think faster, write better, and get more done — all in one place.
                    </p>

                    {/* Feature list */}
                    <ul className="mt-10 space-y-5">
                        {features.map((f) => (
                            <li key={f.label} className="flex items-start gap-3.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/12 text-[#8b5cf6]">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-foreground">{f.label}</p>
                                    <p className="text-[12px] text-muted-foreground/70 leading-relaxed mt-0.5">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom links */}
                <div className="flex gap-5 text-[11px] text-muted-foreground/40 relative z-10">
                    <Link to="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
                </div>
            </div>

            {/* ── Right panel (form) ── */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8">
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] shadow-md">
                            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold text-foreground tracking-tight">Kwati AI</span>
                    </Link>
                </div>

                <div className="w-full max-w-[360px]">
                    {/* Heading */}
                    {(title || description) && (
                        <div className="mb-8 space-y-1.5">
                            {title && (
                                <h1 className="text-[1.6rem] font-semibold text-foreground tracking-tight leading-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-[0.875rem] text-muted-foreground">{description}</p>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    {children}

                    {/* Mobile footer */}
                    <div className="lg:hidden mt-10 flex items-center justify-center gap-5 text-xs text-muted-foreground/40">
                        <Link to="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
                        <span>·</span>
                        <Link to="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
