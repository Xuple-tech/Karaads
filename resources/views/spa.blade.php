<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="{{ config('app.name', 'Kwati Ai') }} - AI-powered chat workspace">
    <title>{{ config('app.name', 'Kwati Ai') }}</title>
    <link rel="icon" href="/icon.png" type="image/png">
    <link rel="apple-touch-icon" href="/icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/spa.tsx'])
</head>
<body class="font-sans antialiased">
    <div id="spa-root"></div>
</body>
</html>
