import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import audio from './audio'
/**
* @see \App\Http\Controllers\VoiceConversationController::chat
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
export const chat = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

chat.definition = {
    methods: ["get","head"],
    url: '/voice-chat',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::chat
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
chat.url = (options?: RouteQueryOptions) => {
    return chat.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::chat
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
chat.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: chat.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::chat
* @see app/Http/Controllers/VoiceConversationController.php:29
* @route '/voice-chat'
*/
chat.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: chat.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::conversation
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
export const conversation = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

conversation.definition = {
    methods: ["get","head"],
    url: '/c/{conversation}/voice',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\VoiceConversationController::conversation
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
conversation.url = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return conversation.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\VoiceConversationController::conversation
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
conversation.get = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\VoiceConversationController::conversation
* @see app/Http/Controllers/VoiceConversationController.php:43
* @route '/c/{conversation}/voice'
*/
conversation.head = (args: { conversation: string | number } | [conversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversation.url(args, options),
    method: 'head',
})

const voice = {
    chat: Object.assign(chat, chat),
    conversation: Object.assign(conversation, conversation),
    audio: Object.assign(audio, audio),
}

export default voice