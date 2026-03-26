import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::generate
* @see app/Http/Controllers/ChatController.php:953
* @route '/api/generate-canvas-content'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/generate-canvas-content',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::generate
* @see app/Http/Controllers/ChatController.php:953
* @route '/api/generate-canvas-content'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::generate
* @see app/Http/Controllers/ChatController.php:953
* @route '/api/generate-canvas-content'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

const canvas = {
    generate: Object.assign(generate, generate),
}

export default canvas