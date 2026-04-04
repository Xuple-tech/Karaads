import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:179
 * @route '/admin/personalization-templates'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:179
 * @route '/admin/personalization-templates'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:179
 * @route '/admin/personalization-templates'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::index
 * @see app/Http/Controllers/Admin/PersonalizationController.php:179
 * @route '/admin/personalization-templates'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:224
 * @route '/admin/personalization-templates/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:224
 * @route '/admin/personalization-templates/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:224
 * @route '/admin/personalization-templates/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::create
 * @see app/Http/Controllers/Admin/PersonalizationController.php:224
 * @route '/admin/personalization-templates/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:238
 * @route '/admin/personalization-templates'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/personalization-templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:238
 * @route '/admin/personalization-templates'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::store
 * @see app/Http/Controllers/Admin/PersonalizationController.php:238
 * @route '/admin/personalization-templates'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:293
 * @route '/admin/personalization-templates/{template}'
 */
export const edit = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:293
 * @route '/admin/personalization-templates/{template}'
 */
edit.url = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { template: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    template: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        template: typeof args.template === 'object'
                ? args.template.id
                : args.template,
                }

    return edit.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:293
 * @route '/admin/personalization-templates/{template}'
 */
edit.get = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::edit
 * @see app/Http/Controllers/Admin/PersonalizationController.php:293
 * @route '/admin/personalization-templates/{template}'
 */
edit.head = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:308
 * @route '/admin/personalization-templates/{template}'
 */
export const update = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:308
 * @route '/admin/personalization-templates/{template}'
 */
update.url = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { template: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    template: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        template: typeof args.template === 'object'
                ? args.template.id
                : args.template,
                }

    return update.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::update
 * @see app/Http/Controllers/Admin/PersonalizationController.php:308
 * @route '/admin/personalization-templates/{template}'
 */
update.put = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:362
 * @route '/admin/personalization-templates/{template}'
 */
export const destroy = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/personalization-templates/{template}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:362
 * @route '/admin/personalization-templates/{template}'
 */
destroy.url = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { template: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    template: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        template: typeof args.template === 'object'
                ? args.template.id
                : args.template,
                }

    return destroy.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::destroy
 * @see app/Http/Controllers/Admin/PersonalizationController.php:362
 * @route '/admin/personalization-templates/{template}'
 */
destroy.delete = (args: { template: string | number | { id: string | number } } | [template: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
 * @see app/Http/Controllers/Admin/PersonalizationController.php:373
 * @route '/admin/personalization-templates/statistics'
 */
export const statistics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/admin/personalization-templates/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
 * @see app/Http/Controllers/Admin/PersonalizationController.php:373
 * @route '/admin/personalization-templates/statistics'
 */
statistics.url = (options?: RouteQueryOptions) => {
    return statistics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
 * @see app/Http/Controllers/Admin/PersonalizationController.php:373
 * @route '/admin/personalization-templates/statistics'
 */
statistics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PersonalizationController::statistics
 * @see app/Http/Controllers/Admin/PersonalizationController.php:373
 * @route '/admin/personalization-templates/statistics'
 */
statistics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(options),
    method: 'head',
})
const personalizationTemplates = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
statistics: Object.assign(statistics, statistics),
}

export default personalizationTemplates