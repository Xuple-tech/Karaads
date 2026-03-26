import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\StudioController::index
* @see app/Http/Controllers/StudioController.php:10
* @route '/studio'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/studio',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StudioController::index
* @see app/Http/Controllers/StudioController.php:10
* @route '/studio'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StudioController::index
* @see app/Http/Controllers/StudioController.php:10
* @route '/studio'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StudioController::index
* @see app/Http/Controllers/StudioController.php:10
* @route '/studio'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const studio = {
    index: Object.assign(index, index),
}

export default studio