import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/api/admin/subscription-plans'
 */
const indexf205ac9d5a25e3fd9d2bc6d9391d2688 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf205ac9d5a25e3fd9d2bc6d9391d2688.url(options),
    method: 'get',
})

indexf205ac9d5a25e3fd9d2bc6d9391d2688.definition = {
    methods: ["get","head"],
    url: '/api/admin/subscription-plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/api/admin/subscription-plans'
 */
indexf205ac9d5a25e3fd9d2bc6d9391d2688.url = (options?: RouteQueryOptions) => {
    return indexf205ac9d5a25e3fd9d2bc6d9391d2688.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/api/admin/subscription-plans'
 */
indexf205ac9d5a25e3fd9d2bc6d9391d2688.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf205ac9d5a25e3fd9d2bc6d9391d2688.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/api/admin/subscription-plans'
 */
indexf205ac9d5a25e3fd9d2bc6d9391d2688.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexf205ac9d5a25e3fd9d2bc6d9391d2688.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
const index41a4b8c402ff7a8d87b515312d7d0f15 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index41a4b8c402ff7a8d87b515312d7d0f15.url(options),
    method: 'get',
})

index41a4b8c402ff7a8d87b515312d7d0f15.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index41a4b8c402ff7a8d87b515312d7d0f15.url = (options?: RouteQueryOptions) => {
    return index41a4b8c402ff7a8d87b515312d7d0f15.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index41a4b8c402ff7a8d87b515312d7d0f15.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index41a4b8c402ff7a8d87b515312d7d0f15.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::index
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:16
 * @route '/admin/subscriptions/plans'
 */
index41a4b8c402ff7a8d87b515312d7d0f15.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index41a4b8c402ff7a8d87b515312d7d0f15.url(options),
    method: 'head',
})

export const index = {
    '/api/admin/subscription-plans': indexf205ac9d5a25e3fd9d2bc6d9391d2688,
    '/admin/subscriptions/plans': index41a4b8c402ff7a8d87b515312d7d0f15,
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/api/admin/subscription-plans'
 */
const storef205ac9d5a25e3fd9d2bc6d9391d2688 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storef205ac9d5a25e3fd9d2bc6d9391d2688.url(options),
    method: 'post',
})

storef205ac9d5a25e3fd9d2bc6d9391d2688.definition = {
    methods: ["post"],
    url: '/api/admin/subscription-plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/api/admin/subscription-plans'
 */
storef205ac9d5a25e3fd9d2bc6d9391d2688.url = (options?: RouteQueryOptions) => {
    return storef205ac9d5a25e3fd9d2bc6d9391d2688.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/api/admin/subscription-plans'
 */
storef205ac9d5a25e3fd9d2bc6d9391d2688.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storef205ac9d5a25e3fd9d2bc6d9391d2688.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/admin/subscriptions/plans'
 */
const store41a4b8c402ff7a8d87b515312d7d0f15 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store41a4b8c402ff7a8d87b515312d7d0f15.url(options),
    method: 'post',
})

store41a4b8c402ff7a8d87b515312d7d0f15.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/admin/subscriptions/plans'
 */
store41a4b8c402ff7a8d87b515312d7d0f15.url = (options?: RouteQueryOptions) => {
    return store41a4b8c402ff7a8d87b515312d7d0f15.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::store
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:46
 * @route '/admin/subscriptions/plans'
 */
store41a4b8c402ff7a8d87b515312d7d0f15.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store41a4b8c402ff7a8d87b515312d7d0f15.url(options),
    method: 'post',
})

export const store = {
    '/api/admin/subscription-plans': storef205ac9d5a25e3fd9d2bc6d9391d2688,
    '/admin/subscriptions/plans': store41a4b8c402ff7a8d87b515312d7d0f15,
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
const updateca0afa6447c9ccd90b54f53f68715a66 = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateca0afa6447c9ccd90b54f53f68715a66.url(args, options),
    method: 'put',
})

updateca0afa6447c9ccd90b54f53f68715a66.definition = {
    methods: ["put"],
    url: '/api/admin/subscription-plans/{subscriptionPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
updateca0afa6447c9ccd90b54f53f68715a66.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return updateca0afa6447c9ccd90b54f53f68715a66.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
updateca0afa6447c9ccd90b54f53f68715a66.put = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateca0afa6447c9ccd90b54f53f68715a66.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
const updatebe035c925555ce698b1134711ce0054c = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatebe035c925555ce698b1134711ce0054c.url(args, options),
    method: 'put',
})

updatebe035c925555ce698b1134711ce0054c.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
updatebe035c925555ce698b1134711ce0054c.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return updatebe035c925555ce698b1134711ce0054c.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:105
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
updatebe035c925555ce698b1134711ce0054c.put = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatebe035c925555ce698b1134711ce0054c.url(args, options),
    method: 'put',
})

export const update = {
    '/api/admin/subscription-plans/{subscriptionPlan}': updateca0afa6447c9ccd90b54f53f68715a66,
    '/admin/subscriptions/plans/{subscriptionPlan}': updatebe035c925555ce698b1134711ce0054c,
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
const destroyca0afa6447c9ccd90b54f53f68715a66 = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyca0afa6447c9ccd90b54f53f68715a66.url(args, options),
    method: 'delete',
})

destroyca0afa6447c9ccd90b54f53f68715a66.definition = {
    methods: ["delete"],
    url: '/api/admin/subscription-plans/{subscriptionPlan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
destroyca0afa6447c9ccd90b54f53f68715a66.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroyca0afa6447c9ccd90b54f53f68715a66.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/api/admin/subscription-plans/{subscriptionPlan}'
 */
destroyca0afa6447c9ccd90b54f53f68715a66.delete = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyca0afa6447c9ccd90b54f53f68715a66.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
const destroybe035c925555ce698b1134711ce0054c = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroybe035c925555ce698b1134711ce0054c.url(args, options),
    method: 'delete',
})

destroybe035c925555ce698b1134711ce0054c.definition = {
    methods: ["delete"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
destroybe035c925555ce698b1134711ce0054c.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroybe035c925555ce698b1134711ce0054c.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::destroy
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:149
 * @route '/admin/subscriptions/plans/{subscriptionPlan}'
 */
destroybe035c925555ce698b1134711ce0054c.delete = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroybe035c925555ce698b1134711ce0054c.url(args, options),
    method: 'delete',
})

export const destroy = {
    '/api/admin/subscription-plans/{subscriptionPlan}': destroyca0afa6447c9ccd90b54f53f68715a66,
    '/admin/subscriptions/plans/{subscriptionPlan}': destroybe035c925555ce698b1134711ce0054c,
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/api/admin/subscription-plans/{subscriptionPlan}/toggle'
 */
const deactivatef90e0b9f195f532034c7d84ffae2dc5e = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivatef90e0b9f195f532034c7d84ffae2dc5e.url(args, options),
    method: 'patch',
})

deactivatef90e0b9f195f532034c7d84ffae2dc5e.definition = {
    methods: ["patch"],
    url: '/api/admin/subscription-plans/{subscriptionPlan}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/api/admin/subscription-plans/{subscriptionPlan}/toggle'
 */
deactivatef90e0b9f195f532034c7d84ffae2dc5e.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return deactivatef90e0b9f195f532034c7d84ffae2dc5e.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/api/admin/subscription-plans/{subscriptionPlan}/toggle'
 */
deactivatef90e0b9f195f532034c7d84ffae2dc5e.patch = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivatef90e0b9f195f532034c7d84ffae2dc5e.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
const deactivateabefa895ae3299d6302e765e6dc5eab4 = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivateabefa895ae3299d6302e765e6dc5eab4.url(args, options),
    method: 'patch',
})

deactivateabefa895ae3299d6302e765e6dc5eab4.definition = {
    methods: ["patch"],
    url: '/admin/subscriptions/plans/{subscriptionPlan}/deactivate',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
deactivateabefa895ae3299d6302e765e6dc5eab4.url = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return deactivateabefa895ae3299d6302e765e6dc5eab4.definition.url
            .replace('{subscriptionPlan}', parsedArgs.subscriptionPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::deactivate
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:178
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/deactivate'
 */
deactivateabefa895ae3299d6302e765e6dc5eab4.patch = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: deactivateabefa895ae3299d6302e765e6dc5eab4.url(args, options),
    method: 'patch',
})

export const deactivate = {
    '/api/admin/subscription-plans/{subscriptionPlan}/toggle': deactivatef90e0b9f195f532034c7d84ffae2dc5e,
    '/admin/subscriptions/plans/{subscriptionPlan}/deactivate': deactivateabefa895ae3299d6302e765e6dc5eab4,
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:36
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
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:36
 * @route '/admin/subscriptions/plans/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:36
 * @route '/admin/subscriptions/plans/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::create
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:36
 * @route '/admin/subscriptions/plans/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:94
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
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:94
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
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:94
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
edit.get = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::edit
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:94
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/edit'
 */
edit.head = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:202
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
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:202
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
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:202
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
getStats.get = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanController::getStats
 * @see app/Http/Controllers/Admin/SubscriptionPlanController.php:202
 * @route '/admin/subscriptions/plans/{subscriptionPlan}/stats'
 */
getStats.head = (args: { subscriptionPlan: string | { id: string } } | [subscriptionPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStats.url(args, options),
    method: 'head',
})
const SubscriptionPlanController = { index, store, update, destroy, deactivate, create, edit, getStats }

export default SubscriptionPlanController