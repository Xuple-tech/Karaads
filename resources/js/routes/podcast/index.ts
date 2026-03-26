import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PodcastController::library
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
export const library = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})

library.definition = {
    methods: ["get","head"],
    url: '/studio/podcast-master',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::library
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
library.url = (options?: RouteQueryOptions) => {
    return library.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::library
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
library.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: library.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::library
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
library.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: library.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(options),
    method: 'get',
})

generate.definition = {
    methods: ["get","head"],
    url: '/podcast/generate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
generate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: generate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
generate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: generate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::stream
* @see app/Http/Controllers/PodcastController.php:304
* @route '/podcast/{id}/stream'
*/
export const stream = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

stream.definition = {
    methods: ["get","head"],
    url: '/podcast/{id}/stream',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::stream
* @see app/Http/Controllers/PodcastController.php:304
* @route '/podcast/{id}/stream'
*/
stream.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return stream.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::stream
* @see app/Http/Controllers/PodcastController.php:304
* @route '/podcast/{id}/stream'
*/
stream.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::stream
* @see app/Http/Controllers/PodcastController.php:304
* @route '/podcast/{id}/stream'
*/
stream.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stream.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::download
* @see app/Http/Controllers/PodcastController.php:327
* @route '/podcast/{id}/download'
*/
export const download = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/podcast/{id}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::download
* @see app/Http/Controllers/PodcastController.php:327
* @route '/podcast/{id}/download'
*/
download.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return download.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::download
* @see app/Http/Controllers/PodcastController.php:327
* @route '/podcast/{id}/download'
*/
download.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::download
* @see app/Http/Controllers/PodcastController.php:327
* @route '/podcast/{id}/download'
*/
download.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

const podcast = {
    library: Object.assign(library, library),
    generate: Object.assign(generate, generate),
    stream: Object.assign(stream, stream),
    download: Object.assign(download, download),
}

export default podcast