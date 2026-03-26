import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AIModeController::list
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/list/q0w3e6r9'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/list/q0w3e6r9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::list
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/list/q0w3e6r9'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::list
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/list/q0w3e6r9'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::list
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/list/q0w3e6r9'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/create/z2x5c8v1'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/create/z2x5c8v1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/create/z2x5c8v1'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/create/z2x5c8v1'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/show/{uuid}/b4n7m0k3'
 */
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/show/{uuid}/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/show/{uuid}/b4n7m0k3'
 */
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/show/{uuid}/b4n7m0k3'
 */
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/show/{uuid}/b4n7m0k3'
 */
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/update/{uuid}/h6g9f2d5'
 */
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/update/{uuid}/h6g9f2d5',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/update/{uuid}/h6g9f2d5'
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
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/update/{uuid}/h6g9f2d5'
 */
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::deleteMethod
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/delete/{uuid}/j8k1l4z7'
 */
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/delete/{uuid}/j8k1l4z7',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::deleteMethod
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/delete/{uuid}/j8k1l4z7'
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
* @see \App\Http\Controllers\Admin\AIModeController::deleteMethod
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/delete/{uuid}/j8k1l4z7'
 */
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/toggle/{uuid}/s0a3d6f9'
 */
export const toggle = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

toggle.definition = {
    methods: ["patch"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/toggle/{uuid}/s0a3d6f9',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/toggle/{uuid}/s0a3d6f9'
 */
toggle.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return toggle.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/toggle/{uuid}/s0a3d6f9'
 */
toggle.patch = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/reorder/p2o5i8u1'
 */
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/reorder/p2o5i8u1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/reorder/p2o5i8u1'
 */
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/secure/w6e9r2t5/ai/modes/y8u1i4o7/reorder/p2o5i8u1'
 */
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})
const modes = {
    list: Object.assign(list, list),
create: Object.assign(create, create),
show: Object.assign(show, show),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
toggle: Object.assign(toggle, toggle),
reorder: Object.assign(reorder, reorder),
}

export default modes