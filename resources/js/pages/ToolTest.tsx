import { Head } from '@inertiajs/react';
import ToolStatusTest from '@/test/ToolStatusTest';
import { Toaster } from '@/components/ui/toaster';

export default function ToolTest() {
    return (
        <>
            <Head title="Tool Status Test" />
            <div className="min-h-screen bg-background">
                <ToolStatusTest />
                <Toaster />
            </div>
        </>
    );
}
