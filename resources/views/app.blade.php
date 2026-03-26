<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="{{ config('app.name', 'Kwati Ai') }} - AI-powered chat application">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)">

    {{-- Critical: Dark mode FOUC prevention - must run before any rendering --}}
    <script>
        ! function() {
            const a = '{{ $appearance ?? "system" }}';
            'system' === a && window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.classList.add('dark');
        }();
    </script>

    {{-- Critical CSS: Prevents layout shift and flashing --}}
    <style>
        html {
            background-color: oklch(1 0 0);
            color-scheme: light;
        }

        html.dark {
            background-color: oklch(0.145 0 0);
            color-scheme: dark;
        }

        body {
            margin: 0;
            padding: 0;
        }
    </style>

    <title inertia>{{ config('app.name', 'Kwati Ai') }}</title>

    {{-- Optimized icon: Single declaration with multiple sizes --}}
    <link rel="icon" href="/icon.png" type="image/png">
    <link rel="apple-touch-icon" href="/icon.png">

    {{-- DNS and connection preloading --}}
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">

    {{-- Optimized font loading with font-display swap for better performance --}}
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

    {{-- Route hints and Inertia setup --}}
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
