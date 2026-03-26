import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::index
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:19
 * @route '/admin/site-subscriptions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/site-subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::index
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:19
 * @route '/admin/site-subscriptions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::index
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:19
 * @route '/admin/site-subscriptions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::index
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:19
 * @route '/admin/site-subscriptions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::create
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:76
 * @route '/admin/site-subscriptions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/site-subscriptions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::create
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:76
 * @route '/admin/site-subscriptions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::create
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:76
 * @route '/admin/site-subscriptions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::create
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:76
 * @route '/admin/site-subscriptions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::store
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:91
 * @route '/admin/site-subscriptions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::store
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:91
 * @route '/admin/site-subscriptions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::store
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:91
 * @route '/admin/site-subscriptions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::show
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:135
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
export const show = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/site-subscriptions/{siteSubscription}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::show
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:135
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
show.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return show.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::show
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:135
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
show.get = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::show
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:135
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
show.head = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::edit
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:155
 * @route '/admin/site-subscriptions/{siteSubscription}/edit'
 */
export const edit = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/site-subscriptions/{siteSubscription}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::edit
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:155
 * @route '/admin/site-subscriptions/{siteSubscription}/edit'
 */
edit.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return edit.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::edit
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:155
 * @route '/admin/site-subscriptions/{siteSubscription}/edit'
 */
edit.get = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::edit
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:155
 * @route '/admin/site-subscriptions/{siteSubscription}/edit'
 */
edit.head = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::update
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:173
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
export const update = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/site-subscriptions/{siteSubscription}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::update
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:173
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
update.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return update.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::update
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:173
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
update.put = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:212
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
export const destroy = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/site-subscriptions/{siteSubscription}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:212
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
destroy.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return destroy.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::destroy
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:212
 * @route '/admin/site-subscriptions/{siteSubscription}'
 */
destroy.delete = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:223
 * @route '/admin/site-subscriptions/{siteSubscription}/cancel'
 */
export const cancel = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:223
 * @route '/admin/site-subscriptions/{siteSubscription}/cancel'
 */
cancel.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return cancel.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::cancel
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:223
 * @route '/admin/site-subscriptions/{siteSubscription}/cancel'
 */
cancel.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:237
 * @route '/admin/site-subscriptions/{siteSubscription}/reactivate'
 */
export const reactivate = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

reactivate.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:237
 * @route '/admin/site-subscriptions/{siteSubscription}/reactivate'
 */
reactivate.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return reactivate.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::reactivate
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:237
 * @route '/admin/site-subscriptions/{siteSubscription}/reactivate'
 */
reactivate.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::renew
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:263
 * @route '/admin/site-subscriptions/{siteSubscription}/renew'
 */
export const renew = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: renew.url(args, options),
    method: 'post',
})

renew.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/renew',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::renew
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:263
 * @route '/admin/site-subscriptions/{siteSubscription}/renew'
 */
renew.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return renew.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::renew
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:263
 * @route '/admin/site-subscriptions/{siteSubscription}/renew'
 */
renew.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: renew.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::changePlan
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:281
 * @route '/admin/site-subscriptions/{siteSubscription}/change-plan'
 */
export const changePlan = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePlan.url(args, options),
    method: 'post',
})

changePlan.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/change-plan',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::changePlan
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:281
 * @route '/admin/site-subscriptions/{siteSubscription}/change-plan'
 */
changePlan.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return changePlan.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::changePlan
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:281
 * @route '/admin/site-subscriptions/{siteSubscription}/change-plan'
 */
changePlan.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: changePlan.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::extendTrial
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:310
 * @route '/admin/site-subscriptions/{siteSubscription}/extend-trial'
 */
export const extendTrial = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extendTrial.url(args, options),
    method: 'post',
})

extendTrial.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/extend-trial',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::extendTrial
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:310
 * @route '/admin/site-subscriptions/{siteSubscription}/extend-trial'
 */
extendTrial.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return extendTrial.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::extendTrial
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:310
 * @route '/admin/site-subscriptions/{siteSubscription}/extend-trial'
 */
extendTrial.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extendTrial.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::syncStripe
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:330
 * @route '/admin/site-subscriptions/{siteSubscription}/sync-stripe'
 */
export const syncStripe = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncStripe.url(args, options),
    method: 'post',
})

syncStripe.definition = {
    methods: ["post"],
    url: '/admin/site-subscriptions/{siteSubscription}/sync-stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::syncStripe
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:330
 * @route '/admin/site-subscriptions/{siteSubscription}/sync-stripe'
 */
syncStripe.url = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { siteSubscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { siteSubscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    siteSubscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        siteSubscription: typeof args.siteSubscription === 'object'
                ? args.siteSubscription.id
                : args.siteSubscription,
                }

    return syncStripe.definition.url
            .replace('{siteSubscription}', parsedArgs.siteSubscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::syncStripe
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:330
 * @route '/admin/site-subscriptions/{siteSubscription}/sync-stripe'
 */
syncStripe.post = (args: { siteSubscription: string | number | { id: string | number } } | [siteSubscription: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncStripe.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::analytics
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:342
 * @route '/admin/site-subscriptions/analytics'
 */
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/admin/site-subscriptions/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::analytics
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:342
 * @route '/admin/site-subscriptions/analytics'
 */
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::analytics
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:342
 * @route '/admin/site-subscriptions/analytics'
 */
analytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteSubscriptionController::analytics
 * @see app/Http/Controllers/Admin/SiteSubscriptionController.php:342
 * @route '/admin/site-subscriptions/analytics'
 */
analytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(options),
    method: 'head',
})
const SiteSubscriptionController = { index, create, store, show, edit, update, destroy, cancel, reactivate, renew, changePlan, extendTrial, syncStripe, analytics }

export default SiteSubscriptionController