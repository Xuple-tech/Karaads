import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::list
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:215
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/list/t4y7u0i3'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::create
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:258
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/create/p6a9s2d5'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::update
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
 */
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::update
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
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
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:329
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/update/{uuid}/l8z1x4c7'
 */
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteMethod
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
 */
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteMethod
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
 */
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationAdminController::deleteMethod
 * @see app/Http/Controllers/Admin/PersonalizationAdminController.php:368
 * @route '/api/admin/secure/w6e9r2t5/personalization/templates/q2w5e8r1/delete/{uuid}/v0b3n6m9'
 */
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})
const templates = {
    list: Object.assign(list, list),
create: Object.assign(create, create),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
}

export default templates