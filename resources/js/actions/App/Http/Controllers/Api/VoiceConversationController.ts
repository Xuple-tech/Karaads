import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/conversations'
 */
const createConversation2dd9a99eca9edd8d48a0293ae5192752 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation2dd9a99eca9edd8d48a0293ae5192752.url(options),
    method: 'post',
})

createConversation2dd9a99eca9edd8d48a0293ae5192752.definition = {
    methods: ["post"],
    url: '/api/voice/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/conversations'
 */
createConversation2dd9a99eca9edd8d48a0293ae5192752.url = (options?: RouteQueryOptions) => {
    return createConversation2dd9a99eca9edd8d48a0293ae5192752.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/conversations'
 */
createConversation2dd9a99eca9edd8d48a0293ae5192752.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation2dd9a99eca9edd8d48a0293ae5192752.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
 */
const createConversation134901e2dc08b7e5b5d91be374ff6f9d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation134901e2dc08b7e5b5d91be374ff6f9d.url(options),
    method: 'post',
})

createConversation134901e2dc08b7e5b5d91be374ff6f9d.definition = {
    methods: ["post"],
    url: '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
 */
createConversation134901e2dc08b7e5b5d91be374ff6f9d.url = (options?: RouteQueryOptions) => {
    return createConversation134901e2dc08b7e5b5d91be374ff6f9d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::createConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:26
 * @route '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6'
 */
createConversation134901e2dc08b7e5b5d91be374ff6f9d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createConversation134901e2dc08b7e5b5d91be374ff6f9d.url(options),
    method: 'post',
})

export const createConversation = {
    '/api/voice/conversations': createConversation2dd9a99eca9edd8d48a0293ae5192752,
    '/api/voice/secure/v8n5m2k9/conv/create/j4h7g3f6': createConversation134901e2dc08b7e5b5d91be374ff6f9d,
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/conversations'
 */
const listConversations2dd9a99eca9edd8d48a0293ae5192752 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations2dd9a99eca9edd8d48a0293ae5192752.url(options),
    method: 'get',
})

listConversations2dd9a99eca9edd8d48a0293ae5192752.definition = {
    methods: ["get","head"],
    url: '/api/voice/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/conversations'
 */
listConversations2dd9a99eca9edd8d48a0293ae5192752.url = (options?: RouteQueryOptions) => {
    return listConversations2dd9a99eca9edd8d48a0293ae5192752.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/conversations'
 */
listConversations2dd9a99eca9edd8d48a0293ae5192752.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations2dd9a99eca9edd8d48a0293ae5192752.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/conversations'
 */
listConversations2dd9a99eca9edd8d48a0293ae5192752.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listConversations2dd9a99eca9edd8d48a0293ae5192752.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
 */
const listConversations74827fa97922c2d33c380c6486b61a91 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations74827fa97922c2d33c380c6486b61a91.url(options),
    method: 'get',
})

listConversations74827fa97922c2d33c380c6486b61a91.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
 */
listConversations74827fa97922c2d33c380c6486b61a91.url = (options?: RouteQueryOptions) => {
    return listConversations74827fa97922c2d33c380c6486b61a91.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
 */
listConversations74827fa97922c2d33c380c6486b61a91.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listConversations74827fa97922c2d33c380c6486b61a91.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::listConversations
 * @see app/Http/Controllers/Api/VoiceConversationController.php:53
 * @route '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8'
 */
listConversations74827fa97922c2d33c380c6486b61a91.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listConversations74827fa97922c2d33c380c6486b61a91.url(options),
    method: 'head',
})

export const listConversations = {
    '/api/voice/conversations': listConversations2dd9a99eca9edd8d48a0293ae5192752,
    '/api/voice/secure/v8n5m2k9/conv/list/l9p2o5i8': listConversations74827fa97922c2d33c380c6486b61a91,
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/conversations/{id}'
 */
const showConversation0b090a3f39dca5c58f65774c18a0dcaf = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation0b090a3f39dca5c58f65774c18a0dcaf.url(args, options),
    method: 'get',
})

showConversation0b090a3f39dca5c58f65774c18a0dcaf.definition = {
    methods: ["get","head"],
    url: '/api/voice/conversations/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/conversations/{id}'
 */
showConversation0b090a3f39dca5c58f65774c18a0dcaf.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showConversation0b090a3f39dca5c58f65774c18a0dcaf.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/conversations/{id}'
 */
showConversation0b090a3f39dca5c58f65774c18a0dcaf.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation0b090a3f39dca5c58f65774c18a0dcaf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/conversations/{id}'
 */
showConversation0b090a3f39dca5c58f65774c18a0dcaf.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showConversation0b090a3f39dca5c58f65774c18a0dcaf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
 */
const showConversation0a3c62bfdd30f46c4ba918f76694076b = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation0a3c62bfdd30f46c4ba918f76694076b.url(args, options),
    method: 'get',
})

showConversation0a3c62bfdd30f46c4ba918f76694076b.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
 */
showConversation0a3c62bfdd30f46c4ba918f76694076b.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showConversation0a3c62bfdd30f46c4ba918f76694076b.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
 */
showConversation0a3c62bfdd30f46c4ba918f76694076b.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showConversation0a3c62bfdd30f46c4ba918f76694076b.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::showConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:87
 * @route '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0'
 */
showConversation0a3c62bfdd30f46c4ba918f76694076b.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showConversation0a3c62bfdd30f46c4ba918f76694076b.url(args, options),
    method: 'head',
})

export const showConversation = {
    '/api/voice/conversations/{id}': showConversation0b090a3f39dca5c58f65774c18a0dcaf,
    '/api/voice/secure/v8n5m2k9/conv/show/{uuid}/u1y4t7r0': showConversation0a3c62bfdd30f46c4ba918f76694076b,
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/conversations/{id}'
 */
const deleteConversation0b090a3f39dca5c58f65774c18a0dcaf = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.url(args, options),
    method: 'delete',
})

deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.definition = {
    methods: ["delete"],
    url: '/api/voice/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/conversations/{id}'
 */
deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/conversations/{id}'
 */
deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversation0b090a3f39dca5c58f65774c18a0dcaf.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
 */
const deleteConversationda159b5e9661f222467d254881d907e1 = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversationda159b5e9661f222467d254881d907e1.url(args, options),
    method: 'delete',
})

deleteConversationda159b5e9661f222467d254881d907e1.definition = {
    methods: ["delete"],
    url: '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
 */
deleteConversationda159b5e9661f222467d254881d907e1.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteConversationda159b5e9661f222467d254881d907e1.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::deleteConversation
 * @see app/Http/Controllers/Api/VoiceConversationController.php:109
 * @route '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2'
 */
deleteConversationda159b5e9661f222467d254881d907e1.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteConversationda159b5e9661f222467d254881d907e1.url(args, options),
    method: 'delete',
})

export const deleteConversation = {
    '/api/voice/conversations/{id}': deleteConversation0b090a3f39dca5c58f65774c18a0dcaf,
    '/api/voice/secure/v8n5m2k9/conv/delete/{uuid}/e3w6q9a2': deleteConversationda159b5e9661f222467d254881d907e1,
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/message'
 */
const sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.url(options),
    method: 'post',
})

sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.definition = {
    methods: ["post"],
    url: '/api/voice/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/message'
 */
sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.url = (options?: RouteQueryOptions) => {
    return sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/message'
 */
sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
 */
const sendVoiceMessage17ace9c47fe6d23255f465da4c340701 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessage17ace9c47fe6d23255f465da4c340701.url(options),
    method: 'post',
})

sendVoiceMessage17ace9c47fe6d23255f465da4c340701.definition = {
    methods: ["post"],
    url: '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
 */
sendVoiceMessage17ace9c47fe6d23255f465da4c340701.url = (options?: RouteQueryOptions) => {
    return sendVoiceMessage17ace9c47fe6d23255f465da4c340701.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::sendVoiceMessage
 * @see app/Http/Controllers/Api/VoiceConversationController.php:137
 * @route '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4'
 */
sendVoiceMessage17ace9c47fe6d23255f465da4c340701.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendVoiceMessage17ace9c47fe6d23255f465da4c340701.url(options),
    method: 'post',
})

export const sendVoiceMessage = {
    '/api/voice/message': sendVoiceMessagec83a7fb96de8aabcb0a0c0a97a6ed658,
    '/api/voice/secure/v8n5m2k9/msg/send/s5d8f1g4': sendVoiceMessage17ace9c47fe6d23255f465da4c340701,
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/audio/{id}'
 */
const getAudioc00b570656920499025738d576aff2a3 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudioc00b570656920499025738d576aff2a3.url(args, options),
    method: 'get',
})

getAudioc00b570656920499025738d576aff2a3.definition = {
    methods: ["get","head"],
    url: '/api/voice/audio/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/audio/{id}'
 */
getAudioc00b570656920499025738d576aff2a3.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getAudioc00b570656920499025738d576aff2a3.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/audio/{id}'
 */
getAudioc00b570656920499025738d576aff2a3.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudioc00b570656920499025738d576aff2a3.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/audio/{id}'
 */
getAudioc00b570656920499025738d576aff2a3.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAudioc00b570656920499025738d576aff2a3.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
 */
const getAudioad40507628ade659773d1b3b82f0236d = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudioad40507628ade659773d1b3b82f0236d.url(args, options),
    method: 'get',
})

getAudioad40507628ade659773d1b3b82f0236d.definition = {
    methods: ["get","head"],
    url: '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
 */
getAudioad40507628ade659773d1b3b82f0236d.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getAudioad40507628ade659773d1b3b82f0236d.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
 */
getAudioad40507628ade659773d1b3b82f0236d.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAudioad40507628ade659773d1b3b82f0236d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\VoiceConversationController::getAudio
 * @see app/Http/Controllers/Api/VoiceConversationController.php:217
 * @route '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6'
 */
getAudioad40507628ade659773d1b3b82f0236d.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAudioad40507628ade659773d1b3b82f0236d.url(args, options),
    method: 'head',
})

export const getAudio = {
    '/api/voice/audio/{id}': getAudioc00b570656920499025738d576aff2a3,
    '/api/voice/secure/v8n5m2k9/audio/get/{uuid}/h7j0k3l6': getAudioad40507628ade659773d1b3b82f0236d,
}

const VoiceConversationController = { createConversation, listConversations, showConversation, deleteConversation, sendVoiceMessage, getAudio }

export default VoiceConversationController