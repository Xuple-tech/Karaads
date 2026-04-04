import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\GrokApiController::index
 * @see app/Http/Controllers/Admin/GrokApiController.php:22
 * @route '/admin/grok-api'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/grok-api',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::index
 * @see app/Http/Controllers/Admin/GrokApiController.php:22
 * @route '/admin/grok-api'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::index
 * @see app/Http/Controllers/Admin/GrokApiController.php:22
 * @route '/admin/grok-api'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GrokApiController::index
 * @see app/Http/Controllers/Admin/GrokApiController.php:22
 * @route '/admin/grok-api'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::create
 * @see app/Http/Controllers/Admin/GrokApiController.php:32
 * @route '/admin/grok-api/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/grok-api/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::create
 * @see app/Http/Controllers/Admin/GrokApiController.php:32
 * @route '/admin/grok-api/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::create
 * @see app/Http/Controllers/Admin/GrokApiController.php:32
 * @route '/admin/grok-api/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GrokApiController::create
 * @see app/Http/Controllers/Admin/GrokApiController.php:32
 * @route '/admin/grok-api/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::store
 * @see app/Http/Controllers/Admin/GrokApiController.php:40
 * @route '/admin/grok-api'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/grok-api',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::store
 * @see app/Http/Controllers/Admin/GrokApiController.php:40
 * @route '/admin/grok-api'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::store
 * @see app/Http/Controllers/Admin/GrokApiController.php:40
 * @route '/admin/grok-api'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::show
 * @see app/Http/Controllers/Admin/GrokApiController.php:69
 * @route '/admin/grok-api/{config}'
 */
export const show = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/grok-api/{config}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::show
 * @see app/Http/Controllers/Admin/GrokApiController.php:69
 * @route '/admin/grok-api/{config}'
 */
show.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return show.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::show
 * @see app/Http/Controllers/Admin/GrokApiController.php:69
 * @route '/admin/grok-api/{config}'
 */
show.get = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GrokApiController::show
 * @see app/Http/Controllers/Admin/GrokApiController.php:69
 * @route '/admin/grok-api/{config}'
 */
show.head = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::edit
 * @see app/Http/Controllers/Admin/GrokApiController.php:77
 * @route '/admin/grok-api/{config}/edit'
 */
export const edit = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/grok-api/{config}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::edit
 * @see app/Http/Controllers/Admin/GrokApiController.php:77
 * @route '/admin/grok-api/{config}/edit'
 */
edit.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return edit.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::edit
 * @see app/Http/Controllers/Admin/GrokApiController.php:77
 * @route '/admin/grok-api/{config}/edit'
 */
edit.get = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\GrokApiController::edit
 * @see app/Http/Controllers/Admin/GrokApiController.php:77
 * @route '/admin/grok-api/{config}/edit'
 */
edit.head = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::update
 * @see app/Http/Controllers/Admin/GrokApiController.php:85
 * @route '/admin/grok-api/{config}'
 */
export const update = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/grok-api/{config}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::update
 * @see app/Http/Controllers/Admin/GrokApiController.php:85
 * @route '/admin/grok-api/{config}'
 */
update.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return update.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::update
 * @see app/Http/Controllers/Admin/GrokApiController.php:85
 * @route '/admin/grok-api/{config}'
 */
update.put = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::test
 * @see app/Http/Controllers/Admin/GrokApiController.php:106
 * @route '/admin/grok-api/{config}/test'
 */
export const test = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/admin/grok-api/{config}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::test
 * @see app/Http/Controllers/Admin/GrokApiController.php:106
 * @route '/admin/grok-api/{config}/test'
 */
test.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return test.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::test
 * @see app/Http/Controllers/Admin/GrokApiController.php:106
 * @route '/admin/grok-api/{config}/test'
 */
test.post = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::deactivate
 * @see app/Http/Controllers/Admin/GrokApiController.php:119
 * @route '/admin/grok-api/{config}/deactivate'
 */
export const deactivate = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deactivate.url(args, options),
    method: 'post',
})

deactivate.definition = {
    methods: ["post"],
    url: '/admin/grok-api/{config}/deactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::deactivate
 * @see app/Http/Controllers/Admin/GrokApiController.php:119
 * @route '/admin/grok-api/{config}/deactivate'
 */
deactivate.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return deactivate.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::deactivate
 * @see app/Http/Controllers/Admin/GrokApiController.php:119
 * @route '/admin/grok-api/{config}/deactivate'
 */
deactivate.post = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\GrokApiController::destroy
 * @see app/Http/Controllers/Admin/GrokApiController.php:131
 * @route '/admin/grok-api/{config}'
 */
export const destroy = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/grok-api/{config}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\GrokApiController::destroy
 * @see app/Http/Controllers/Admin/GrokApiController.php:131
 * @route '/admin/grok-api/{config}'
 */
destroy.url = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { config: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { config: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    config: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        config: typeof args.config === 'object'
                ? args.config.id
                : args.config,
                }

    return destroy.definition.url
            .replace('{config}', parsedArgs.config.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\GrokApiController::destroy
 * @see app/Http/Controllers/Admin/GrokApiController.php:131
 * @route '/admin/grok-api/{config}'
 */
destroy.delete = (args: { config: string | number | { id: string | number } } | [config: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const GrokApiController = { index, create, store, show, edit, update, test, deactivate, destroy }

export default GrokApiController