import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::show
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:22
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
export const show = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/meta/accounts/{metaAccount}/preferences',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::show
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:22
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
show.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::show
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:22
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
show.get = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::show
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:22
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
show.head = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:60
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
export const update = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/meta/accounts/{metaAccount}/preferences',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:60
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
update.url = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{metaAccount}', parsedArgs.metaAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::update
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:60
 * @route '/meta/accounts/{metaAccount}/preferences'
 */
update.post = (args: { metaAccount: string | number } | [metaAccount: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::globalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:96
 * @route '/meta/preferences/global'
 */
export const globalPreferences = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: globalPreferences.url(options),
    method: 'get',
})

globalPreferences.definition = {
    methods: ["get","head"],
    url: '/meta/preferences/global',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::globalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:96
 * @route '/meta/preferences/global'
 */
globalPreferences.url = (options?: RouteQueryOptions) => {
    return globalPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::globalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:96
 * @route '/meta/preferences/global'
 */
globalPreferences.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: globalPreferences.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::globalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:96
 * @route '/meta/preferences/global'
 */
globalPreferences.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: globalPreferences.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::updateGlobalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
 * @route '/meta/preferences/global'
 */
export const updateGlobalPreferences = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateGlobalPreferences.url(options),
    method: 'post',
})

updateGlobalPreferences.definition = {
    methods: ["post"],
    url: '/meta/preferences/global',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::updateGlobalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
 * @route '/meta/preferences/global'
 */
updateGlobalPreferences.url = (options?: RouteQueryOptions) => {
    return updateGlobalPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaPreferenceController::updateGlobalPreferences
 * @see app/Http/Controllers/Meta/MetaPreferenceController.php:130
 * @route '/meta/preferences/global'
 */
updateGlobalPreferences.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateGlobalPreferences.url(options),
    method: 'post',
})
const MetaPreferenceController = { show, update, globalPreferences, updateGlobalPreferences }

export default MetaPreferenceController