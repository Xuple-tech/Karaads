import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Download, Link2, QrCode, RefreshCw, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

import { AdminMetricCard, AdminPage, AdminPageHeader, AdminPanel, AdminSection } from '@/components/admin/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';

type SuggestedUrl = {
    label: string;
    url: string;
};

type Props = {
    appName: string;
    defaultUrl: string;
    suggestedUrls: SuggestedUrl[];
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'karaads';

export default function AdminQrCodePage({ appName, defaultUrl, suggestedUrls }: Props) {
    const [targetUrl, setTargetUrl] = useState(defaultUrl);
    const [label, setLabel] = useState(`${appName} QR Code`);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [qrSvg, setQrSvg] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const generate = async () => {
            const normalizedUrl = targetUrl.trim();

            if (!normalizedUrl) {
                setQrDataUrl('');
                setQrSvg('');
                setError('Enter a URL to generate the QR code.');
                return;
            }

            if (!/^https?:\/\//i.test(normalizedUrl)) {
                setQrDataUrl('');
                setQrSvg('');
                setError('URL must start with http:// or https://');
                return;
            }

            try {
                const options = {
                    width: 960,
                    margin: 2,
                    errorCorrectionLevel: 'H' as const,
                    color: {
                        dark: '#07111f',
                        light: '#ffffff',
                    },
                };

                const [png, svg] = await Promise.all([
                    QRCode.toDataURL(normalizedUrl, options),
                    QRCode.toString(normalizedUrl, { ...options, type: 'svg' as const }),
                ]);

                if (!cancelled) {
                    setQrDataUrl(png);
                    setQrSvg(svg);
                    setError('');
                }
            } catch {
                if (!cancelled) {
                    setQrDataUrl('');
                    setQrSvg('');
                    setError('Unable to generate QR code. Please check the link and try again.');
                }
            }
        };

        void generate();

        return () => {
            cancelled = true;
        };
    }, [targetUrl]);

    const downloadPng = () => {
        if (!qrDataUrl) {
            return;
        }

        const anchor = document.createElement('a');
        anchor.href = qrDataUrl;
        anchor.download = `${slugify(label)}.png`;
        anchor.click();
    };

    const downloadSvg = () => {
        if (!qrSvg) {
            return;
        }

        const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${slugify(label)}.svg`;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
    };

    const copyUrl = async () => {
        await navigator.clipboard.writeText(targetUrl.trim());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <Head title="QR Download" />
            <AdminLayout>
                <AdminPage>
                    <AdminPageHeader
                        eyebrow="Growth tools"
                        title="QR code download"
                        description="Create a scannable QR code for Karaads, an admin page, or any campaign link, then download it as PNG or SVG."
                        actions={
                            <Link href="/admin/dashboard">
                                <Button variant="outline">Back to dashboard</Button>
                            </Link>
                        }
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <AdminMetricCard label="Default link" value="Website" hint={defaultUrl} icon={Link2} />
                        <AdminMetricCard label="Download" value="PNG / SVG" hint="Ready for flyers, web, and print" icon={Download} tone="success" />
                        <AdminMetricCard label="Scan target" value={targetUrl ? 'Live' : 'Empty'} hint="QR updates as you type" icon={Smartphone} tone={targetUrl ? 'success' : 'warning'} />
                    </div>

                    <AdminSection title="Generate QR" description="Use the website link, admin login link, or paste a custom URL.">
                        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                            <AdminPanel title="QR details" description="The QR code is generated in your browser, so no image upload is needed.">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="qr-label">File name</Label>
                                        <Input
                                            id="qr-label"
                                            value={label}
                                            onChange={(event) => setLabel(event.target.value)}
                                            placeholder="Karaads website QR"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="qr-url">URL to open after scan</Label>
                                        <Input
                                            id="qr-url"
                                            value={targetUrl}
                                            onChange={(event) => setTargetUrl(event.target.value)}
                                            placeholder="https://karaads.com"
                                            className={error ? 'border-red-500' : undefined}
                                        />
                                        {error ? <p className="text-sm text-red-500">{error}</p> : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {suggestedUrls.map((item) => (
                                            <Button
                                                key={item.label}
                                                type="button"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={() => {
                                                    setTargetUrl(item.url);
                                                    setLabel(`${appName} ${item.label} QR`);
                                                }}
                                            >
                                                {item.label}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-full"
                                            onClick={() => setTargetUrl(defaultUrl)}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </AdminPanel>

                            <AdminPanel title="Preview and download" description="Download PNG for quick sharing or SVG for sharp printing.">
                                <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10">
                                        {qrDataUrl ? (
                                            <img src={qrDataUrl} alt="Generated QR code" className="aspect-square w-full rounded-3xl object-contain" />
                                        ) : (
                                            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                                                <QrCode className="h-20 w-20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-between gap-5">
                                        <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Scan opens</p>
                                            <p className="mt-2 break-all font-medium">{targetUrl || 'No URL selected'}</p>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <Button type="button" onClick={downloadPng} disabled={!qrDataUrl} className="rounded-2xl">
                                                <Download className="mr-2 h-4 w-4" />
                                                PNG
                                            </Button>
                                            <Button type="button" variant="outline" onClick={downloadSvg} disabled={!qrSvg} className="rounded-2xl">
                                                <Download className="mr-2 h-4 w-4" />
                                                SVG
                                            </Button>
                                            <Button type="button" variant="outline" onClick={copyUrl} disabled={!targetUrl.trim()} className="rounded-2xl">
                                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                                {copied ? 'Copied' : 'Copy link'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AdminPanel>
                        </div>
                    </AdminSection>
                </AdminPage>
            </AdminLayout>
        </>
    );
}
