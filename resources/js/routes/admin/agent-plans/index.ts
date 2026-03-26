import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentPlanController::index
* @see app/Http/Controllers/Admin/AgentPlanController.php:15
* @route '/admin/agent-plans'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::index
* @see app/Http/Controllers/Admin/AgentPlanController.php:15
* @route '/admin/agent-plans'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::index
* @see app/Http/Controllers/Admin/AgentPlanController.php:15
* @route '/admin/agent-plans'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::index
* @see app/Http/Controllers/Admin/AgentPlanController.php:15
* @route '/admin/agent-plans'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::create
* @see app/Http/Controllers/Admin/AgentPlanController.php:30
* @route '/admin/agent-plans/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-plans/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::create
* @see app/Http/Controllers/Admin/AgentPlanController.php:30
* @route '/admin/agent-plans/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::create
* @see app/Http/Controllers/Admin/AgentPlanController.php:30
* @route '/admin/agent-plans/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::create
* @see app/Http/Controllers/Admin/AgentPlanController.php:30
* @route '/admin/agent-plans/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::store
* @see app/Http/Controllers/Admin/AgentPlanController.php:40
* @route '/admin/agent-plans'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-plans',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::store
* @see app/Http/Controllers/Admin/AgentPlanController.php:40
* @route '/admin/agent-plans'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::store
* @see app/Http/Controllers/Admin/AgentPlanController.php:40
* @route '/admin/agent-plans'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::show
* @see app/Http/Controllers/Admin/AgentPlanController.php:83
* @route '/admin/agent-plans/{agentPlan}'
*/
export const show = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-plans/{agentPlan}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::show
* @see app/Http/Controllers/Admin/AgentPlanController.php:83
* @route '/admin/agent-plans/{agentPlan}'
*/
show.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return show.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::show
* @see app/Http/Controllers/Admin/AgentPlanController.php:83
* @route '/admin/agent-plans/{agentPlan}'
*/
show.get = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::show
* @see app/Http/Controllers/Admin/AgentPlanController.php:83
* @route '/admin/agent-plans/{agentPlan}'
*/
show.head = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::edit
* @see app/Http/Controllers/Admin/AgentPlanController.php:99
* @route '/admin/agent-plans/{agentPlan}/edit'
*/
export const edit = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-plans/{agentPlan}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::edit
* @see app/Http/Controllers/Admin/AgentPlanController.php:99
* @route '/admin/agent-plans/{agentPlan}/edit'
*/
edit.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return edit.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::edit
* @see app/Http/Controllers/Admin/AgentPlanController.php:99
* @route '/admin/agent-plans/{agentPlan}/edit'
*/
edit.get = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::edit
* @see app/Http/Controllers/Admin/AgentPlanController.php:99
* @route '/admin/agent-plans/{agentPlan}/edit'
*/
edit.head = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::update
* @see app/Http/Controllers/Admin/AgentPlanController.php:110
* @route '/admin/agent-plans/{agentPlan}'
*/
export const update = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-plans/{agentPlan}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::update
* @see app/Http/Controllers/Admin/AgentPlanController.php:110
* @route '/admin/agent-plans/{agentPlan}'
*/
update.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return update.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::update
* @see app/Http/Controllers/Admin/AgentPlanController.php:110
* @route '/admin/agent-plans/{agentPlan}'
*/
update.put = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::destroy
* @see app/Http/Controllers/Admin/AgentPlanController.php:153
* @route '/admin/agent-plans/{agentPlan}'
*/
export const destroy = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-plans/{agentPlan}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::destroy
* @see app/Http/Controllers/Admin/AgentPlanController.php:153
* @route '/admin/agent-plans/{agentPlan}'
*/
destroy.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return destroy.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::destroy
* @see app/Http/Controllers/Admin/AgentPlanController.php:153
* @route '/admin/agent-plans/{agentPlan}'
*/
destroy.delete = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::toggle
* @see app/Http/Controllers/Admin/AgentPlanController.php:169
* @route '/admin/agent-plans/{agentPlan}/toggle'
*/
export const toggle = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

toggle.definition = {
    methods: ["patch"],
    url: '/admin/agent-plans/{agentPlan}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::toggle
* @see app/Http/Controllers/Admin/AgentPlanController.php:169
* @route '/admin/agent-plans/{agentPlan}/toggle'
*/
toggle.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return toggle.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::toggle
* @see app/Http/Controllers/Admin/AgentPlanController.php:169
* @route '/admin/agent-plans/{agentPlan}/toggle'
*/
toggle.patch = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::syncStripe
* @see app/Http/Controllers/Admin/AgentPlanController.php:182
* @route '/admin/agent-plans/{agentPlan}/sync-stripe'
*/
export const syncStripe = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncStripe.url(args, options),
    method: 'post',
})

syncStripe.definition = {
    methods: ["post"],
    url: '/admin/agent-plans/{agentPlan}/sync-stripe',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::syncStripe
* @see app/Http/Controllers/Admin/AgentPlanController.php:182
* @route '/admin/agent-plans/{agentPlan}/sync-stripe'
*/
syncStripe.url = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentPlan: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentPlan: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentPlan: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentPlan: typeof args.agentPlan === 'object'
        ? args.agentPlan.id
        : args.agentPlan,
    }

    return syncStripe.definition.url
            .replace('{agentPlan}', parsedArgs.agentPlan.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentPlanController::syncStripe
* @see app/Http/Controllers/Admin/AgentPlanController.php:182
* @route '/admin/agent-plans/{agentPlan}/sync-stripe'
*/
syncStripe.post = (args: { agentPlan: string | { id: string } } | [agentPlan: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncStripe.url(args, options),
    method: 'post',
})

const agentPlans = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    toggle: Object.assign(toggle, toggle),
    syncStripe: Object.assign(syncStripe, syncStripe),
}

export default agentPlans