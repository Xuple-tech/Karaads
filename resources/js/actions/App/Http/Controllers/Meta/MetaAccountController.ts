import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaAccountController::dashboard
 * @see app/Http/Controllers/Meta/MetaAccountController.php:31
 * @route '/meta/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/meta/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::dashboard
 * @see app/Http/Controllers/Meta/MetaAccountController.php:31
 * @route '/meta/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::dashboard
 * @see app/Http/Controllers/Meta/MetaAccountController.php:31
 * @route '/meta/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaAccountController::dashboard
 * @see app/Http/Controllers/Meta/MetaAccountController.php:31
 * @route '/meta/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::index
 * @see app/Http/Controllers/Meta/MetaAccountController.php:107
 * @route '/meta/accounts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/meta/accounts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::index
 * @see app/Http/Controllers/Meta/MetaAccountController.php:107
 * @route '/meta/accounts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::index
 * @see app/Http/Controllers/Meta/MetaAccountController.php:107
 * @route '/meta/accounts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaAccountController::index
 * @see app/Http/Controllers/Meta/MetaAccountController.php:107
 * @route '/meta/accounts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiateOAuth
 * @see app/Http/Controllers/Meta/MetaAccountController.php:147
 * @route '/meta/accounts/initiate-oauth'
 */
export const initiateOAuth = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiateOAuth.url(options),
    method: 'post',
})

initiateOAuth.definition = {
    methods: ["post"],
    url: '/meta/accounts/initiate-oauth',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiateOAuth
 * @see app/Http/Controllers/Meta/MetaAccountController.php:147
 * @route '/meta/accounts/initiate-oauth'
 */
initiateOAuth.url = (options?: RouteQueryOptions) => {
    return initiateOAuth.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiateOAuth
 * @see app/Http/Controllers/Meta/MetaAccountController.php:147
 * @route '/meta/accounts/initiate-oauth'
 */
initiateOAuth.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiateOAuth.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::handleCallback
 * @see app/Http/Controllers/Meta/MetaAccountController.php:170
 * @route '/meta/oauth/callback'
 */
export const handleCallback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleCallback.url(options),
    method: 'get',
})

handleCallback.definition = {
    methods: ["get","head"],
    url: '/meta/oauth/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::handleCallback
 * @see app/Http/Controllers/Meta/MetaAccountController.php:170
 * @route '/meta/oauth/callback'
 */
handleCallback.url = (options?: RouteQueryOptions) => {
    return handleCallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::handleCallback
 * @see app/Http/Controllers/Meta/MetaAccountController.php:170
 * @route '/meta/oauth/callback'
 */
handleCallback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleCallback.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaAccountController::handleCallback
 * @see app/Http/Controllers/Meta/MetaAccountController.php:170
 * @route '/meta/oauth/callback'
 */
handleCallback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: handleCallback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::disconnect
 * @see app/Http/Controllers/Meta/MetaAccountController.php:325
 * @route '/meta/accounts/{metaAccount}'
 */
export const disconnect = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(args, options),
    method: 'delete',
})

disconnect.definition = {
    methods: ["delete"],
    url: '/meta/accounts/{metaAccount}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::disconnect
 * @see app/Http/Controllers/Meta/MetaAccountController.php:325
 * @route '/meta/accounts/{metaAccount}'
 */
disconnect.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return disconnect.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::disconnect
 * @see app/Http/Controllers/Meta/MetaAccountController.php:325
 * @route '/meta/accounts/{metaAccount}'
 */
disconnect.delete = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disconnect.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::updateStatus
 * @see app/Http/Controllers/Meta/MetaAccountController.php:362
 * @route '/meta/accounts/{metaAccount}/status'
 */
export const updateStatus = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStatus.url(args, options),
    method: 'post',
})

updateStatus.definition = {
    methods: ["post"],
    url: '/meta/accounts/{metaAccount}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::updateStatus
 * @see app/Http/Controllers/Meta/MetaAccountController.php:362
 * @route '/meta/accounts/{metaAccount}/status'
 */
updateStatus.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateStatus.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::updateStatus
 * @see app/Http/Controllers/Meta/MetaAccountController.php:362
 * @route '/meta/accounts/{metaAccount}/status'
 */
updateStatus.post = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::testConnection
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
export const testConnection = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConnection.url(args, options),
    method: 'post',
})

testConnection.definition = {
    methods: ["post"],
    url: '/meta/accounts/{metaAccount}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::testConnection
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
testConnection.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return testConnection.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::testConnection
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
testConnection.post = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testConnection.url(args, options),
    method: 'post',
})
const MetaAccountController = { dashboard, index, initiateOAuth, handleCallback, disconnect, updateStatus, testConnection }

export default MetaAccountController