import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ChatController::createConversation
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/conversations'
 */
export const createConversation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/chat/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::createConversation
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/conversations'
 */
createConversation.url = (options?: RouteQueryOptions) => {
    return createConversation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::createConversation
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/conversations'
 */
createConversation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::listConversations
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/conversations'
 */
export const listConversations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations.url(options),
    method: 'get',
})

listConversations.definition = {
    methods: ["get","head"],
    url: '/api/chat/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::listConversations
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/conversations'
 */
listConversations.url = (options?: RouteQueryOptions) => {
    return listConversations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::listConversations
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/conversations'
 */
listConversations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatController::listConversations
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/conversations'
 */
listConversations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listConversations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::showConversation
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/conversations/{id}'
 */
export const showConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation.url(args, options),
    method: 'get',
})

showConversation.definition = {
    methods: ["get","head"],
    url: '/api/chat/conversations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::showConversation
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/conversations/{id}'
 */
showConversation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showConversation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::showConversation
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/conversations/{id}'
 */
showConversation.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatController::showConversation
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/conversations/{id}'
 */
showConversation.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showConversation.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::updateConversation
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/conversations/{id}'
 */
export const updateConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConversation.url(args, options),
    method: 'put',
})

updateConversation.definition = {
    methods: ["put"],
    url: '/api/chat/conversations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatController::updateConversation
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/conversations/{id}'
 */
updateConversation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateConversation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::updateConversation
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/conversations/{id}'
 */
updateConversation.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateConversation.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatController::deleteConversation
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/conversations/{id}'
 */
export const deleteConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

deleteConversation.definition = {
    methods: ["delete"],
    url: '/api/chat/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ChatController::deleteConversation
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/conversations/{id}'
 */
deleteConversation.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteConversation.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::deleteConversation
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/conversations/{id}'
 */
deleteConversation.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ChatController::sendMessage
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/message'
 */
export const sendMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/api/chat/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::sendMessage
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/message'
 */
sendMessage.url = (options?: RouteQueryOptions) => {
    return sendMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::sendMessage
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/message'
 */
sendMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})
const ChatController = { createConversation, listConversations, showConversation, updateConversation, deleteConversation, sendMessage }

export default ChatController