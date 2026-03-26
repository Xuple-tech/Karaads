import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:34
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/list/x6z9a2s5'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:76
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/create/m8k1j4h7'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::update
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
 */
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::update
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
 */
update.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                }

    return update.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::update
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:151
 * @route '/api/admin/secure/w6e9r2t5/personalization/system/c4v7b0n3/update/{uuid}/g0f3d6s9'
 */
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
const system = {
    list: Object.assign(list, list),
create: Object.assign(create, create),
update: Object.assign(update, update),
}

export default system