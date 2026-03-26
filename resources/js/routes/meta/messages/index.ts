import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyze
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
export const analyze = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyze.url(args, options),
    method: 'post',
})

analyze.definition = {
    methods: ["post"],
    url: '/meta/messages/{metaMessage}/analyze-and-draft',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyze
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
analyze.url = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return analyze.definition.url
            .replace('{metaMessage}', parsedArgs.metaMessage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::analyze
 * @see app/Http/Controllers/Meta/MetaMessageController.php:144
 * @route '/meta/messages/{metaMessage}/analyze-and-draft'
 */
analyze.post = (args: { metaMessage: string | number } | [metaMessage: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: analyze.url(args, options),
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
const messages = {
    analyze: Object.assign(analyze, analyze),
send: Object.assign(send, send),
}

export default messages