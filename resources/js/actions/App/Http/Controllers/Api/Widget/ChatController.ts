import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\ChatController::sendMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:25
 * @route '/api/v1/widget/chat'
 */
export const sendMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/api/v1/widget/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::sendMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:25
 * @route '/api/v1/widget/chat'
 */
sendMessage.url = (options?: RouteQueryOptions) => {
    return sendMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::sendMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:25
 * @route '/api/v1/widget/chat'
 */
sendMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseekChat
 * @see app/Http/Controllers/Api/Widget/ChatController.php:73
 * @route '/api/v1/widget/deepseek/chat'
 */
export const deepseekChat = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deepseekChat.url(options),
    method: 'post',
})

deepseekChat.definition = {
    methods: ["post"],
    url: '/api/v1/widget/deepseek/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseekChat
 * @see app/Http/Controllers/Api/Widget/ChatController.php:73
 * @route '/api/v1/widget/deepseek/chat'
 */
deepseekChat.url = (options?: RouteQueryOptions) => {
    return deepseekChat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseekChat
 * @see app/Http/Controllers/Api/Widget/ChatController.php:73
 * @route '/api/v1/widget/deepseek/chat'
 */
deepseekChat.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deepseekChat.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::getMessages
 * @see app/Http/Controllers/Api/Widget/ChatController.php:314
 * @route '/api/v1/widget/conversations/{conversation}/messages'
 */
export const getMessages = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMessages.url(args, options),
    method: 'get',
})

getMessages.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/conversations/{conversation}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::getMessages
 * @see app/Http/Controllers/Api/Widget/ChatController.php:314
 * @route '/api/v1/widget/conversations/{conversation}/messages'
 */
getMessages.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    conversation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversation: args.conversation,
                }

    return getMessages.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::getMessages
 * @see app/Http/Controllers/Api/Widget/ChatController.php:314
 * @route '/api/v1/widget/conversations/{conversation}/messages'
 */
getMessages.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMessages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Widget\ChatController::getMessages
 * @see app/Http/Controllers/Api/Widget/ChatController.php:314
 * @route '/api/v1/widget/conversations/{conversation}/messages'
 */
getMessages.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMessages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:349
 * @route '/api/v1/widget/messages/{message}'
 */
export const deleteMessage = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

deleteMessage.definition = {
    methods: ["delete"],
    url: '/api/v1/widget/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:349
 * @route '/api/v1/widget/messages/{message}'
 */
deleteMessage.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { message: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    message: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        message: args.message,
                }

    return deleteMessage.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:349
 * @route '/api/v1/widget/messages/{message}'
 */
deleteMessage.delete = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMessage.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createConversation
 * @see app/Http/Controllers/Api/Widget/ChatController.php:368
 * @route '/api/v1/widget/agent/conversations'
 */
export const createConversation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/v1/widget/agent/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createConversation
 * @see app/Http/Controllers/Api/Widget/ChatController.php:368
 * @route '/api/v1/widget/agent/conversations'
 */
createConversation.url = (options?: RouteQueryOptions) => {
    return createConversation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createConversation
 * @see app/Http/Controllers/Api/Widget/ChatController.php:368
 * @route '/api/v1/widget/agent/conversations'
 */
createConversation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
export const createMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createMessage.url(options),
    method: 'post',
})

createMessage.definition = {
    methods: ["post"],
    url: '/api/v1/widget/agent/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
createMessage.url = (options?: RouteQueryOptions) => {
    return createMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::createMessage
 * @see app/Http/Controllers/Api/Widget/ChatController.php:405
 * @route '/api/v1/widget/agent/messages'
 */
createMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createMessage.url(options),
    method: 'post',
})
const ChatController = { sendMessage, deepseekChat, getMessages, deleteMessage, createConversation, createMessage }

export default ChatController