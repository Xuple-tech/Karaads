import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import conversations from './conversations'
import messages4ba6e9 from './messages'
/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
export const index = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.url = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.get = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::index
 * @see app/Http/Controllers/ProjectChatController.php:32
 * @route '/projects/{project}/chat'
 */
index.head = (args: { project: string | number | { id: string | number } } | [project: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::messages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
export const messages = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/chat/conversations/{conversation}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectChatController::messages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
messages.url = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return messages.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::messages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
messages.get = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectChatController::messages
 * @see app/Http/Controllers/ProjectChatController.php:313
 * @route '/projects/{project}/chat/conversations/{conversation}/messages'
 */
messages.head = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectChatController::stream
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
export const stream = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/projects/{project}/chat/conversations/{conversation}/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectChatController::stream
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
stream.url = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return stream.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectChatController::stream
 * @see app/Http/Controllers/ProjectChatController.php:255
 * @route '/projects/{project}/chat/conversations/{conversation}/stream'
 */
stream.post = (args: { project: string | number | { id: string | number }, conversation: number | { id: number } } | [project: string | number | { id: string | number }, conversation: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})
const chat = {
    index: Object.assign(index, index),
conversations: Object.assign(conversations, conversations),
messages: Object.assign(messages, messages4ba6e9),
stream: Object.assign(stream, stream),
}

export default chat