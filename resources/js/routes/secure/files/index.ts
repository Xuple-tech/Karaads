import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import chat from './chat'
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::upload
 * @see app/Http/Controllers/Api/ImageGenerationController.php:176
 * @route '/api/files/mgmt/x9z2c5v8/upload/b1n4m7k0'
 */
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/api/files/mgmt/x9z2c5v8/upload/b1n4m7k0',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::upload
 * @see app/Http/Controllers/Api/ImageGenerationController.php:176
 * @route '/api/files/mgmt/x9z2c5v8/upload/b1n4m7k0'
 */
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::upload
 * @see app/Http/Controllers/Api/ImageGenerationController.php:176
 * @route '/api/files/mgmt/x9z2c5v8/upload/b1n4m7k0'
 */
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
 * @see app/Http/Controllers/Api/ImageGenerationController.php:234
 * @route '/api/files/mgmt/x9z2c5v8/delete/{fileId}/t5y8u1i4'
 */
export const deleteMethod = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/files/mgmt/x9z2c5v8/delete/{fileId}/t5y8u1i4',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
 * @see app/Http/Controllers/Api/ImageGenerationController.php:234
 * @route '/api/files/mgmt/x9z2c5v8/delete/{fileId}/t5y8u1i4'
 */
deleteMethod.url = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{fileId}', parsedArgs.fileId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::deleteMethod
 * @see app/Http/Controllers/Api/ImageGenerationController.php:234
 * @route '/api/files/mgmt/x9z2c5v8/delete/{fileId}/t5y8u1i4'
 */
deleteMethod.delete = (args: { fileId: string | number } | [fileId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})
const files = {
    upload: Object.assign(upload, upload),
chat: Object.assign(chat, chat),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default files