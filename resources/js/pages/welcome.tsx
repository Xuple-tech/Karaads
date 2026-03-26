// src/components/Welcome.jsx
import { ChevronsRight } from 'lucide-react';
import { Head, Link as InertiaLink } from '@inertiajs/react';


export default function Welcome() {
    const logo = '/assets/images/logo.png';
    const robot = '/assets/images/00-pspd-asets.png';
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <style>
                {`
body {
    --tw-gradient-position: to bottom left in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
    --tw-gradient-from: rgba(6, 1, 10, 1);
    --tw-gradient-stops: var(
        --tw-gradient-via-stops,
        var(--tw-gradient-position),
        var(--tw-gradient-from) var(--tw-gradient-from-position),
        var(--tw-gradient-to) var(--tw-gradient-to-position)
    );
    --tw-gradient-via: rgba(19, 16, 56, 1);
    --tw-gradient-via-stops:
        var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position),
        var(--tw-gradient-to) var(--tw-gradient-to-position);
    --tw-gradient-stops: var(--tw-gradient-via-stops);
    --tw-gradient-to: rgb(16, 5, 30);
    --tw-gradient-stops: var(
        --tw-gradient-via-stops,
        var(--tw-gradient-position),
        var(--tw-gradient-from) var(--tw-gradient-from-position),
        var(--tw-gradient-to) var(--tw-gradient-to-position)
    );
}
`}
            </style>
            <Head title='Welcome' />
            <div className="w-full max-w-[420px] space-y-6">
                {/* Logo */}
                <div className="flex justify-center pt-8">
                    <img src={logo} alt="Kwati AI Logo" className="h-14 w-auto" />
                </div>

                {/* Robot + Speech Bubble */}
                <div className="relative flex justify-center">
                    <img
                        src={robot}
                        alt="Kwati AI Robot"
                        className="w-full max-w-[280px] object-contain"
                    />


                </div>

                {/* Get Started Button */}
                <div className="flex justify-center pb-8 pt-6">
                    <InertiaLink
                        href="/app"
                        className="justify-center items-center flex  w-full gap-2 rounded-full bg-[#6d44ff15] px-8 py-6 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-[#5A36D9] active:scale-95"
                    >
                        Get Started
                        <ChevronsRight className='ms-auto' />
                    </InertiaLink>


                </div>
                <div className="flex justify-between gap-2">
                    <InertiaLink href={'/privacy-policy'}>
                        Privacy Policy
                    </InertiaLink>
                    <InertiaLink href={'#'}>
                        Faqs
                    </InertiaLink>
                    <InertiaLink href={'#'}>
                        Developer
                    </InertiaLink>
                </div>
            </div>
        </div>
    );
}
