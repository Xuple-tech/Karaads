import { ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Component() {
    const logo = '/assets/images/logo.png';
    const robot = '/assets/images/00-pspd-asets.png';

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <style>{`
body {
    --tw-gradient-position: to bottom left in oklab;
    background-image: linear-gradient(var(--tw-gradient-stops));
    --tw-gradient-from: rgba(6, 1, 10, 1);
    --tw-gradient-stops: var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-to) var(--tw-gradient-to-position);
    --tw-gradient-via: rgba(19, 16, 56, 1);
    --tw-gradient-via-stops: var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position), var(--tw-gradient-via) var(--tw-gradient-via-position), var(--tw-gradient-to) var(--tw-gradient-to-position);
    --tw-gradient-stops: var(--tw-gradient-via-stops);
    --tw-gradient-to: rgb(16, 5, 30);
}
`}</style>
            <div className="w-full max-w-[420px] space-y-6">
                <div className="flex justify-center pt-8">
                    <img alt="Kwati AI Logo" className="h-14 w-auto" src={logo} />
                </div>

                <div className="relative flex justify-center">
                    <img alt="Kwati AI Robot" className="w-full max-w-[280px] object-contain" src={robot} />
                </div>

                <div className="flex justify-center pb-8 pt-6">
                    <Link
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6d44ff15] px-8 py-6 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-[#5A36D9] active:scale-95"
                        to="/app"
                    >
                        Get Started
                        <ChevronsRight className="ms-auto" />
                    </Link>
                </div>

                <div className="flex justify-between gap-2 text-sm text-white/80">
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/pricing">Pricing</Link>
                    <Link to="/terms">Terms</Link>
                </div>
            </div>
        </div>
    );
}
