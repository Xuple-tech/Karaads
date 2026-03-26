import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\VoiceConversationController::stream
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
export const stream = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

stream.definition = {
    methods: ["get","head"],
    url: '/api/voice/stream-audio/{messageId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::stream
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
stream.url = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return stream.definition.url
            .replace('{messageId}', parsedArgs.messageId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::stream
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
stream.get = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stream.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::stream
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
stream.head = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stream.url(args, options),
    method: 'head',
})

const audio = {
    stream: Object.assign(stream, stream),
}

export default audio