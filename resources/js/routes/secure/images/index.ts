import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/gen/f4g7h0j3/create/k6l9z2x5'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/images/gen/f4g7h0j3/create/k6l9z2x5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/gen/f4g7h0j3/create/k6l9z2x5'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::generate
* @see app/Http/Controllers/Api/ImageGenerationController.php:28
* @route '/api/images/gen/f4g7h0j3/create/k6l9z2x5'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/gen/f4g7h0j3/list/c8v1b4n7'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/images/gen/f4g7h0j3/list/c8v1b4n7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/gen/f4g7h0j3/list/c8v1b4n7'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/gen/f4g7h0j3/list/c8v1b4n7'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
* @see app/Http/Controllers/Api/ImageGenerationController.php:100
* @route '/api/images/gen/f4g7h0j3/list/c8v1b4n7'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::show
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/gen/f4g7h0j3/show/{uuid}/m0p3q6w9'
*/
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/images/gen/f4g7h0j3/show/{uuid}/m0p3q6w9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::show
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/gen/f4g7h0j3/show/{uuid}/m0p3q6w9'
*/
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::show
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/gen/f4g7h0j3/show/{uuid}/m0p3q6w9'
*/
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::show
* @see app/Http/Controllers/Api/ImageGenerationController.php:130
* @route '/api/images/gen/f4g7h0j3/show/{uuid}/m0p3q6w9'
*/
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/gen/f4g7h0j3/delete/{uuid}/a2s5d8f1'
*/
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/images/gen/f4g7h0j3/delete/{uuid}/a2s5d8f1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/gen/f4g7h0j3/delete/{uuid}/a2s5d8f1'
*/
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
* @see app/Http/Controllers/Api/ImageGenerationController.php:148
* @route '/api/images/gen/f4g7h0j3/delete/{uuid}/a2s5d8f1'
*/
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

const images = {
    generate: Object.assign(generate, generate),
    list: Object.assign(list, list),
    show: Object.assign(show, show),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default images