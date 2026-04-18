import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/images/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::listGenerations
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/generations'
*/
export const listGenerations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listGenerations.url(options),
    method: 'get',
})

listGenerations.definition = {
    methods: ["get","head"],
    url: '/api/images/generations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::listGenerations
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/generations'
*/
listGenerations.url = (options?: RouteQueryOptions) => {
    return listGenerations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::listGenerations
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/generations'
*/
listGenerations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listGenerations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::listGenerations
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/generations'
*/
listGenerations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listGenerations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::showGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/generations/{id}'
*/
export const showGeneration = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGeneration.url(args, options),
    method: 'get',
})

showGeneration.definition = {
    methods: ["get","head"],
    url: '/api/images/generations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::showGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/generations/{id}'
*/
showGeneration.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showGeneration.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::showGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/generations/{id}'
*/
showGeneration.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showGeneration.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::showGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/generations/{id}'
*/
showGeneration.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showGeneration.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/generations/{id}'
*/
export const deleteGeneration = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteGeneration.url(args, options),
    method: 'delete',
})

deleteGeneration.definition = {
    methods: ["delete"],
    url: '/api/images/generations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/generations/{id}'
*/
deleteGeneration.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteGeneration.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteGeneration
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/generations/{id}'
*/
deleteGeneration.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteGeneration.url(args, options),
    method: 'delete',
})

const ImageGenerationController = { generate, listGenerations, showGeneration, deleteGeneration }

export default ImageGenerationController