import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ConversationShareController::viewShare
* @see app/Http/Controllers/ConversationShareController.php:128
* @route '/share/{token}'
*/
export const viewShare = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: viewShare.url(args, options),
    method: 'get',
})

viewShare.definition = {
    methods: ["get","head"],
    url: '/share/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::viewShare
* @see app/Http/Controllers/ConversationShareController.php:128
* @route '/share/{token}'
*/
viewShare.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return viewShare.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::viewShare
* @see app/Http/Controllers/ConversationShareController.php:128
* @route '/share/{token}'
*/
viewShare.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: viewShare.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::viewShare
* @see app/Http/Controllers/ConversationShareController.php:128
* @route '/share/{token}'
*/
viewShare.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: viewShare.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationShareController::getSharedConversationData
* @see app/Http/Controllers/ConversationShareController.php:161
* @route '/api/share/{token}/data'
*/
export const getSharedConversationData = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSharedConversationData.url(args, options),
    method: 'get',
})

getSharedConversationData.definition = {
    methods: ["get","head"],
    url: '/api/share/{token}/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::getSharedConversationData
* @see app/Http/Controllers/ConversationShareController.php:161
* @route '/api/share/{token}/data'
*/
getSharedConversationData.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    if (Array.isArray(args)) {
        args = {
            token: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        token: args.token,
    }

    return getSharedConversationData.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::getSharedConversationData
* @see app/Http/Controllers/ConversationShareController.php:161
* @route '/api/share/{token}/data'
*/
getSharedConversationData.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSharedConversationData.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::getSharedConversationData
* @see app/Http/Controllers/ConversationShareController.php:161
* @route '/api/share/{token}/data'
*/
getSharedConversationData.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSharedConversationData.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationShareController::createShare
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
export const createShare = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createShare.url(args, options),
    method: 'post',
})

createShare.definition = {
    methods: ["post"],
    url: '/api/conversations/{conversationId}/share/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConversationShareController::createShare
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
createShare.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return createShare.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::createShare
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
createShare.post = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createShare.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConversationShareController::getShare
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
export const getShare = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getShare.url(args, options),
    method: 'get',
})

getShare.definition = {
    methods: ["get","head"],
    url: '/api/conversations/{conversationId}/share/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::getShare
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
getShare.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return getShare.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::getShare
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
getShare.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getShare.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::getShare
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
getShare.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getShare.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationShareController::updateShare
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
export const updateShare = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateShare.url(args, options),
    method: 'put',
})

updateShare.definition = {
    methods: ["put"],
    url: '/api/conversations/{conversationId}/share/update',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConversationShareController::updateShare
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
updateShare.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateShare.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::updateShare
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
updateShare.put = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateShare.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ConversationShareController::revokeShare
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
export const revokeShare = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeShare.url(args, options),
    method: 'post',
})

revokeShare.definition = {
    methods: ["post"],
    url: '/api/conversations/{conversationId}/share/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConversationShareController::revokeShare
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
revokeShare.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revokeShare.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::revokeShare
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
revokeShare.post = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeShare.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConversationShareController::listUserShares
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
export const listUserShares = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listUserShares.url(options),
    method: 'get',
})

listUserShares.definition = {
    methods: ["get","head"],
    url: '/api/shares/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::listUserShares
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
listUserShares.url = (options?: RouteQueryOptions) => {
    return listUserShares.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::listUserShares
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
listUserShares.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listUserShares.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::listUserShares
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
listUserShares.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listUserShares.url(options),
    method: 'head',
})

const ConversationShareController = { viewShare, getSharedConversationData, createShare, getShare, updateShare, revokeShare, listUserShares }

export default ConversationShareController