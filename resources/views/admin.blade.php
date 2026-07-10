<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'dark') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0f172a">
    <title inertia>{{ config('app.name', 'Laravel') }}</title>

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
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    @viteReactRefresh
    @vite(['resources/js/admin.tsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
