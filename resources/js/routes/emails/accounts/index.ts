import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::imap
 * @see app/Http/Controllers/MailController.php:335
 * @route '/api/emails/accounts/imap'
 */
export const imap = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: imap.url(options),
    method: 'post',
})

imap.definition = {
    methods: ["post"],
    url: '/api/emails/accounts/imap',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::imap
 * @see app/Http/Controllers/MailController.php:335
 * @route '/api/emails/accounts/imap'
 */
imap.url = (options?: RouteQueryOptions) => {
    return imap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::imap
 * @see app/Http/Controllers/MailController.php:335
 * @route '/api/emails/accounts/imap'
 */
imap.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: imap.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::disconnect
 * @see app/Http/Controllers/MailController.php:380
 * @route '/api/emails/accounts/{accountId}'
 */
export const disconnect = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(args, options),
    method: 'delete',
})

disconnect.definition = {
    methods: ["delete"],
    url: '/api/emails/accounts/{accountId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MailController::disconnect
 * @see app/Http/Controllers/MailController.php:380
 * @route '/api/emails/accounts/{accountId}'
 */
disconnect.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { accountId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    accountId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        accountId: args.accountId,
                }

    return disconnect.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::disconnect
 * @see app/Http/Controllers/MailController.php:380
 * @route '/api/emails/accounts/{accountId}'
 */
disconnect.delete = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MailController::sync
 * @see app/Http/Controllers/MailController.php:406
 * @route '/api/emails/accounts/{accountId}/sync'
 */
export const sync = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(args, options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/api/emails/accounts/{accountId}/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::sync
 * @see app/Http/Controllers/MailController.php:406
 * @route '/api/emails/accounts/{accountId}/sync'
 */
sync.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { accountId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    accountId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        accountId: args.accountId,
                }

    return sync.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::sync
 * @see app/Http/Controllers/MailController.php:406
 * @route '/api/emails/accounts/{accountId}/sync'
 */
sync.post = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MailController::show
 * @see app/Http/Controllers/MailController.php:48
 * @route '/emails/accounts/{accountId}/emails'
 */
export const show = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/emails/accounts/{accountId}/emails',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MailController::show
 * @see app/Http/Controllers/MailController.php:48
 * @route '/emails/accounts/{accountId}/emails'
 */
show.url = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { accountId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    accountId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        accountId: args.accountId,
                }

    return show.definition.url
            .replace('{accountId}', parsedArgs.accountId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::show
 * @see app/Http/Controllers/MailController.php:48
 * @route '/emails/accounts/{accountId}/emails'
 */
show.get = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MailController::show
 * @see app/Http/Controllers/MailController.php:48
 * @route '/emails/accounts/{accountId}/emails'
 */
show.head = (args: { accountId: string | number } | [accountId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const accounts = {
    imap: Object.assign(imap, imap),
disconnect: Object.assign(disconnect, disconnect),
sync: Object.assign(sync, sync),
show: Object.assign(show, show),
}

export default accounts