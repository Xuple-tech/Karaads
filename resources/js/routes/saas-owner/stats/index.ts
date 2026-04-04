import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::overview
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
 * @route '/saas-owner/stats'
 */
export const overview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})

overview.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::overview
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
 * @route '/saas-owner/stats'
 */
overview.url = (options?: RouteQueryOptions) => {
    return overview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::overview
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
 * @route '/saas-owner/stats'
 */
overview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::overview
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:25
 * @route '/saas-owner/stats'
 */
overview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
 * @route '/saas-owner/stats/users/{user}'
 */
export const userDetails = (args: { user: string | number | { id: string | number } } | [user: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
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
userDetails.url = (args: { user: string | number | { id: string | number } } | [user: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
userDetails.get = (args: { user: string | number | { id: string | number } } | [user: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userDetails.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::userDetails
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:111
 * @route '/saas-owner/stats/users/{user}'
 */
userDetails.head = (args: { user: string | number | { id: string | number } } | [user: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userDetails.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptions
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
 * @route '/saas-owner/stats/subscriptions'
 */
export const subscriptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptions.url(options),
    method: 'get',
})

subscriptions.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats/subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptions
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
 * @route '/saas-owner/stats/subscriptions'
 */
subscriptions.url = (options?: RouteQueryOptions) => {
    return subscriptions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptions
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
 * @route '/saas-owner/stats/subscriptions'
 */
subscriptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptions.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::subscriptions
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:201
 * @route '/saas-owner/stats/subscriptions'
 */
subscriptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscriptions.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagement
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
 * @route '/saas-owner/stats/engagement'
 */
export const engagement = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engagement.url(options),
    method: 'get',
})

engagement.definition = {
    methods: ["get","head"],
    url: '/saas-owner/stats/engagement',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagement
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
 * @route '/saas-owner/stats/engagement'
 */
engagement.url = (options?: RouteQueryOptions) => {
    return engagement.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagement
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
 * @route '/saas-owner/stats/engagement'
 */
engagement.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: engagement.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserStatsController::engagement
 * @see app/Http/Controllers/SaasOwner/UserStatsController.php:275
 * @route '/saas-owner/stats/engagement'
 */
engagement.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: engagement.url(options),
    method: 'head',
})
const stats = {
    overview: Object.assign(overview, overview),
userDetails: Object.assign(userDetails, userDetails),
subscriptions: Object.assign(subscriptions, subscriptions),
engagement: Object.assign(engagement, engagement),
}

export default stats