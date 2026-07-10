import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@/components/page-head';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="container mx-auto flex min-h-screen items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
                        <div className="flex flex-col items-center gap-6">
                            <Link
                                href={home()}
                                className="group flex items-center gap-3"
                            >
                                <div className="flex h-22 w-22 items-center justify-center rounded-xl">
                                    <AppLogoIcon className="size-20" />
                                </div>
                                
                            </Link>

                            {/* <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {description}
                                </p>
                            </div> */}
                        </div>
                        <div className="mt-8">{children}</div>
                    </div>
                    
                    <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    );
}