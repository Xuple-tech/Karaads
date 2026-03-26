import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
export const show = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
show.get = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
show.head = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:39
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
export const update = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:39
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:39
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
update.put = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedServers
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:78
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-servers'
 */
export const setUnlimitedServers = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedServers.url(args, options),
    method: 'post',
})

setUnlimitedServers.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-servers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedServers
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:78
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-servers'
 */
setUnlimitedServers.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return setUnlimitedServers.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedServers
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:78
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-servers'
 */
setUnlimitedServers.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedServers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
export const setUnlimitedPerWorkflow = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedPerWorkflow.url(args, options),
    method: 'post',
})

setUnlimitedPerWorkflow.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
setUnlimitedPerWorkflow.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return setUnlimitedPerWorkflow.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
setUnlimitedPerWorkflow.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedPerWorkflow.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
export const addCategory = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addCategory.url(args, options),
    method: 'post',
})

addCategory.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/add-category',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
addCategory.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return addCategory.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
addCategory.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addCategory.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
export const removeCategory = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeCategory.url(args, options),
    method: 'post',
})

removeCategory.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/remove-category',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
removeCategory.url = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return removeCategory.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
removeCategory.post = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeCategory.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
export const statistics = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
statistics.get = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::statistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
statistics.head = (args: { plan: string | number | { id: string | number } } | [plan: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(args, options),
    method: 'head',
})
const toolLimits = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
setUnlimitedServers: Object.assign(setUnlimitedServers, setUnlimitedServers),
setUnlimitedPerWorkflow: Object.assign(setUnlimitedPerWorkflow, setUnlimitedPerWorkflow),
addCategory: Object.assign(addCategory, addCategory),
removeCategory: Object.assign(removeCategory, removeCategory),
statistics: Object.assign(statistics, statistics),
}

export default toolLimits