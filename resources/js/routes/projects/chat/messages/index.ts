import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectChatController::send
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
export const send = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::send
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
send.url = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return send.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::send
 * @see app/Http/Controllers/ProjectChatController.php:159
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
send.post = (args: { project: string | { id: string }, conversation: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectChatController::pin
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
export const pin = (args: { project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})

pin.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::pin
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
pin.url = (args: { project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    conversation: args[1],
                    chat: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                                chat: typeof args.chat === 'object'
                ? args.chat.id
                : args.chat,
                }

    return pin.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace('{chat}', parsedArgs.chat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::pin
 * @see app/Http/Controllers/ProjectChatController.php:433
 * @route '/projects/{project}/chat/conversations/{conversation}/messages/{chat}/pin'
 */
pin.post = (args: { project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } } | [project: string | { id: string }, conversation: string | { id: string }, chat: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pin.url(args, options),
    method: 'post',
})
const messages = {
    send: Object.assign(send, send),
pin: Object.assign(pin, pin),
}

export default messages