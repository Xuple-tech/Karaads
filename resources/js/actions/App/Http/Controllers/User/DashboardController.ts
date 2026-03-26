import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\DashboardController::index
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\DashboardController::index
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\DashboardController::index
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\DashboardController::index
 * @see app/Http/Controllers/User/DashboardController.php:16
 * @route '/ai-agents/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const DashboardController = { index }

export default DashboardController