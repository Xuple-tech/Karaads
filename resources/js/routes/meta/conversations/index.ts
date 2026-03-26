import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::list
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
export const list = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/meta/accounts/{metaAccount}/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::list
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
list.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return list.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::list
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
list.get = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::list
 * @see app/Http/Controllers/Meta/MetaMessageController.php:33
 * @route '/meta/accounts/{metaAccount}/conversations'
 */
list.head = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::show
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
export const show = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/meta/accounts/{metaAccount}/conversations/{metaConversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::show
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
show.url = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace('{metaConversation}', parsedArgs.metaConversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaMessageController::show
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
show.get = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaMessageController::show
 * @see app/Http/Controllers/Meta/MetaMessageController.php:78
 * @route '/meta/accounts/{metaAccount}/conversations/{metaConversation}'
 */
show.head = (args: { metaAccount: string | number, metaConversation: string | number } | [metaAccount: string | number, metaConversation: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const conversations = {
    list: Object.assign(list, list),
show: Object.assign(show, show),
}

export default conversations