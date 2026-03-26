import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\FileController::upload
* @see app/Http/Controllers/Api/Widget/FileController.php:13
* @route '/api/v1/widget/files/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/api/v1/widget/files/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\FileController::upload
* @see app/Http/Controllers/Api/Widget/FileController.php:13
* @route '/api/v1/widget/files/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\FileController::upload
* @see app/Http/Controllers/Api/Widget/FileController.php:13
* @route '/api/v1/widget/files/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\FileController::show
* @see app/Http/Controllers/Api/Widget/FileController.php:93
* @route '/api/v1/widget/files/{file}'
*/
export const show = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/files/{file}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\FileController::show
* @see app/Http/Controllers/Api/Widget/FileController.php:93
* @route '/api/v1/widget/files/{file}'
*/
show.url = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file: args }
    }

    if (Array.isArray(args)) {
        args = {
            file: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        file: args.file,
    }

    return show.definition.url
            .replace('{file}', parsedArgs.file.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\FileController::show
* @see app/Http/Controllers/Api/Widget/FileController.php:93
* @route '/api/v1/widget/files/{file}'
*/
show.get = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Widget\FileController::show
* @see app/Http/Controllers/Api/Widget/FileController.php:93
* @route '/api/v1/widget/files/{file}'
*/
show.head = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Widget\FileController::destroy
* @see app/Http/Controllers/Api/Widget/FileController.php:104
* @route '/api/v1/widget/files/{file}'
*/
export const destroy = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/widget/files/{file}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Widget\FileController::destroy
* @see app/Http/Controllers/Api/Widget/FileController.php:104
* @route '/api/v1/widget/files/{file}'
*/
destroy.url = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { file: args }
    }

    if (Array.isArray(args)) {
        args = {
            file: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        file: args.file,
    }

    return destroy.definition.url
            .replace('{file}', parsedArgs.file.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\FileController::destroy
* @see app/Http/Controllers/Api/Widget/FileController.php:104
* @route '/api/v1/widget/files/{file}'
*/
destroy.delete = (args: { file: string | number } | [file: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const files = {
    upload: Object.assign(upload, upload),
    show: Object.assign(show, show),
    destroy: Object.assign(destroy, destroy),
}

export default files