import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\StaffController::index
 * @see app/Http/Controllers/Admin/StaffController.php:14
 * @route '/admin/staff'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/staff',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::index
 * @see app/Http/Controllers/Admin/StaffController.php:14
 * @route '/admin/staff'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::index
 * @see app/Http/Controllers/Admin/StaffController.php:14
 * @route '/admin/staff'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StaffController::index
 * @see app/Http/Controllers/Admin/StaffController.php:14
 * @route '/admin/staff'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::create
 * @see app/Http/Controllers/Admin/StaffController.php:23
 * @route '/admin/staff/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/staff/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::create
 * @see app/Http/Controllers/Admin/StaffController.php:23
 * @route '/admin/staff/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::create
 * @see app/Http/Controllers/Admin/StaffController.php:23
 * @route '/admin/staff/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StaffController::create
 * @see app/Http/Controllers/Admin/StaffController.php:23
 * @route '/admin/staff/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::store
 * @see app/Http/Controllers/Admin/StaffController.php:31
 * @route '/admin/staff'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/staff',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::store
 * @see app/Http/Controllers/Admin/StaffController.php:31
 * @route '/admin/staff'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::store
 * @see app/Http/Controllers/Admin/StaffController.php:31
 * @route '/admin/staff'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::show
 * @see app/Http/Controllers/Admin/StaffController.php:55
 * @route '/admin/staff/{staff}'
 */
export const show = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/staff/{staff}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::show
 * @see app/Http/Controllers/Admin/StaffController.php:55
 * @route '/admin/staff/{staff}'
 */
show.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { staff: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    staff: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        staff: typeof args.staff === 'object'
                ? args.staff.id
                : args.staff,
                }

    return show.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::show
 * @see app/Http/Controllers/Admin/StaffController.php:55
 * @route '/admin/staff/{staff}'
 */
show.get = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StaffController::show
 * @see app/Http/Controllers/Admin/StaffController.php:55
 * @route '/admin/staff/{staff}'
 */
show.head = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::edit
 * @see app/Http/Controllers/Admin/StaffController.php:63
 * @route '/admin/staff/{staff}/edit'
 */
export const edit = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/staff/{staff}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::edit
 * @see app/Http/Controllers/Admin/StaffController.php:63
 * @route '/admin/staff/{staff}/edit'
 */
edit.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { staff: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    staff: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        staff: typeof args.staff === 'object'
                ? args.staff.id
                : args.staff,
                }

    return edit.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::edit
 * @see app/Http/Controllers/Admin/StaffController.php:63
 * @route '/admin/staff/{staff}/edit'
 */
edit.get = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StaffController::edit
 * @see app/Http/Controllers/Admin/StaffController.php:63
 * @route '/admin/staff/{staff}/edit'
 */
edit.head = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::update
 * @see app/Http/Controllers/Admin/StaffController.php:71
 * @route '/admin/staff/{staff}'
 */
export const update = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admin/staff/{staff}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::update
 * @see app/Http/Controllers/Admin/StaffController.php:71
 * @route '/admin/staff/{staff}'
 */
update.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { staff: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    staff: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        staff: typeof args.staff === 'object'
                ? args.staff.id
                : args.staff,
                }

    return update.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::update
 * @see app/Http/Controllers/Admin/StaffController.php:71
 * @route '/admin/staff/{staff}'
 */
update.put = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Admin\StaffController::update
 * @see app/Http/Controllers/Admin/StaffController.php:71
 * @route '/admin/staff/{staff}'
 */
update.patch = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\StaffController::destroy
 * @see app/Http/Controllers/Admin/StaffController.php:94
 * @route '/admin/staff/{staff}'
 */
export const destroy = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/staff/{staff}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\StaffController::destroy
 * @see app/Http/Controllers/Admin/StaffController.php:94
 * @route '/admin/staff/{staff}'
 */
destroy.url = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { staff: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { staff: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    staff: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        staff: typeof args.staff === 'object'
                ? args.staff.id
                : args.staff,
                }

    return destroy.definition.url
            .replace('{staff}', parsedArgs.staff.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StaffController::destroy
 * @see app/Http/Controllers/Admin/StaffController.php:94
 * @route '/admin/staff/{staff}'
 */
destroy.delete = (args: { staff: number | { id: number } } | [staff: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const StaffController = { index, create, store, show, edit, update, destroy }

export default StaffController