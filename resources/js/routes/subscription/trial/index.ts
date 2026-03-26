import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SubscriptionController::start
 * @see app/Http/Controllers/SubscriptionController.php:280
 * @route '/api/subscription/start-trial'
 */
export const start = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/api/subscription/start-trial',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::start
 * @see app/Http/Controllers/SubscriptionController.php:280
 * @route '/api/subscription/start-trial'
 */
start.url = (options?: RouteQueryOptions) => {
    return start.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::start
 * @see app/Http/Controllers/SubscriptionController.php:280
 * @route '/api/subscription/start-trial'
 */
start.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})
const trial = {
    start: Object.assign(start, start),
}

export default trial