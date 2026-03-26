import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:24
 * @route '/admin/personalizations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:24
 * @route '/admin/personalizations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:24
 * @route '/admin/personalizations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:24
 * @route '/admin/personalizations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:58
 * @route '/admin/personalizations/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:58
 * @route '/admin/personalizations/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:58
 * @route '/admin/personalizations/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:58
 * @route '/admin/personalizations/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:66
 * @route '/admin/personalizations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/personalizations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:66
 * @route '/admin/personalizations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:66
 * @route '/admin/personalizations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:97
 * @route '/admin/personalizations/{personalization}'
 */
export const edit = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:97
 * @route '/admin/personalizations/{personalization}'
 */
edit.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { personalization: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    personalization: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        personalization: typeof args.personalization === 'object'
                ? args.personalization.id
                : args.personalization,
                }

    return edit.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:97
 * @route '/admin/personalizations/{personalization}'
 */
edit.get = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:97
 * @route '/admin/personalizations/{personalization}'
 */
edit.head = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:107
 * @route '/admin/personalizations/{personalization}'
 */
export const update = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:107
 * @route '/admin/personalizations/{personalization}'
 */
update.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { personalization: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    personalization: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        personalization: typeof args.personalization === 'object'
                ? args.personalization.id
                : args.personalization,
                }

    return update.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:107
 * @route '/admin/personalizations/{personalization}'
 */
update.put = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:158
 * @route '/admin/personalizations/{personalization}'
 */
export const destroy = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/personalizations/{personalization}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:158
 * @route '/admin/personalizations/{personalization}'
 */
destroy.url = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { personalization: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { personalization: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    personalization: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        personalization: typeof args.personalization === 'object'
                ? args.personalization.id
                : args.personalization,
                }

    return destroy.definition.url
            .replace('{personalization}', parsedArgs.personalization.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:158
 * @route '/admin/personalizations/{personalization}'
 */
destroy.delete = (args: { personalization: string | { id: string } } | [personalization: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const personalizations = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default personalizations