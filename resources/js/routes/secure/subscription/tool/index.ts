import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
export const check = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(args, options),
    method: 'get',
})

check.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
check.url = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { key: args }
    }

    if (Array.isArray(args)) {
        args = {
            key: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        key: args.key,
    }

    return check.definition.url
            .replace('{key}', parsedArgs.key.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
check.get = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
check.head = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: check.url(args, options),
    method: 'head',
})

const tool = {
    check: Object.assign(check, check),
}

export default tool