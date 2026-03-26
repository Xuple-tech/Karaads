import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\ChatController::send
* @see app/Http/Controllers/Api/Widget/ChatController.php:25
* @route '/api/v1/widget/chat'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/v1/widget/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::send
* @see app/Http/Controllers/Api/Widget/ChatController.php:25
* @route '/api/v1/widget/chat'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::send
* @see app/Http/Controllers/Api/Widget/ChatController.php:25
* @route '/api/v1/widget/chat'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseek
* @see app/Http/Controllers/Api/Widget/ChatController.php:73
* @route '/api/v1/widget/deepseek/chat'
*/
export const deepseek = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deepseek.url(options),
    method: 'post',
})

deepseek.definition = {
    methods: ["post"],
    url: '/api/v1/widget/deepseek/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseek
* @see app/Http/Controllers/Api/Widget/ChatController.php:73
* @route '/api/v1/widget/deepseek/chat'
*/
deepseek.url = (options?: RouteQueryOptions) => {
    return deepseek.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deepseek
* @see app/Http/Controllers/Api/Widget/ChatController.php:73
* @route '/api/v1/widget/deepseek/chat'
*/
deepseek.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deepseek.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::messages
* @see app/Http/Controllers/Api/Widget/ChatController.php:314
* @route '/api/v1/widget/conversations/{conversation}/messages'
*/
export const messages = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/conversations/{conversation}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::messages
* @see app/Http/Controllers/Api/Widget/ChatController.php:314
* @route '/api/v1/widget/conversations/{conversation}/messages'
*/
messages.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return messages.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::messages
* @see app/Http/Controllers/Api/Widget/ChatController.php:314
* @route '/api/v1/widget/conversations/{conversation}/messages'
*/
messages.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::messages
* @see app/Http/Controllers/Api/Widget/ChatController.php:314
* @route '/api/v1/widget/conversations/{conversation}/messages'
*/
messages.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMethod
* @see app/Http/Controllers/Api/Widget/ChatController.php:349
* @route '/api/v1/widget/messages/{message}'
*/
export const deleteMethod = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/v1/widget/messages/{message}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMethod
* @see app/Http/Controllers/Api/Widget/ChatController.php:349
* @route '/api/v1/widget/messages/{message}'
*/
deleteMethod.url = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\ChatController::deleteMethod
* @see app/Http/Controllers/Api/Widget/ChatController.php:349
* @route '/api/v1/widget/messages/{message}'
*/
deleteMethod.delete = (args: { message: string | number } | [message: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

const chat = {
    send: Object.assign(send, send),
    deepseek: Object.assign(deepseek, deepseek),
    messages: Object.assign(messages, messages),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default chat