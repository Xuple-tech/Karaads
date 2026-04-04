import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VoiceConversationController::start
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/start'
 */
export const start = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/api/voice/start',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::start
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/start'
 */
start.url = (options?: RouteQueryOptions) => {
    return start.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::start
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/start'
 */
start.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::processAudio
 * @see app/Http/Controllers/VoiceConversationController.php:136
 * @route '/api/voice/process-audio'
 */
export const processAudio = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processAudio.url(options),
    method: 'post',
})

processAudio.definition = {
    methods: ["post"],
    url: '/api/voice/process-audio',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::processAudio
 * @see app/Http/Controllers/VoiceConversationController.php:136
 * @route '/api/voice/process-audio'
 */
processAudio.url = (options?: RouteQueryOptions) => {
    return processAudio.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::processAudio
 * @see app/Http/Controllers/VoiceConversationController.php:136
 * @route '/api/voice/process-audio'
 */
processAudio.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processAudio.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::processText
 * @see app/Http/Controllers/VoiceConversationController.php:107
 * @route '/api/voice/process-text'
 */
export const processText = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processText.url(options),
    method: 'post',
})

processText.definition = {
    methods: ["post"],
    url: '/api/voice/process-text',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::processText
 * @see app/Http/Controllers/VoiceConversationController.php:107
 * @route '/api/voice/process-text'
 */
processText.url = (options?: RouteQueryOptions) => {
    return processText.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::processText
 * @see app/Http/Controllers/VoiceConversationController.php:107
 * @route '/api/voice/process-text'
 */
processText.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processText.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::end
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/end'
 */
export const end = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: end.url(options),
    method: 'post',
})

end.definition = {
    methods: ["post"],
    url: '/api/voice/end',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::end
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/end'
 */
end.url = (options?: RouteQueryOptions) => {
    return end.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::end
 * @see app/Http/Controllers/VoiceConversationController.php:0
 * @route '/api/voice/end'
 */
end.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: end.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::history
 * @see app/Http/Controllers/VoiceConversationController.php:167
 * @route '/api/voice/history/{conversationId}'
 */
export const history = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/voice/history/{conversationId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::history
 * @see app/Http/Controllers/VoiceConversationController.php:167
 * @route '/api/voice/history/{conversationId}'
 */
history.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversationId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    conversationId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversationId: args.conversationId,
                }

    return history.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::history
 * @see app/Http/Controllers/VoiceConversationController.php:167
 * @route '/api/voice/history/{conversationId}'
 */
history.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VoiceConversationController::history
 * @see app/Http/Controllers/VoiceConversationController.php:167
 * @route '/api/voice/history/{conversationId}'
 */
history.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
 * @see app/Http/Controllers/VoiceConversationController.php:221
 * @route '/api/voice/stream-audio/{messageId}'
 */
export const streamAudio = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: streamAudio.url(args, options),
    method: 'get',
})

streamAudio.definition = {
    methods: ["get","head"],
    url: '/api/voice/stream-audio/{messageId}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
 * @see app/Http/Controllers/VoiceConversationController.php:221
 * @route '/api/voice/stream-audio/{messageId}'
 */
streamAudio.url = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return streamAudio.definition.url
            .replace('{messageId}', parsedArgs.messageId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
 * @see app/Http/Controllers/VoiceConversationController.php:221
 * @route '/api/voice/stream-audio/{messageId}'
 */
streamAudio.get = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: streamAudio.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
 * @see app/Http/Controllers/VoiceConversationController.php:221
 * @route '/api/voice/stream-audio/{messageId}'
 */
streamAudio.head = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: streamAudio.url(args, options),
    method: 'head',
})
const VoiceConversationController = { start, processAudio, processText, end, history, streamAudio }

export default VoiceConversationController