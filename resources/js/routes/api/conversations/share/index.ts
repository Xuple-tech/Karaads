import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ConversationShareController::create
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
export const create = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/conversations/{conversationId}/share/create',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConversationShareController::create
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
create.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::create
* @see app/Http/Controllers/ConversationShareController.php:17
* @route '/api/conversations/{conversationId}/share/create'
*/
create.post = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ConversationShareController::details
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
export const details = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

details.definition = {
    methods: ["get","head"],
    url: '/api/conversations/{conversationId}/share/details',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::details
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
details.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return details.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::details
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
details.get = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::details
* @see app/Http/Controllers/ConversationShareController.php:64
* @route '/api/conversations/{conversationId}/share/details'
*/
details.head = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: details.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationShareController::update
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
export const update = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/conversations/{conversationId}/share/update',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ConversationShareController::update
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
update.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::update
* @see app/Http/Controllers/ConversationShareController.php:198
* @route '/api/conversations/{conversationId}/share/update'
*/
update.put = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ConversationShareController::revoke
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
export const revoke = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

revoke.definition = {
    methods: ["post"],
    url: '/api/conversations/{conversationId}/share/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ConversationShareController::revoke
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
revoke.url = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revoke.definition.url
            .replace('{conversationId}', parsedArgs.conversationId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::revoke
* @see app/Http/Controllers/ConversationShareController.php:96
* @route '/api/conversations/{conversationId}/share/revoke'
*/
revoke.post = (args: { conversationId: string | number } | [conversationId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

const share = {
    create: Object.assign(create, create),
    details: Object.assign(details, details),
    update: Object.assign(update, update),
    revoke: Object.assign(revoke, revoke),
}

export default share