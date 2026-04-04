import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:32
 * @route '/admin/subscriptions/plans/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:32
 * @route '/admin/subscriptions/plans/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:32
 * @route '/admin/subscriptions/plans/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:32
 * @route '/admin/subscriptions/plans/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:42
 * @route '/admin/subscriptions/plans'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:42
 * @route '/admin/subscriptions/plans'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:42
 * @route '/admin/subscriptions/plans'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:87
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
export const edit = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:87
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
edit.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriptionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscriptionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscriptionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscriptionPlan: typeof args.subscriptionPlan === 'object'
                ? args.subscriptionPlan.id
                : args.subscriptionPlan,
                }

    return edit.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:87
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
edit.get = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:87
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
edit.head = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:98
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
export const update = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:98
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
update.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriptionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscriptionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscriptionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscriptionPlan: typeof args.subscriptionPlan === 'object'
                ? args.subscriptionPlan.id
                : args.subscriptionPlan,
                }

    return update.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:98
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
update.put = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:142
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
export const destroy = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:142
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
destroy.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriptionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscriptionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscriptionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscriptionPlan: typeof args.subscriptionPlan === 'object'
                ? args.subscriptionPlan.id
                : args.subscriptionPlan,
                }

    return destroy.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:142
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
destroy.delete = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:171
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
export const deactivate = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivate.url(args, options),
    method: 'patch',
})

deactivate.definition = {
    methods: ["patch"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}/deactivate',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:171
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
deactivate.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriptionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscriptionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscriptionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscriptionPlan: typeof args.subscriptionPlan === 'object'
                ? args.subscriptionPlan.id
                : args.subscriptionPlan,
                }

    return deactivate.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:171
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
deactivate.patch = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivate.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:195
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
export const getStats = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStats.url(args, options),
    method: 'get',
})

getStats.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:195
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
getStats.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriptionPlan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscriptionPlan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscriptionPlan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscriptionPlan: typeof args.subscriptionPlan === 'object'
                ? args.subscriptionPlan.id
                : args.subscriptionPlan,
                }

    return getStats.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:195
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
getStats.get = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:195
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
getStats.head = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStats.url(args, options),
    method: 'head',
})
const SubscriptionPlanController = { index, create, store, edit, update, destroy, deactivate, getStats }

export default SubscriptionPlanController