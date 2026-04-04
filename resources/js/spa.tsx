import '../css/app.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/pages/ErrorBoundry';
import { queryClient } from '@/spa/lib/query-client';
import { router } from '@/spa/router';

const root = document.getElementById('spa-root'); 

if (root) {
    ReactDOM.createRoot(root).render(
        <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                    <Toaster />
                </QueryClientProvider>
            </ThemeProvider>
        </ErrorBoundary>,
    );
}
