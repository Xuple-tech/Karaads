import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::update
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
export const update = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/meta/drafts/{metaMessageDraft}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::update
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
update.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::update
 * @see app/Http/Controllers/Meta/MetaMessageController.php:234
 * @route '/meta/drafts/{metaMessageDraft}'
 */
update.put = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
export const send = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/meta/drafts/{metaMessageDraft}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
send.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return send.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::send
 * @see app/Http/Controllers/Meta/MetaMessageController.php:262
 * @route '/meta/drafts/{metaMessageDraft}/send'
 */
send.post = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::reject
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
export const reject = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/meta/drafts/{metaMessageDraft}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::reject
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
reject.url = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return reject.definition.url
            .replace('{metaMessageDraft}', parsedArgs.metaMessageDraft.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::reject
 * @see app/Http/Controllers/Meta/MetaMessageController.php:281
 * @route '/meta/drafts/{metaMessageDraft}/reject'
 */
reject.post = (args: { metaMessageDraft: string | number } | [metaMessageDraft: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})
const drafts = {
    update: Object.assign(update, update),
send: Object.assign(send, send),
reject: Object.assign(reject, reject),
}

export default drafts