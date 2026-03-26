import AppLogoIcon from '@/components/app-logo-icon';
import { Card } from '@/components/ui/card';
import { LanguageProvider } from '@/hooks/use-lang';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background min-h-screen">
            {/* header using shadecdn ui */}

            <div className="sticky top-0 z-50 shadow-md">
                <Card className="rounded-none border-b-1 bg-transparent backdrop-blur-2xl">
                    <div className="flex items-center justify-between px-4">
                        <div className="login-section">
                            <AppLogoIcon />
                        </div>
                        {/* links to login and register */}
                        <div className="flex space-x-4">
                            <Link href="/login" className="text-primary text-sm hover:underline">
                                Log in
                            </Link>
                            <Link href="/register" className="text-primary text-sm hover:underline">
                                Register
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
            {/* header ends here */}

            <LanguageProvider>
                <main>{children}</main>
            </LanguageProvider>
        </div>
    );
}
