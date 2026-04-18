import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/conversations'
*/
export const createConversation = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

createConversation.definition = {
    methods: ["post"],
    url: '/api/voice/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/conversations'
*/
createConversation.url = (options?: RouteQueryOptions) => {
    return createConversation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/conversations'
*/
createConversation.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/conversations'
*/
export const listConversations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations.url(options),
    method: 'get',
})

listConversations.definition = {
    methods: ["get","head"],
    url: '/api/voice/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/conversations'
*/
listConversations.url = (options?: RouteQueryOptions) => {
    return listConversations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/conversations'
*/
listConversations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/conversations'
*/
listConversations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listConversations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/conversations/{id}'
*/
export const showConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation.url(args, options),
    method: 'get',
})

showConversation.definition = {
    methods: ["get","head"],
    url: '/api/voice/conversations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/conversations/{id}'
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
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/conversations/{id}'
*/
showConversation.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/conversations/{id}'
*/
showConversation.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showConversation.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/conversations/{id}'
*/
export const deleteConversation = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

deleteConversation.definition = {
    methods: ["delete"],
    url: '/api/voice/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/conversations/{id}'
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
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/conversations/{id}'
*/
deleteConversation.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/message'
*/
export const sendVoiceMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessage.url(options),
    method: 'post',
})

sendVoiceMessage.definition = {
    methods: ["post"],
    url: '/api/voice/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/message'
*/
sendVoiceMessage.url = (options?: RouteQueryOptions) => {
    return sendVoiceMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/message'
*/
sendVoiceMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/audio/{id}'
*/
export const getAudio = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudio.url(args, options),
    method: 'get',
})

getAudio.definition = {
    methods: ["get","head"],
    url: '/api/voice/audio/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/audio/{id}'
*/
getAudio.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getAudio.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/audio/{id}'
*/
getAudio.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudio.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/audio/{id}'
*/
getAudio.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAudio.url(args, options),
    method: 'head',
})

const VoiceConversationController = { createConversation, listConversations, showConversation, deleteConversation, sendVoiceMessage, getAudio }

export default VoiceConversationController