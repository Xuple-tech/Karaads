import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Docs\MainController::index
 * @see app/Http/Controllers/Docs/MainController.php:11
 * @route '/docs'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Docs\MainController::index
 * @see app/Http/Controllers/Docs/MainController.php:11
 * @route '/docs'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Docs\MainController::index
 * @see app/Http/Controllers/Docs/MainController.php:11
 * @route '/docs'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Docs\MainController::index
 * @see app/Http/Controllers/Docs/MainController.php:11
 * @route '/docs'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const MainController = { index }

export default MainController