import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
 * @see app/Http/Controllers/Api/ImageGenerationController.php:211
 * @route '/api/files/mgmt/x9z2c5v8/chat/{chatId}/list/q3w6e9r2'
 */
export const list = (args: { chatId: string | number } | [chatId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/files/mgmt/x9z2c5v8/chat/{chatId}/list/q3w6e9r2',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
 * @see app/Http/Controllers/Api/ImageGenerationController.php:211
 * @route '/api/files/mgmt/x9z2c5v8/chat/{chatId}/list/q3w6e9r2'
 */
list.url = (args: { chatId: string | number } | [chatId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { chatId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    chatId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        chatId: args.chatId,
                }

    return list.definition.url
            .replace('{chatId}', parsedArgs.chatId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
 * @see app/Http/Controllers/Api/ImageGenerationController.php:211
 * @route '/api/files/mgmt/x9z2c5v8/chat/{chatId}/list/q3w6e9r2'
 */
list.get = (args: { chatId: string | number } | [chatId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ImageGenerationController::list
 * @see app/Http/Controllers/Api/ImageGenerationController.php:211
 * @route '/api/files/mgmt/x9z2c5v8/chat/{chatId}/list/q3w6e9r2'
 */
list.head = (args: { chatId: string | number } | [chatId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(args, options),
    method: 'head',
})
const chat = {
    list: Object.assign(list, list),
}

export default chat