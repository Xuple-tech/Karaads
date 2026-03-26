import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\User\SubscriptionController::index
 * @see app/Http/Controllers/User/SubscriptionController.php:16
 * @route '/ai-agents/subscriptions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::index
 * @see app/Http/Controllers/User/SubscriptionController.php:16
 * @route '/ai-agents/subscriptions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::index
 * @see app/Http/Controllers/User/SubscriptionController.php:16
 * @route '/ai-agents/subscriptions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SubscriptionController::index
 * @see app/Http/Controllers/User/SubscriptionController.php:16
 * @route '/ai-agents/subscriptions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::plans
 * @see app/Http/Controllers/User/SubscriptionController.php:30
 * @route '/ai-agents/subscriptions/plans'
 */
export const plans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})

plans.definition = {
    methods: ["get","head"],
    url: '/ai-agents/subscriptions/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::plans
 * @see app/Http/Controllers/User/SubscriptionController.php:30
 * @route '/ai-agents/subscriptions/plans'
 */
plans.url = (options?: RouteQueryOptions) => {
    return plans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::plans
 * @see app/Http/Controllers/User/SubscriptionController.php:30
 * @route '/ai-agents/subscriptions/plans'
 */
plans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SubscriptionController::plans
 * @see app/Http/Controllers/User/SubscriptionController.php:30
 * @route '/ai-agents/subscriptions/plans'
 */
plans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plans.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::show
 * @see app/Http/Controllers/User/SubscriptionController.php:45
 * @route '/ai-agents/subscriptions/{subscription}'
 */
export const show = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/subscriptions/{subscription}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::show
 * @see app/Http/Controllers/User/SubscriptionController.php:45
 * @route '/ai-agents/subscriptions/{subscription}'
 */
show.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return show.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::show
 * @see app/Http/Controllers/User/SubscriptionController.php:45
 * @route '/ai-agents/subscriptions/{subscription}'
 */
show.get = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\SubscriptionController::show
 * @see app/Http/Controllers/User/SubscriptionController.php:45
 * @route '/ai-agents/subscriptions/{subscription}'
 */
show.head = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::subscribe
 * @see app/Http/Controllers/User/SubscriptionController.php:56
 * @route '/ai-agents/subscriptions/subscribe/{plan}'
 */
export const subscribe = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(args, options),
    method: 'post',
})

subscribe.definition = {
    methods: ["post"],
    url: '/ai-agents/subscriptions/subscribe/{plan}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::subscribe
 * @see app/Http/Controllers/User/SubscriptionController.php:56
 * @route '/ai-agents/subscriptions/subscribe/{plan}'
 */
subscribe.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return subscribe.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::subscribe
 * @see app/Http/Controllers/User/SubscriptionController.php:56
 * @route '/ai-agents/subscriptions/subscribe/{plan}'
 */
subscribe.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: subscribe.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::cancel
 * @see app/Http/Controllers/User/SubscriptionController.php:93
 * @route '/ai-agents/subscriptions/cancel/{subscription}'
 */
export const cancel = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/ai-agents/subscriptions/cancel/{subscription}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::cancel
 * @see app/Http/Controllers/User/SubscriptionController.php:93
 * @route '/ai-agents/subscriptions/cancel/{subscription}'
 */
cancel.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return cancel.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::cancel
 * @see app/Http/Controllers/User/SubscriptionController.php:93
 * @route '/ai-agents/subscriptions/cancel/{subscription}'
 */
cancel.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::resume
 * @see app/Http/Controllers/User/SubscriptionController.php:106
 * @route '/ai-agents/subscriptions/resume/{subscription}'
 */
export const resume = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

resume.definition = {
    methods: ["post"],
    url: '/ai-agents/subscriptions/resume/{subscription}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::resume
 * @see app/Http/Controllers/User/SubscriptionController.php:106
 * @route '/ai-agents/subscriptions/resume/{subscription}'
 */
resume.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return resume.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::resume
 * @see app/Http/Controllers/User/SubscriptionController.php:106
 * @route '/ai-agents/subscriptions/resume/{subscription}'
 */
resume.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\SubscriptionController::upgrade
 * @see app/Http/Controllers/User/SubscriptionController.php:119
 * @route '/ai-agents/subscriptions/upgrade/{subscription}'
 */
export const upgrade = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upgrade.url(args, options),
    method: 'post',
})

upgrade.definition = {
    methods: ["post"],
    url: '/ai-agents/subscriptions/upgrade/{subscription}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\SubscriptionController::upgrade
 * @see app/Http/Controllers/User/SubscriptionController.php:119
 * @route '/ai-agents/subscriptions/upgrade/{subscription}'
 */
upgrade.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return upgrade.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\SubscriptionController::upgrade
 * @see app/Http/Controllers/User/SubscriptionController.php:119
 * @route '/ai-agents/subscriptions/upgrade/{subscription}'
 */
upgrade.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upgrade.url(args, options),
    method: 'post',
})
const subscriptions = {
    index: Object.assign(index, index),
plans: Object.assign(plans, plans),
show: Object.assign(show, show),
subscribe: Object.assign(subscribe, subscribe),
cancel: Object.assign(cancel, cancel),
resume: Object.assign(resume, resume),
upgrade: Object.assign(upgrade, upgrade),
}

export default subscriptions