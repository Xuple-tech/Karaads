import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:17
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
export const index = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/features',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:17
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
index.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:17
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
index.get = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:17
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
index.head = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:42
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
export const store = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/features',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:42
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
store.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:42
 * @route '/admin/subscriptions/plans/{plan}/features'
 */
store.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:82
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
export const update = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{plan}/features/{feature}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:82
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
update.url = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                    feature: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                                feature: typeof args.feature === 'object'
                ? args.feature.id
                : args.feature,
                }

    return update.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace('{feature}', parsedArgs.feature.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:82
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
update.put = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:129
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
export const destroy = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/subscriptions/plans/{plan}/features/{feature}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:129
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
destroy.url = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    plan: args[0],
                    feature: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        plan: typeof args.plan === 'object'
                ? args.plan.id
                : args.plan,
                                feature: typeof args.feature === 'object'
                ? args.feature.id
                : args.feature,
                }

    return destroy.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace('{feature}', parsedArgs.feature.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:129
 * @route '/admin/subscriptions/plans/{plan}/features/{feature}'
 */
destroy.delete = (args: { plan: string | number | { id: string | number }, feature: string | number | { id: string | number } } | [plan: string | number | { id: string | number }, feature: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:157
 * @route '/admin/subscriptions/plans/{plan}/features/bulk-toggle'
 */
export const bulkToggle = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkToggle.url(args, options),
    method: 'post',
})

bulkToggle.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/features/bulk-toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:157
 * @route '/admin/subscriptions/plans/{plan}/features/bulk-toggle'
 */
bulkToggle.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanFeaturesController::bulkToggle
 * @see app/Http/Controllers/Admin/SubscriptionPlanFeaturesController.php:157
 * @route '/admin/subscriptions/plans/{plan}/features/bulk-toggle'
 */
bulkToggle.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkToggle.url(args, options),
    method: 'post',
})
const features = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
bulkToggle: Object.assign(bulkToggle, bulkToggle),
}

export default features