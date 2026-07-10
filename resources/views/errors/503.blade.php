<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>{{ config('app.name') }} | Under Maintenance</title>
    <style>
        :root {
            color-scheme: light;
            --bg-start: #0f172a;
            --bg-end: #111827;
            --panel: #ffffff;
            --title: #0f172a;
            --text: #334155;
            --accent: #f97316;
            --accent-soft: #ffedd5;
            --shadow: rgba(2, 6, 23, 0.28);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at 15% 15%, rgba(249, 115, 22, 0.25), transparent 35%),
                radial-gradient(circle at 85% 0%, rgba(56, 189, 248, 0.24), transparent 32%),
                linear-gradient(150deg, var(--bg-start), var(--bg-end));
        }

        .card {
            width: min(760px, 100%);
            background: var(--panel);
            border-radius: 24px;
            box-shadow: 0 30px 70px var(--shadow);
            padding: clamp(28px, 5vw, 56px);
        }

        .badge {
            margin: 0 0 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 0.84rem;
            font-weight: 600;
            color: #9a3412;
            background: var(--accent-soft);
        }

        .badge::before {
            content: "";
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: var(--accent);
            animation: pulse 1.5s ease-in-out infinite;
        }

        h1 {
            margin: 0;
            color: var(--title);
            font-size: clamp(1.8rem, 4.4vw, 3rem);
            line-height: 1.08;
            letter-spacing: -0.02em;
        }

        p {
            margin: 14px 0 0;
            font-size: 1.04rem;
            line-height: 1.6;
        }

        .status {
            margin-top: 26px;
            font-size: 0.9rem;
            color: #64748b;
        }

        .logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
            border-radius: 14px;
            margin-bottom: 18px;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.16);
            padding: 6px;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.25); opacity: 0.65; }
        }
    </style>
</head>
<body>
    <main class="card" role="main" aria-labelledby="maintenance-title">
        <img class="logo" src="{{ asset('logo.png') }}" alt="{{ config('app.name') }} logo">
        <p class="badge">Maintenance in progress</p>
        <h1 id="maintenance-title">We are making things better.</h1>
        <p>
            {{ config('app.name') }} is temporarily offline for a scheduled update.
            Please check back shortly.
        </p>
        <p class="status">HTTP 503 - Service Unavailable</p>
    </main>
</body>
</html>
