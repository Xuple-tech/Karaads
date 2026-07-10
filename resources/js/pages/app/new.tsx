import { Head } from '@/components/page-head';

export default function NewPage() {
    return (
        <>
            <Head title="New" />
            <div className="karads-mobile min-h-screen bg-[#0b0e13] text-white">
                <div className="px-4 py-6">
                    <h1 className="text-xl font-semibold">New</h1>
                    <p className="mt-2 text-sm text-white/60">This is the new route.</p>
                </div>
            </div>
        </>
    );
}