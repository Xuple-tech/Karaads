import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/media/{path}'
*/
const showfe2c1dac4637fcf12419b185cb089aa3 = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showfe2c1dac4637fcf12419b185cb089aa3.url(args, options),
    method: 'get',
})

showfe2c1dac4637fcf12419b185cb089aa3.definition = {
    methods: ["get","head"],
    url: '/media/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/media/{path}'
*/
showfe2c1dac4637fcf12419b185cb089aa3.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    if (Array.isArray(args)) {
        args = {
            path: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        path: args.path,
    }

    return showfe2c1dac4637fcf12419b185cb089aa3.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/media/{path}'
*/
showfe2c1dac4637fcf12419b185cb089aa3.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showfe2c1dac4637fcf12419b185cb089aa3.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/media/{path}'
*/
showfe2c1dac4637fcf12419b185cb089aa3.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showfe2c1dac4637fcf12419b185cb089aa3.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/user-g-content/{path}'
*/
const showc249898f3796ab820171f15029f8f790 = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc249898f3796ab820171f15029f8f790.url(args, options),
    method: 'get',
})

showc249898f3796ab820171f15029f8f790.definition = {
    methods: ["get","head"],
    url: '/user-g-content/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/user-g-content/{path}'
*/
showc249898f3796ab820171f15029f8f790.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    if (Array.isArray(args)) {
        args = {
            path: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        path: args.path,
    }

    return showc249898f3796ab820171f15029f8f790.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/user-g-content/{path}'
*/
showc249898f3796ab820171f15029f8f790.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showc249898f3796ab820171f15029f8f790.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ImageController::show
* @see app/Http/Controllers/ImageController.php:11
* @route '/user-g-content/{path}'
*/
showc249898f3796ab820171f15029f8f790.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showc249898f3796ab820171f15029f8f790.url(args, options),
    method: 'head',
})

export const show = {
    '/media/{path}': showfe2c1dac4637fcf12419b185cb089aa3,
    '/user-g-content/{path}': showc249898f3796ab820171f15029f8f790,
}

const ImageController = { show }

export default ImageController