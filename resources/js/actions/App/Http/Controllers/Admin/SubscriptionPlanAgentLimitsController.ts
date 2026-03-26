import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
* @route '/admin/subscriptions/plans/{plan}/agent-limits'
*/
export const show = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
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
show.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
show.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::show
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:16
* @route '/admin/subscriptions/plans/{plan}/agent-limits'
*/
show.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::update
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:34
* @route '/admin/subscriptions/plans/{plan}/agent-limits'
*/
export const update = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
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
update.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
update.put = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::setUnlimited
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:68
* @route '/admin/subscriptions/plans/{plan}/agent-limits/set-unlimited'
*/
export const setUnlimited = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
setUnlimited.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
setUnlimited.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimited.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::getStatistics
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
* @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
*/
export const getStatistics = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatistics.url(args, options),
    method: 'get',
})

getStatistics.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/agent-limits/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::getStatistics
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
* @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
*/
getStatistics.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return getStatistics.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::getStatistics
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
* @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
*/
getStatistics.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatistics.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController::getStatistics
* @see app/Http/Controllers/Admin/SubscriptionPlanAgentLimitsController.php:100
* @route '/admin/subscriptions/plans/{plan}/agent-limits/statistics'
*/
getStatistics.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStatistics.url(args, options),
    method: 'head',
})

const SubscriptionPlanAgentLimitsController = { show, update, setUnlimited, getStatistics }

export default SubscriptionPlanAgentLimitsController