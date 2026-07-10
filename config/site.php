<?php

return [
    'maintenance_banner' => [
        'enabled' => env('SITE_MAINTENANCE_ENABLED', false),
        'version' => env('SITE_MAINTENANCE_VERSION', '1'),
        'title' => env('SITE_MAINTENANCE_TITLE', 'System maintenance'),
        'message' => env(
            'SITE_MAINTENANCE_MESSAGE',
            'The system is under maintenance. We are improving speed and reliability, so some pages may be temporarily unavailable for a short time.',
        ),
        'actionLabel' => env('SITE_MAINTENANCE_ACTION_LABEL', 'Reload page'),
        'dismissLabel' => env('SITE_MAINTENANCE_DISMISS_LABEL', 'Close'),
        'detailsUrl' => env('SITE_MAINTENANCE_STATUS_URL'),
    ],
];
