import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversations
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
export const conversations = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/meta/accounts/{metaAccount}/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversations
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
conversations.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaAccount: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaAccount: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaAccount: args.metaAccount,
                }

    return conversations.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversations
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
conversations.get = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversations
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
conversations.head = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversation
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
export const conversation = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})

conversation.definition = {
    methods: ["get","head"],
    url: '/meta/accounts/{metaAccount}/conversations/{metaConversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversation
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
conversation.url = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    metaAccount: args[0],
                    metaConversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaAccount: args.metaAccount,
                                metaConversation: args.metaConversation,
                }

    return conversation.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace('{metaConversation}', parsedArgs.metaConversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversation
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
conversation.get = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversation.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::conversation
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
conversation.head = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversation.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyzeAndDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
export const analyzeAndDraft = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeAndDraft.url(args, options),
    method: 'post',
})

analyzeAndDraft.definition = {
    methods: ["post"],
    url: '/meta/messages/{metaMessage}/analyze-and-draft',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyzeAndDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
analyzeAndDraft.url = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaMessage: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaMessage: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaMessage: args.metaMessage,
                }

    return analyzeAndDraft.definition.url
            .replace('{metaMessage}', parsedArgs.metaMessage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyzeAndDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
analyzeAndDraft.post = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyzeAndDraft.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::updateDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
export const updateDraft = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDraft.url(args, options),
    method: 'put',
})

updateDraft.definition = {
    methods: ["put"],
    url: '/meta/drafts/{metaMessageDraft}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::updateDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
updateDraft.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaMessageDraft: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaMessageDraft: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaMessageDraft: args.metaMessageDraft,
                }

    return updateDraft.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::updateDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
updateDraft.put = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateDraft.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::sendDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
export const sendDraft = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendDraft.url(args, options),
    method: 'post',
})

sendDraft.definition = {
    methods: ["post"],
    url: '/meta/drafts/{metaMessageDraft}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::sendDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
sendDraft.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaMessageDraft: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaMessageDraft: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaMessageDraft: args.metaMessageDraft,
                }

    return sendDraft.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::sendDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
sendDraft.post = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendDraft.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::rejectDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
export const rejectDraft = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectDraft.url(args, options),
    method: 'post',
})

rejectDraft.definition = {
    methods: ["post"],
    url: '/meta/drafts/{metaMessageDraft}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::rejectDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
rejectDraft.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaMessageDraft: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaMessageDraft: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaMessageDraft: args.metaMessageDraft,
                }

    return rejectDraft.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::rejectDraft
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
rejectDraft.post = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectDraft.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:304
 * @route '/meta/conversations/{metaConversation}/send'
 */
export const send = (args: { metaConversation: string | number } | [metaConversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/meta/conversations/{metaConversation}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:304
 * @route '/meta/conversations/{metaConversation}/send'
 */
send.url = (args: { metaConversation: string | number } | [metaConversation: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metaConversation: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    metaConversation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        metaConversation: args.metaConversation,
                }

    return send.definition.url
            .replace('{metaConversation}', parsedArgs.metaConversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:304
 * @route '/meta/conversations/{metaConversation}/send'
 */
send.post = (args: { metaConversation: string | number } | [metaConversation: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})
const MetaMessageController = { conversations, conversation, analyzeAndDraft, updateDraft, sendDraft, rejectDraft, send }

export default MetaMessageController