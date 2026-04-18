import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\GoogleController::redirectToGoogle
* @see app/Http/Controllers/Auth/GoogleController.php:22
* @route '/auth/google'
*/
export const redirectToGoogle = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirectToGoogle.url(options),
    method: 'get',
})

redirectToGoogle.definition = {
    methods: ["get","head"],
    url: '/auth/google',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\GoogleController::redirectToGoogle
* @see app/Http/Controllers/Auth/GoogleController.php:22
* @route '/auth/google'
*/
redirectToGoogle.url = (options?: RouteQueryOptions) => {
    return redirectToGoogle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\GoogleController::redirectToGoogle
* @see app/Http/Controllers/Auth/GoogleController.php:22
* @route '/auth/google'
*/
redirectToGoogle.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: redirectToGoogle.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\GoogleController::redirectToGoogle
* @see app/Http/Controllers/Auth/GoogleController.php:22
* @route '/auth/google'
*/
redirectToGoogle.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: redirectToGoogle.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/google/callback'
*/
const handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.url(options),
    method: 'get',
})

handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.definition = {
    methods: ["get","head"],
    url: '/google/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/google/callback'
*/
handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.url = (options?: RouteQueryOptions) => {
    return handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/google/callback'
*/
handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/google/callback'
*/
handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/mail/gmail'
*/
const handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.url(options),
    method: 'get',
})

handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.definition = {
    methods: ["get","head"],
    url: '/mail/gmail',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/mail/gmail'
*/
handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.url = (options?: RouteQueryOptions) => {
    return handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/mail/gmail'
*/
handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\GoogleController::handleGoogleCallback
* @see app/Http/Controllers/Auth/GoogleController.php:40
* @route '/mail/gmail'
*/
handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12.url(options),
    method: 'head',
})

export const handleGoogleCallback = {
    '/google/callback': handleGoogleCallbackdb9f099626d2ce3fba58b0b29a9dd0ae,
    '/mail/gmail': handleGoogleCallback900c4f51ddc630cd0ccd00d3d36fff12,
}

const GoogleController = { redirectToGoogle, handleGoogleCallback }

export default GoogleController