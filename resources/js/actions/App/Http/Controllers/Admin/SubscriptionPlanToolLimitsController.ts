import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
export const show = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
show.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::show
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:16
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
show.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:39
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
export const update = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::update
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:39
 * @route '/admin/subscriptions/plans/{plan}/tool-limits'
 */
update.put = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedServers
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:78
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-servers'
 */
export const setUnlimitedServers = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
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
setUnlimitedServers.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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
setUnlimitedServers.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedServers.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedToolsPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
export const setUnlimitedToolsPerWorkflow = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedToolsPerWorkflow.url(args, options),
    method: 'post',
})

setUnlimitedToolsPerWorkflow.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedToolsPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
setUnlimitedToolsPerWorkflow.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return setUnlimitedToolsPerWorkflow.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::setUnlimitedToolsPerWorkflow
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:100
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/set-unlimited-per-workflow'
 */
setUnlimitedToolsPerWorkflow.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUnlimitedToolsPerWorkflow.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
export const addToolCategory = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addToolCategory.url(args, options),
    method: 'post',
})

addToolCategory.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/add-category',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
addToolCategory.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return addToolCategory.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::addToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:122
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/add-category'
 */
addToolCategory.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addToolCategory.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
export const removeToolCategory = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeToolCategory.url(args, options),
    method: 'post',
})

removeToolCategory.definition = {
    methods: ["post"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/remove-category',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
removeToolCategory.url = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return removeToolCategory.definition.url
            .replace('{plan}', parsedArgs.plan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::removeToolCategory
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:153
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/remove-category'
 */
removeToolCategory.post = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: removeToolCategory.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::getStatistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
export const getStatistics = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatistics.url(args, options),
    method: 'get',
})

getStatistics.definition = {
    methods: ["get","head"],
    url: '/admin/subscriptions/plans/{plan}/tool-limits/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::getStatistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
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
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::getStatistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
getStatistics.get = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getStatistics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController::getStatistics
 * @see app/Http/Controllers/Admin/SubscriptionPlanToolLimitsController.php:181
 * @route '/admin/subscriptions/plans/{plan}/tool-limits/statistics'
 */
getStatistics.head = (args: { plan: string | { id: string } } | [plan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getStatistics.url(args, options),
    method: 'head',
})
const SubscriptionPlanToolLimitsController = { show, update, setUnlimitedServers, setUnlimitedToolsPerWorkflow, addToolCategory, removeToolCategory, getStatistics }

export default SubscriptionPlanToolLimitsController