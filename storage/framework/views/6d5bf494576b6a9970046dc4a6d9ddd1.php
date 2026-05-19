<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['dark'=> ($appearance ?? 'system') == 'dark']); ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    <meta name="description" content="<?php echo e(config('app.name', 'Kwati Ai')); ?> - AI-powered chat workspace">
    <title><?php echo e(config('app.name', 'Kwati Ai')); ?></title>
    <link rel="icon" href="/icon.png" type="image/png">
    <link rel="apple-touch-icon" href="/icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />
    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/spa.tsx']); ?>
</head>
<body class="font-sans antialiased">
    <div id="spa-root"></div>
</body>
</html>
<?php /**PATH /home/duke-of-wezelton/Downloads/kwati-org/kwatiai.com-main-docs-implmemnted/resources/views/spa.blade.php ENDPATH**/ ?>