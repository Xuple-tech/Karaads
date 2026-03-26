import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::index
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:16
* @route '/admin/agent-usage-stats'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::index
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:16
* @route '/admin/agent-usage-stats'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::index
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:16
* @route '/admin/agent-usage-stats'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::index
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:16
* @route '/admin/agent-usage-stats'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::create
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:67
* @route '/admin/agent-usage-stats/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::create
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:67
* @route '/admin/agent-usage-stats/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::create
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:67
* @route '/admin/agent-usage-stats/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::create
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:67
* @route '/admin/agent-usage-stats/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::store
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:77
* @route '/admin/agent-usage-stats'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-usage-stats',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::store
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:77
* @route '/admin/agent-usage-stats'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::store
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:77
* @route '/admin/agent-usage-stats'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::show
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:113
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
export const show = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats/{agentUsageStat}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::show
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:113
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
show.url = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentUsageStat: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentUsageStat: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentUsageStat: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentUsageStat: typeof args.agentUsageStat === 'object'
        ? args.agentUsageStat.id
        : args.agentUsageStat,
    }

    return show.definition.url
            .replace('{agentUsageStat}', parsedArgs.agentUsageStat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::show
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:113
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
show.get = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::show
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:113
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
show.head = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::edit
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:125
* @route '/admin/agent-usage-stats/{agentUsageStat}/edit'
*/
export const edit = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats/{agentUsageStat}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::edit
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:125
* @route '/admin/agent-usage-stats/{agentUsageStat}/edit'
*/
edit.url = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentUsageStat: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentUsageStat: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentUsageStat: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentUsageStat: typeof args.agentUsageStat === 'object'
        ? args.agentUsageStat.id
        : args.agentUsageStat,
    }

    return edit.definition.url
            .replace('{agentUsageStat}', parsedArgs.agentUsageStat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::edit
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:125
* @route '/admin/agent-usage-stats/{agentUsageStat}/edit'
*/
edit.get = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::edit
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:125
* @route '/admin/agent-usage-stats/{agentUsageStat}/edit'
*/
edit.head = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::update
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:138
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
export const update = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-usage-stats/{agentUsageStat}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::update
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:138
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
update.url = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentUsageStat: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentUsageStat: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentUsageStat: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentUsageStat: typeof args.agentUsageStat === 'object'
        ? args.agentUsageStat.id
        : args.agentUsageStat,
    }

    return update.definition.url
            .replace('{agentUsageStat}', parsedArgs.agentUsageStat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::update
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:138
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
update.put = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::destroy
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:175
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
export const destroy = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-usage-stats/{agentUsageStat}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::destroy
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:175
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
destroy.url = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentUsageStat: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentUsageStat: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentUsageStat: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentUsageStat: typeof args.agentUsageStat === 'object'
        ? args.agentUsageStat.id
        : args.agentUsageStat,
    }

    return destroy.definition.url
            .replace('{agentUsageStat}', parsedArgs.agentUsageStat.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::destroy
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:175
* @route '/admin/agent-usage-stats/{agentUsageStat}'
*/
destroy.delete = (args: { agentUsageStat: string | { id: string } } | [agentUsageStat: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::report
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:186
* @route '/admin/agent-usage-stats/report'
*/
export const report = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: report.url(options),
    method: 'get',
})

report.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats/report',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::report
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:186
* @route '/admin/agent-usage-stats/report'
*/
report.url = (options?: RouteQueryOptions) => {
    return report.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::report
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:186
* @route '/admin/agent-usage-stats/report'
*/
report.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: report.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::report
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:186
* @route '/admin/agent-usage-stats/report'
*/
report.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: report.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::dashboard
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:239
* @route '/admin/agent-usage-stats/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/agent-usage-stats/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::dashboard
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:239
* @route '/admin/agent-usage-stats/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::dashboard
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:239
* @route '/admin/agent-usage-stats/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentUsageStatController::dashboard
* @see app/Http/Controllers/Admin/AgentUsageStatController.php:239
* @route '/admin/agent-usage-stats/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

const agentUsageStats = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    report: Object.assign(report, report),
    dashboard: Object.assign(dashboard, dashboard),
}

export default agentUsageStats