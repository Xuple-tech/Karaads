import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
const listbbb70c82437ce45affa5741480c58d20 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'get',
})

listbbb70c82437ce45affa5741480c58d20.definition = {
    methods: ["get","head"],
    url: '/api/conversations/new-api-new-users0request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.url = (options?: RouteQueryOptions) => {
    return listbbb70c82437ce45affa5741480c58d20.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
const listc657702fdf6e10a7ec5be12f0f45f280 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'get',
})

listc657702fdf6e10a7ec5be12f0f45f280.definition = {
    methods: ["get","head"],
    url: '/api/conversations/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.url = (options?: RouteQueryOptions) => {
    return listc657702fdf6e10a7ec5be12f0f45f280.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'head',
})

export const list = {
    '/api/conversations/new-api-new-users0request': listbbb70c82437ce45affa5741480c58d20,
    '/api/conversations/list': listc657702fdf6e10a7ec5be12f0f45f280,
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/conversations/c-sdnsnd-smmsm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
export const clearAll = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
    method: 'delete',
})

clearAll.definition = {
    methods: ["delete"],
    url: '/api/conversations/clear',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clearAll.url = (options?: RouteQueryOptions) => {
    return clearAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clearAll.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
export const exportMethod = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/api/conversations/{id}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
export const statistics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/api/conversations/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.url = (options?: RouteQueryOptions) => {
    return statistics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
const chat4471953a02b2058754c28dca30a0f064 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat4471953a02b2058754c28dca30a0f064.url(options),
    method: 'post',
})

chat4471953a02b2058754c28dca30a0f064.definition = {
    methods: ["post"],
    url: '/api/create/challenge/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
chat4471953a02b2058754c28dca30a0f064.url = (options?: RouteQueryOptions) => {
    return chat4471953a02b2058754c28dca30a0f064.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
chat4471953a02b2058754c28dca30a0f064.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat4471953a02b2058754c28dca30a0f064.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
const chata079fca5f78406da3f809c4458862471 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chata079fca5f78406da3f809c4458862471.url(options),
    method: 'post',
})

chata079fca5f78406da3f809c4458862471.definition = {
    methods: ["post"],
    url: '/create-two-step-challagene',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
chata079fca5f78406da3f809c4458862471.url = (options?: RouteQueryOptions) => {
    return chata079fca5f78406da3f809c4458862471.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
chata079fca5f78406da3f809c4458862471.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chata079fca5f78406da3f809c4458862471.url(options),
    method: 'post',
})

export const chat = {
    '/api/create/challenge/message': chat4471953a02b2058754c28dca30a0f064,
    '/create-two-step-challagene': chata079fca5f78406da3f809c4458862471,
}

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
export const generateCanvasContent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCanvasContent.url(options),
    method: 'post',
})

generateCanvasContent.definition = {
    methods: ["post"],
    url: '/api/generate-canvas-content',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
generateCanvasContent.url = (options?: RouteQueryOptions) => {
    return generateCanvasContent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
generateCanvasContent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCanvasContent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/conversations/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
export const regenerateMessage = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})

regenerateMessage.definition = {
    methods: ["post"],
    url: '/c/{messageId}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerateMessage.url = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return regenerateMessage.definition.url
            .replace('{messageId}', parsedArgs.messageId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerateMessage.post = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})
const ChatController = { list, create, update, destroy, clearAll, exportMethod, statistics, chat, generateCanvasContent, search, regenerateMessage, export: exportMethod }

export default ChatController