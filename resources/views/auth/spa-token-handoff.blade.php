<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signing you in…</title>
    <style>
        body { margin: 0; background: #1e1e1e; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(139,92,246,.3); border-top-color: #8b5cf6; border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="spinner"></div>
    <script>
        try {
            localStorage.setItem('kwati_spa_token', @json($token));
        } catch (e) {}
        window.location.replace(@json($redirect));
    </script>
</body>
</html>
