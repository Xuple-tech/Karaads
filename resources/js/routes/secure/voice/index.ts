import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::create
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::create
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::create
* @see app/Http/Controllers/Api/VoiceConversationController.php:26
* @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
*/
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::list
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::list
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::list
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::list
* @see app/Http/Controllers/Api/VoiceConversationController.php:53
* @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::show
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
*/
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::show
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
*/
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::show
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
*/
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::show
* @see app/Http/Controllers/Api/VoiceConversationController.php:87
* @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
*/
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteMethod
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
*/
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteMethod
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
*/
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteMethod
* @see app/Http/Controllers/Api/VoiceConversationController.php:109
* @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
*/
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::message
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
*/
export const message = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})

message.definition = {
    methods: ["post"],
    url: '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::message
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
*/
message.url = (options?: RouteQueryOptions) => {
    return message.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::message
* @see app/Http/Controllers/Api/VoiceConversationController.php:137
* @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
*/
message.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::audio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
*/
export const audio = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audio.url(args, options),
    method: 'get',
})

audio.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::audio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
*/
audio.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return audio.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::audio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
*/
audio.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: audio.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::audio
* @see app/Http/Controllers/Api/VoiceConversationController.php:217
* @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
*/
audio.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: audio.url(args, options),
    method: 'head',
})

const voice = {
    create: Object.assign(create, create),
    list: Object.assign(list, list),
    show: Object.assign(show, show),
    delete: Object.assign(deleteMethod, deleteMethod),
    message: Object.assign(message, message),
    audio: Object.assign(audio, audio),
}

export default voice