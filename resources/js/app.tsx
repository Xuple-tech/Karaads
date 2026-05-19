import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Make route() available globally for Inertia components
declare global { function route(...args: Parameters<typeof route>): ReturnType<typeof route>; }
(window as any).route = route;
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from './pages/ErrorBoundry';

createInertiaApp({
    title: (title) => `${title} - Kwati AI`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <ErrorBoundary>
                    <App {...props} />
                    <Toaster />
                </ErrorBoundary>
            </>
        );

    },

    progress: {
        color: '#4B5563',
    },
});

document.querySelector('html')?.setAttribute('class', 'dark');
