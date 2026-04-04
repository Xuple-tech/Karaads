import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::index
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:22
 * @route '/saas-owner'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::index
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:22
 * @route '/saas-owner'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::index
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:22
 * @route '/saas-owner'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::index
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:22
 * @route '/saas-owner'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::analytics
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:55
 * @route '/saas-owner/analytics'
 */
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/saas-owner/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::analytics
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:55
 * @route '/saas-owner/analytics'
 */
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::analytics
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:55
 * @route '/saas-owner/analytics'
 */
analytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::analytics
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:55
 * @route '/saas-owner/analytics'
 */
analytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::subscription
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:83
 * @route '/saas-owner/subscription'
 */
export const subscription = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})

subscription.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::subscription
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:83
 * @route '/saas-owner/subscription'
 */
subscription.url = (options?: RouteQueryOptions) => {
    return subscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::subscription
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:83
 * @route '/saas-owner/subscription'
 */
subscription.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscription.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::subscription
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:83
 * @route '/saas-owner/subscription'
 */
subscription.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscription.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::billing
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:101
 * @route '/saas-owner/billing'
 */
export const billing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billing.url(options),
    method: 'get',
})

billing.definition = {
    methods: ["get","head"],
    url: '/saas-owner/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::billing
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:101
 * @route '/saas-owner/billing'
 */
billing.url = (options?: RouteQueryOptions) => {
    return billing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::billing
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:101
 * @route '/saas-owner/billing'
 */
billing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billing.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::billing
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:101
 * @route '/saas-owner/billing'
 */
billing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: billing.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::settings
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:119
 * @route '/saas-owner/settings'
 */
export const settings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})

settings.definition = {
    methods: ["get","head"],
    url: '/saas-owner/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::settings
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:119
 * @route '/saas-owner/settings'
 */
settings.url = (options?: RouteQueryOptions) => {
    return settings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::settings
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:119
 * @route '/saas-owner/settings'
 */
settings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: settings.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SaasOwnerDashboardController::settings
 * @see app/Http/Controllers/SaasOwner/SaasOwnerDashboardController.php:119
 * @route '/saas-owner/settings'
 */
settings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: settings.url(options),
    method: 'head',
})
const SaasOwnerDashboardController = { index, analytics, subscription, billing, settings }

export default SaasOwnerDashboardController