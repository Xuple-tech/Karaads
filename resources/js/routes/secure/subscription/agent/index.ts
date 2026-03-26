import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::create
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::create
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::create
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::activate
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
 */
export const activate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(options),
    method: 'post',
})

activate.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::activate
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
 */
activate.url = (options?: RouteQueryOptions) => {
    return activate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::activate
 * @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
 * @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
 */
activate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activate.url(options),
    method: 'post',
})
const agent = {
    create: Object.assign(create, create),
activate: Object.assign(activate, activate),
}

export default agent