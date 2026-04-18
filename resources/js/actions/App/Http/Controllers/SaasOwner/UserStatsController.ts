import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::index
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
* @route '/saas-owner/stats'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::index
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
* @route '/saas-owner/stats'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::index
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
* @route '/saas-owner/stats'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::index
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
* @route '/saas-owner/stats'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
* @route '/saas-owner/stats/users/{user}'
*/
export const userDetails = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userDetails.url(args, options),
    method: 'get',
})

userDetails.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats/users/{user}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
* @route '/saas-owner/stats/users/{user}'
*/
userDetails.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return userDetails.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
* @route '/saas-owner/stats/users/{user}'
*/
userDetails.get = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userDetails.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
* @route '/saas-owner/stats/users/{user}'
*/
userDetails.head = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userDetails.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptionStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
* @route '/saas-owner/stats/subscriptions'
*/
export const subscriptionStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionStats.url(options),
    method: 'get',
})

subscriptionStats.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats/subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptionStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
* @route '/saas-owner/stats/subscriptions'
*/
subscriptionStats.url = (options?: RouteQueryOptions) => {
    return subscriptionStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptionStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
* @route '/saas-owner/stats/subscriptions'
*/
subscriptionStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptionStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
* @route '/saas-owner/stats/subscriptions'
*/
subscriptionStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscriptionStats.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagementStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
* @route '/saas-owner/stats/engagement'
*/
export const engagementStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engagementStats.url(options),
    method: 'get',
})

engagementStats.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats/engagement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagementStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
* @route '/saas-owner/stats/engagement'
*/
engagementStats.url = (options?: RouteQueryOptions) => {
    return engagementStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagementStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
* @route '/saas-owner/stats/engagement'
*/
engagementStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engagementStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagementStats
* @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
* @route '/saas-owner/stats/engagement'
*/
engagementStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: engagementStats.url(options),
    method: 'head',
})

const UserStatsController = { index, userDetails, subscriptionStats, engagementStats }

export default UserStatsController