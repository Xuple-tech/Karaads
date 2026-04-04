import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import file from './file'
/**
* @see \App\Http\Controllers\ChatController::sendm
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
export const sendm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendm.url(options),
    method: 'post',
})

sendm.definition = {
    methods: ["post"],
    url: '/api/create/challenge/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::sendm
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
sendm.url = (options?: RouteQueryOptions) => {
    return sendm.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::sendm
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
sendm.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendm.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::newMethod
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
export const newMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: newMethod.url(options),
    method: 'get',
})

newMethod.definition = {
    methods: ["get","head"],
    url: '/c/new',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::newMethod
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
newMethod.url = (options?: RouteQueryOptions) => {
    return newMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::newMethod
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
newMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: newMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::newMethod
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
newMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: newMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
export const show = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/c/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.url = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { conversation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    conversation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return show.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.get = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.head = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::send
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/create-two-step-challagene',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::send
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::send
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::regenerate
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
export const regenerate = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/c/{messageId}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::regenerate
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerate.url = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { messageId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    messageId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        messageId: args.messageId,
                }

    return regenerate.definition.url
            .replace('{messageId}', parsedArgs.messageId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::regenerate
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerate.post = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})
const chat = {
    file: Object.assign(file, file),
sendm: Object.assign(sendm, sendm),
new: Object.assign(newMethod, newMethod),
show: Object.assign(show, show),
send: Object.assign(send, send),
regenerate: Object.assign(regenerate, regenerate),
}

export default chat