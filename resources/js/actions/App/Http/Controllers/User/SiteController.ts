import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\SiteController::index
 * @see app/Http/Controllers/User/SiteController.php:14
 * @route '/ai-agents/sites'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/sites',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SiteController::index
 * @see app/Http/Controllers/User/SiteController.php:14
 * @route '/ai-agents/sites'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::index
 * @see app/Http/Controllers/User/SiteController.php:14
 * @route '/ai-agents/sites'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SiteController::index
 * @see app/Http/Controllers/User/SiteController.php:14
 * @route '/ai-agents/sites'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SiteController::create
 * @see app/Http/Controllers/User/SiteController.php:28
 * @route '/ai-agents/sites/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ai-agents/sites/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SiteController::create
 * @see app/Http/Controllers/User/SiteController.php:28
 * @route '/ai-agents/sites/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::create
 * @see app/Http/Controllers/User/SiteController.php:28
 * @route '/ai-agents/sites/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SiteController::create
 * @see app/Http/Controllers/User/SiteController.php:28
 * @route '/ai-agents/sites/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SiteController::store
 * @see app/Http/Controllers/User/SiteController.php:33
 * @route '/ai-agents/sites'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ai-agents/sites',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SiteController::store
 * @see app/Http/Controllers/User/SiteController.php:33
 * @route '/ai-agents/sites'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::store
 * @see app/Http/Controllers/User/SiteController.php:33
 * @route '/ai-agents/sites'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SiteController::show
 * @see app/Http/Controllers/User/SiteController.php:69
 * @route '/ai-agents/sites/{site}'
 */
export const show = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/sites/{site}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SiteController::show
 * @see app/Http/Controllers/User/SiteController.php:69
 * @route '/ai-agents/sites/{site}'
 */
show.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return show.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::show
 * @see app/Http/Controllers/User/SiteController.php:69
 * @route '/ai-agents/sites/{site}'
 */
show.get = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SiteController::show
 * @see app/Http/Controllers/User/SiteController.php:69
 * @route '/ai-agents/sites/{site}'
 */
show.head = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SiteController::edit
 * @see app/Http/Controllers/User/SiteController.php:87
 * @route '/ai-agents/sites/{site}/edit'
 */
export const edit = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ai-agents/sites/{site}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SiteController::edit
 * @see app/Http/Controllers/User/SiteController.php:87
 * @route '/ai-agents/sites/{site}/edit'
 */
edit.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return edit.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::edit
 * @see app/Http/Controllers/User/SiteController.php:87
 * @route '/ai-agents/sites/{site}/edit'
 */
edit.get = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SiteController::edit
 * @see app/Http/Controllers/User/SiteController.php:87
 * @route '/ai-agents/sites/{site}/edit'
 */
edit.head = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SiteController::update
 * @see app/Http/Controllers/User/SiteController.php:96
 * @route '/ai-agents/sites/{site}'
 */
export const update = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ai-agents/sites/{site}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\User\SiteController::update
 * @see app/Http/Controllers/User/SiteController.php:96
 * @route '/ai-agents/sites/{site}'
 */
update.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return update.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::update
 * @see app/Http/Controllers/User/SiteController.php:96
 * @route '/ai-agents/sites/{site}'
 */
update.put = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\User\SiteController::destroy
 * @see app/Http/Controllers/User/SiteController.php:119
 * @route '/ai-agents/sites/{site}'
 */
export const destroy = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/sites/{site}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\SiteController::destroy
 * @see app/Http/Controllers/User/SiteController.php:119
 * @route '/ai-agents/sites/{site}'
 */
destroy.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return destroy.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::destroy
 * @see app/Http/Controllers/User/SiteController.php:119
 * @route '/ai-agents/sites/{site}'
 */
destroy.delete = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\SiteController::verify
 * @see app/Http/Controllers/User/SiteController.php:133
 * @route '/ai-agents/sites/{site}/verify'
 */
export const verify = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/ai-agents/sites/{site}/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SiteController::verify
 * @see app/Http/Controllers/User/SiteController.php:133
 * @route '/ai-agents/sites/{site}/verify'
 */
verify.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return verify.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::verify
 * @see app/Http/Controllers/User/SiteController.php:133
 * @route '/ai-agents/sites/{site}/verify'
 */
verify.post = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SiteController::toggleWidget
 * @see app/Http/Controllers/User/SiteController.php:146
 * @route '/ai-agents/sites/{site}/toggle-widget'
 */
export const toggleWidget = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleWidget.url(args, options),
    method: 'post',
})

toggleWidget.definition = {
    methods: ["post"],
    url: '/ai-agents/sites/{site}/toggle-widget',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SiteController::toggleWidget
 * @see app/Http/Controllers/User/SiteController.php:146
 * @route '/ai-agents/sites/{site}/toggle-widget'
 */
toggleWidget.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return toggleWidget.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::toggleWidget
 * @see app/Http/Controllers/User/SiteController.php:146
 * @route '/ai-agents/sites/{site}/toggle-widget'
 */
toggleWidget.post = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleWidget.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SiteController::agents
 * @see app/Http/Controllers/User/SiteController.php:157
 * @route '/ai-agents/sites/{site}/agents'
 */
export const agents = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: agents.url(args, options),
    method: 'get',
})

agents.definition = {
    methods: ["get","head"],
    url: '/ai-agents/sites/{site}/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SiteController::agents
 * @see app/Http/Controllers/User/SiteController.php:157
 * @route '/ai-agents/sites/{site}/agents'
 */
agents.url = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return agents.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SiteController::agents
 * @see app/Http/Controllers/User/SiteController.php:157
 * @route '/ai-agents/sites/{site}/agents'
 */
agents.get = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: agents.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SiteController::agents
 * @see app/Http/Controllers/User/SiteController.php:157
 * @route '/ai-agents/sites/{site}/agents'
 */
agents.head = (args: { site: string | { id: string } } | [site: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: agents.url(args, options),
    method: 'head',
})
const SiteController = { index, create, store, show, edit, update, destroy, verify, toggleWidget, agents }

export default SiteController