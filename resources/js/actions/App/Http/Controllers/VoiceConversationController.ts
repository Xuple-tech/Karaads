import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\VoiceConversationController::index
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/voice-chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::index
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::index
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::index
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::show
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
export const show = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/c/{conversation}/voice',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::show
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
show.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::show
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
show.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::show
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
show.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

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
* @see app/Http/Controllers/VoiceConversationController.php:168
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
* @see app/Http/Controllers/VoiceConversationController.php:168
* @route '/api/voice/process-audio'
*/
processAudio.url = (options?: RouteQueryOptions) => {
    return processAudio.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::processAudio
* @see app/Http/Controllers/VoiceConversationController.php:168
* @route '/api/voice/process-audio'
*/
processAudio.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processAudio.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::processText
* @see app/Http/Controllers/VoiceConversationController.php:139
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
* @see app/Http/Controllers/VoiceConversationController.php:139
* @route '/api/voice/process-text'
*/
processText.url = (options?: RouteQueryOptions) => {
    return processText.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::processText
* @see app/Http/Controllers/VoiceConversationController.php:139
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
* @see app/Http/Controllers/VoiceConversationController.php:199
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
* @see app/Http/Controllers/VoiceConversationController.php:199
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
* @see app/Http/Controllers/VoiceConversationController.php:199
* @route '/api/voice/history/{conversationId}'
*/
history.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::history
* @see app/Http/Controllers/VoiceConversationController.php:199
* @route '/api/voice/history/{conversationId}'
*/
history.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
* @see app/Http/Controllers/VoiceConversationController.php:253
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
* @see app/Http/Controllers/VoiceConversationController.php:253
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
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
streamAudio.get = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: streamAudio.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::streamAudio
* @see app/Http/Controllers/VoiceConversationController.php:253
* @route '/api/voice/stream-audio/{messageId}'
*/
streamAudio.head = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: streamAudio.url(args, options),
    method: 'head',
})

const VoiceConversationController = { index, show, start, processAudio, processText, end, history, streamAudio }

export default VoiceConversationController