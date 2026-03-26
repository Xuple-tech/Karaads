import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
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
* @see \App\Http\Controllers\Meta\MetaAccountController::test
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
export const test = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/meta/accounts/{metaAccount}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::test
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
test.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return test.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::test
 * @see app/Http/Controllers/Meta/MetaAccountController.php:407
 * @route '/meta/accounts/{metaAccount}/test'
 */
test.post = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})
const accounts = {
    dashboard: Object.assign(dashboard, dashboard),
index: Object.assign(index, index),
disconnect: Object.assign(disconnect, disconnect),
updateStatus: Object.assign(updateStatus, updateStatus),
test: Object.assign(test, test),
}

export default accounts