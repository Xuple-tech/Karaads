import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PodcastController::index
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/studio/podcast-master',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::index
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::index
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::index
* @see app/Http/Controllers/PodcastController.php:25
* @route '/studio/podcast-master'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::create
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/podcast/generate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::create
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::create
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::create
* @see app/Http/Controllers/PodcastController.php:52
* @route '/podcast/generate'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:82
* @route '/podcast/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/podcast/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:82
* @route '/podcast/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::generate
* @see app/Http/Controllers/PodcastController.php:82
* @route '/podcast/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PodcastController::generateFromText
* @see app/Http/Controllers/PodcastController.php:143
* @route '/podcast/generate-from-text'
*/
export const generateFromText = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateFromText.url(options),
    method: 'post',
})

generateFromText.definition = {
    methods: ["post"],
    url: '/podcast/generate-from-text',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PodcastController::generateFromText
* @see app/Http/Controllers/PodcastController.php:143
* @route '/podcast/generate-from-text'
*/
generateFromText.url = (options?: RouteQueryOptions) => {
    return generateFromText.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::generateFromText
* @see app/Http/Controllers/PodcastController.php:143
* @route '/podcast/generate-from-text'
*/
generateFromText.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateFromText.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PodcastController::metadata
* @see app/Http/Controllers/PodcastController.php:228
* @route '/podcast/metadata'
*/
export const metadata = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metadata.url(options),
    method: 'get',
})

metadata.definition = {
    methods: ["get","head"],
    url: '/podcast/metadata',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::metadata
* @see app/Http/Controllers/PodcastController.php:228
* @route '/podcast/metadata'
*/
metadata.url = (options?: RouteQueryOptions) => {
    return metadata.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::metadata
* @see app/Http/Controllers/PodcastController.php:228
* @route '/podcast/metadata'
*/
metadata.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metadata.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::metadata
* @see app/Http/Controllers/PodcastController.php:228
* @route '/podcast/metadata'
*/
metadata.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: metadata.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::show
* @see app/Http/Controllers/PodcastController.php:268
* @route '/podcast/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/podcast/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::show
* @see app/Http/Controllers/PodcastController.php:268
* @route '/podcast/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::show
* @see app/Http/Controllers/PodcastController.php:268
* @route '/podcast/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::show
* @see app/Http/Controllers/PodcastController.php:268
* @route '/podcast/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PodcastController::deleteMethod
* @see app/Http/Controllers/PodcastController.php:246
* @route '/podcast/{id}'
*/
export const deleteMethod = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/podcast/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PodcastController::deleteMethod
* @see app/Http/Controllers/PodcastController.php:246
* @route '/podcast/{id}'
*/
deleteMethod.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::deleteMethod
* @see app/Http/Controllers/PodcastController.php:246
* @route '/podcast/{id}'
*/
deleteMethod.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
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

/**
* @see \App\Http\Controllers\PodcastController::list
* @see app/Http/Controllers/PodcastController.php:198
* @route '/podcasts'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/podcasts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PodcastController::list
* @see app/Http/Controllers/PodcastController.php:198
* @route '/podcasts'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PodcastController::list
* @see app/Http/Controllers/PodcastController.php:198
* @route '/podcasts'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PodcastController::list
* @see app/Http/Controllers/PodcastController.php:198
* @route '/podcasts'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

const PodcastController = { index, create, generate, generateFromText, metadata, show, deleteMethod, stream, download, list, delete: deleteMethod }

export default PodcastController