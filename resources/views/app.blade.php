<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'dark') == 'dark'])>

<head>
    @php
    $seo = (isset($page) && is_array($page) && isset($page['props']['seo']) && is_array($page['props']['seo']))
    ? $page['props']['seo']
    : [];
    $defaultTitle = config('app.name', 'Laravel');
    $title = $seo['title'] ?? $defaultTitle;
    $description = $seo['description'] ?? "Discover posts and creators on {$defaultTitle}.";
    $robots = $seo['robots'] ?? 'index,follow';
    $canonical = $seo['canonical'] ?? url()->current();
    $ogType = $seo['og_type'] ?? 'website';
    $ogImage = $seo['og_image'] ?? null;
    $twitterCard = $seo['twitter_card'] ?? ($ogImage ? 'summary_large_image' : 'summary');
    $jsonLd = $seo['json_ld'] ?? null;
    $siteMaintenance = config('site.maintenance_banner');
    $siteMaintenanceEnabled = (bool) ($siteMaintenance['enabled'] ?? false);
    $hasViteManifest = file_exists(public_path('build/manifest.json'));
    $showFallbackShell = ! $hasViteManifest;
    if ($siteMaintenanceEnabled) {
        $title = $siteMaintenance['title'] ?? 'System maintenance';
        $description = $siteMaintenance['message'] ?? $description;
        $robots = 'noindex,nofollow';
    }
    @endphp


    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="{{ e($description) }}">
    <meta name="robots" content="{{ e($robots) }}">
    <link rel="canonical" href="{{ e($canonical) }}">
    <meta name="google-adsense-account" content="ca-pub-6602887774830385">

    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#0B4DBB">
    <link rel="apple-touch-icon" href="/icons/icon-192.png">
    <meta property="og:title" content="{{ e($title) }}">
    <meta property="og:description" content="{{ e($description) }}">
    <meta property="og:type" content="{{ e($ogType) }}">
    <meta property="og:url" content="{{ e($canonical) }}">
    <meta property="og:site_name" content="{{ e($seo['site_name'] ?? $defaultTitle) }}">
    @if (!empty($ogImage))
    <meta property="og:image" content="{{ e($ogImage) }}">
    <meta property="og:image:secure_url" content="{{ e($ogImage) }}">
    @if (!empty($seo['og_image_type']))
    <meta property="og:image:type" content="{{ e($seo['og_image_type']) }}">
    @endif
    @if (!empty($seo['og_image_width']))
    <meta property="og:image:width" content="{{ e($seo['og_image_width']) }}">
    @endif
    @if (!empty($seo['og_image_height']))
    <meta property="og:image:height" content="{{ e($seo['og_image_height']) }}">
    @endif
    @if (!empty($seo['og_image_alt']))
    <meta property="og:image:alt" content="{{ e($seo['og_image_alt']) }}">
    @endif
    @endif
    @if (!empty($seo['published_time']))
    <meta property="article:published_time" content="{{ e($seo['published_time']) }}">
    @endif
    @if (!empty($seo['modified_time']))
    <meta property="article:modified_time" content="{{ e($seo['modified_time']) }}">
    @endif
    @if (!empty($seo['author']))
    <meta property="article:author" content="{{ e($seo['author']) }}">
    @endif

    <meta name="twitter:card" content="{{ e($twitterCard) }}">
    <meta name="twitter:title" content="{{ e($title) }}">
    <meta name="twitter:description" content="{{ e($description) }}">
    @if (!empty($ogImage))
    <meta name="twitter:image" content="{{ e($ogImage) }}">
    @if (!empty($seo['og_image_alt']))
    <meta name="twitter:image:alt" content="{{ e($seo['og_image_alt']) }}">
    @endif
    @endif

    {{-- Apply the saved theme before React/CSS paints to prevent flashes and keep all pages in sync. --}}
    <script>
        (function() {
            const serverAppearance = @json($appearance ?? 'dark');
            const storedAppearance = window.localStorage.getItem('appearance');
            const allowed = ['light', 'dark', 'system'];
            const appearance = allowed.includes(storedAppearance) ? storedAppearance : serverAppearance;
            const safeAppearance = allowed.includes(appearance) ? appearance : 'dark';
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = safeAppearance === 'dark' || (safeAppearance === 'system' && prefersDark);

            document.documentElement.classList.toggle('dark', isDark);
            document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
            document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <script>
        window.__KARAADS_BOOTSTRAP__ = Object.assign(window.__KARAADS_BOOTSTRAP__ ?? {}, {
            siteMaintenance: @json(config('site.maintenance_banner')),
        });
    </script>

    <title inertia>{{ e($title) }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @unless ($showFallbackShell)
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @if (!empty($jsonLd))
        <script type="application/ld+json">
            {
                {!! json_encode($jsonLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}
            }
        </script>
        @endif
        @inertiaHead
        
        <script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js"></script>
    @endunless
</head>

<body class="font-sans antialiased">
    @if (! $hasViteManifest)
        <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#07111f 0%,#0f172a 55%,#111827 100%);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <section style="max-width:720px;width:100%;border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:32px;background:rgba(255,255,255,.06);box-shadow:0 24px 80px rgba(0,0,0,.35);backdrop-filter:blur(12px);">
                <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(96,165,250,.14);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;">
                    Deployment issue
                </div>
                <h1 style="margin:20px 0 12px;font-size:40px;line-height:1.05;font-weight:800;">
                    The site is rebuilding
                </h1>
                <p style="margin:0;font-size:18px;line-height:1.7;color:rgba(226,232,240,.92);">
                    The frontend build files are not available yet, so the full site cannot load safely. Rebuild the assets on the server and refresh the page.
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;">
                    <button type="button" onclick="window.location.reload()" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:rgba(59,130,246,.92);color:#fff;border:0;font-weight:700;cursor:pointer;">
                        Reload page
                    </button>
                </div>
            </section>
        </main>
    @else
        @inertia
        <div class="loading" style="position: fixed;color:white;  top: 0px; left: 0px; width: 100%; height: 100vh; z-index: 999999;
        flex-direction: column;
    background: linear-gradient(45deg, #14287b, #000a11);

    display:flex; justify-content:center; align-items:center;">
        <div class="logo-icon-section " style="border-radius: 100%; padding:4px; height:80px; width:80px">
            <img src="/logo.png" alt="lolo" class="logo" style="width: 80px; height: 80px;">
        </div>
        <h5>
            Karaads
        </h5>
        <small>
            The gateway to connection
        </small>
    </div>
        <script type="text/javascript">
            if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
                window.aclib.runAutoTag({
                    zoneId: 'dbnjwjjzvk',
                });
            }
        </script>
    @endunless
</body>

</html>
