import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { JSX } from 'react';

export default function App({ children }): JSX.Element {
    const page = usePage();
    const { auth } = page.props;
    const component = page.component;

    const Layout = auth.user ? AppLayout : GuestLayout;
    const title = "Kwati Ai";

    // Pages that don't require layout (public pages)
    const publicPages = ['Welcome', 'ChatInterface', 'PrivacyPolicy'];

    const content = publicPages.includes(component) ? children : <Layout auth={auth}>{children}</Layout>;

    
    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
                <link href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap" rel="stylesheet" />
            </Head>
            {content}
        </>
    );
}
