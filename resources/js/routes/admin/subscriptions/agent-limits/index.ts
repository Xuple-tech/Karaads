import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
export const show = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/agent-limits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
show.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
show.get = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
show.head = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:34
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
export const update = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{plan}/agent-limits',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:34
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
update.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:34
 * @route '/admin/subscriptions/plans/{plan}/agent-limits'
 */
update.put = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::setUnlimited
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:68
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/set-unlimited'
 */
export const setUnlimited = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimited.url(args, options),
    method: 'post',
})

setUnlimited.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/agent-limits/set-unlimited',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::setUnlimited
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:68
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/set-unlimited'
 */
setUnlimited.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return setUnlimited.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::setUnlimited
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:68
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/set-unlimited'
 */
setUnlimited.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimited.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
 */
export const statistics = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/agent-limits/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
 */
statistics.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return statistics.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
 */
statistics.get = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
 */
statistics.head = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(args, options),
    method: 'head',
})
const agentLimits = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
setUnlimited: Object.assign(setUnlimited, setUnlimited),
statistics: Object.assign(statistics, statistics),
}

export default agentLimits