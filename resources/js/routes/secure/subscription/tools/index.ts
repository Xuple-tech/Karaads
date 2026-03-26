import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
 * @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
 */
export const check = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
 * @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
 */
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::check
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
 * @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
 */
check.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})