<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cookie Reset Version
    |--------------------------------------------------------------------------
    |
    | Set this to a unique value when old browser cookies should be expired
    | for every visitor. Visitors receive a small marker cookie after the reset
    | so the app does not keep clearing fresh cookies on later requests.
    |
    */

    'version' => env('COOKIE_RESET_VERSION'),

    /*
    |--------------------------------------------------------------------------
    | Cookie Names To Expire
    |--------------------------------------------------------------------------
    |
    | These are legacy/frontend cookies that should be removed during a reset.
    | The active session cookie is skipped automatically so fresh sessions keep
    | working after the reset.
    |
    */

    'names' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('COOKIE_RESET_NAMES', 'karaads-session,karaads_session,XSRF-TOKEN,appearance,sidebar_state'))
    ))),
];
