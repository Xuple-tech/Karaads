import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::download
 * @see app/Http/Controllers/Api/ImageGenerationController.php:263
 * @route '/api/files/mgmt/x9z2c5v8/download/{fileId}/o7p0a3s6'
 */
export const download = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/api/files/mgmt/x9z2c5v8/download/{fileId}/o7p0a3s6',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::download
 * @see app/Http/Controllers/Api/ImageGenerationController.php:263
 * @route '/api/files/mgmt/x9z2c5v8/download/{fileId}/o7p0a3s6'
 */
download.url = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { fileId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    fileId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        fileId: args.fileId,
                }

    return download.definition.url
            .replace('{fileId}', parsedArgs.fileId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::download
 * @see app/Http/Controllers/Api/ImageGenerationController.php:263
 * @route '/api/files/mgmt/x9z2c5v8/download/{fileId}/o7p0a3s6'
 */
download.get = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::download
 * @see app/Http/Controllers/Api/ImageGenerationController.php:263
 * @route '/api/files/mgmt/x9z2c5v8/download/{fileId}/o7p0a3s6'
 */
download.head = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})
const file = {
    download: Object.assign(download, download),
}

export default file