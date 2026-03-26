import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:17
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
export const index = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:17
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
index.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return index.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:17
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
index.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:17
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
index.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:51
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
export const store = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tools',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:51
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
store.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return store.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:51
 * @route '/admin/subscriptions/plans/{plan}/tools'
 */
store.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:96
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
export const update = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{plan}/tools/{tool}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:96
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
update.url = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return update.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:96
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
update.put = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:147
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
export const destroy = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/subscriptions/plans/{plan}/tools/{tool}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:147
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
destroy.url = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return destroy.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:147
 * @route '/admin/subscriptions/plans/{plan}/tools/{tool}'
 */
destroy.delete = (args: { plan: string | { id: string }, tool: string | { id: string } } | [plan: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:175
 * @route '/admin/subscriptions/plans/{plan}/tools/bulk-toggle'
 */
export const bulkToggle = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkToggle.url(args, options),
    method: 'post',
})

bulkToggle.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tools/bulk-toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:175
 * @route '/admin/subscriptions/plans/{plan}/tools/bulk-toggle'
 */
bulkToggle.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return bulkToggle.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:175
 * @route '/admin/subscriptions/plans/{plan}/tools/bulk-toggle'
 */
bulkToggle.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkToggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::getByCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:205
 * @route '/admin/subscriptions/plans/{plan}/tools/by-category'
 */
export const getByCategory = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getByCategory.url(args, options),
    method: 'get',
})

getByCategory.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/tools/by-category',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::getByCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:205
 * @route '/admin/subscriptions/plans/{plan}/tools/by-category'
 */
getByCategory.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { plan: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { plan: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                }

    return getByCategory.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::getByCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:205
 * @route '/admin/subscriptions/plans/{plan}/tools/by-category'
 */
getByCategory.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getByCategory.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolsController::getByCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolsController.php:205
 * @route '/admin/subscriptions/plans/{plan}/tools/by-category'
 */
getByCategory.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getByCategory.url(args, options),
    method: 'head',
})
const SubscriptionPlanToolsController = { index, store, update, destroy, bulkToggle, getByCategory }

export default SubscriptionPlanToolsController