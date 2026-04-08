import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::verify
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:16
 * @route '/meta/webhook/receive/{token}'
 */
export const verify = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})

verify.definition = {
    methods: ["get","head"],
    url: '/meta/webhook/receive/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::verify
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:16
 * @route '/meta/webhook/receive/{token}'
 */
verify.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return verify.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::verify
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:16
 * @route '/meta/webhook/receive/{token}'
 */
verify.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verify.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::verify
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:16
 * @route '/meta/webhook/receive/{token}'
 */
verify.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verify.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::handle
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:32
 * @route '/meta/webhook/receive/{token}'
 */
export const handle = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/meta/webhook/receive/{token}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::handle
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:32
 * @route '/meta/webhook/receive/{token}'
 */
handle.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return handle.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaWebhookController::handle
 * @see app/Http/Controllers/Meta/MetaWebhookController.php:32
 * @route '/meta/webhook/receive/{token}'
 */
handle.post = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(args, options),
    method: 'post',
})
const MetaWebhookController = { verify, handle }

export default MetaWebhookController