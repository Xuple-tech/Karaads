import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::index
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:16
* @route '/admin/agent-knowledge-bases'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-knowledge-bases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::index
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:16
* @route '/admin/agent-knowledge-bases'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::index
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:16
* @route '/admin/agent-knowledge-bases'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::index
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:16
* @route '/admin/agent-knowledge-bases'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::create
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:50
* @route '/admin/agent-knowledge-bases/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-knowledge-bases/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::create
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:50
* @route '/admin/agent-knowledge-bases/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::create
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:50
* @route '/admin/agent-knowledge-bases/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::create
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:50
* @route '/admin/agent-knowledge-bases/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::store
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:61
* @route '/admin/agent-knowledge-bases'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-knowledge-bases',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::store
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:61
* @route '/admin/agent-knowledge-bases'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::store
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:61
* @route '/admin/agent-knowledge-bases'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::show
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:86
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
export const show = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-knowledge-bases/{agentKnowledgeBase}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::show
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:86
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
show.url = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentKnowledgeBase: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentKnowledgeBase: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentKnowledgeBase: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentKnowledgeBase: typeof args.agentKnowledgeBase === 'object'
        ? args.agentKnowledgeBase.id
        : args.agentKnowledgeBase,
    }

    return show.definition.url
            .replace('{agentKnowledgeBase}', parsedArgs.agentKnowledgeBase.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::show
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:86
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
show.get = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::show
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:86
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
show.head = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::edit
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:98
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/edit'
*/
export const edit = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-knowledge-bases/{agentKnowledgeBase}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::edit
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:98
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/edit'
*/
edit.url = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentKnowledgeBase: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentKnowledgeBase: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentKnowledgeBase: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentKnowledgeBase: typeof args.agentKnowledgeBase === 'object'
        ? args.agentKnowledgeBase.id
        : args.agentKnowledgeBase,
    }

    return edit.definition.url
            .replace('{agentKnowledgeBase}', parsedArgs.agentKnowledgeBase.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::edit
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:98
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/edit'
*/
edit.get = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::edit
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:98
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/edit'
*/
edit.head = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::update
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:110
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
export const update = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-knowledge-bases/{agentKnowledgeBase}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::update
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:110
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
update.url = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentKnowledgeBase: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentKnowledgeBase: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentKnowledgeBase: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentKnowledgeBase: typeof args.agentKnowledgeBase === 'object'
        ? args.agentKnowledgeBase.id
        : args.agentKnowledgeBase,
    }

    return update.definition.url
            .replace('{agentKnowledgeBase}', parsedArgs.agentKnowledgeBase.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::update
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:110
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
update.put = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::destroy
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:135
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
export const destroy = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-knowledge-bases/{agentKnowledgeBase}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::destroy
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:135
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
destroy.url = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentKnowledgeBase: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentKnowledgeBase: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentKnowledgeBase: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentKnowledgeBase: typeof args.agentKnowledgeBase === 'object'
        ? args.agentKnowledgeBase.id
        : args.agentKnowledgeBase,
    }

    return destroy.definition.url
            .replace('{agentKnowledgeBase}', parsedArgs.agentKnowledgeBase.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::destroy
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:135
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}'
*/
destroy.delete = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::toggleStatus
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:146
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/toggle'
*/
export const toggleStatus = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

toggleStatus.definition = {
    methods: ["patch"],
    url: '/admin/agent-knowledge-bases/{agentKnowledgeBase}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::toggleStatus
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:146
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/toggle'
*/
toggleStatus.url = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentKnowledgeBase: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentKnowledgeBase: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentKnowledgeBase: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentKnowledgeBase: typeof args.agentKnowledgeBase === 'object'
        ? args.agentKnowledgeBase.id
        : args.agentKnowledgeBase,
    }

    return toggleStatus.definition.url
            .replace('{agentKnowledgeBase}', parsedArgs.agentKnowledgeBase.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::toggleStatus
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:146
* @route '/admin/agent-knowledge-bases/{agentKnowledgeBase}/toggle'
*/
toggleStatus.patch = (args: { agentKnowledgeBase: string | { id: string } } | [agentKnowledgeBase: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::bulkAction
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:159
* @route '/admin/agent-knowledge-bases/bulk-action'
*/
export const bulkAction = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAction.url(options),
    method: 'post',
})

bulkAction.definition = {
    methods: ["post"],
    url: '/admin/agent-knowledge-bases/bulk-action',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::bulkAction
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:159
* @route '/admin/agent-knowledge-bases/bulk-action'
*/
bulkAction.url = (options?: RouteQueryOptions) => {
    return bulkAction.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentKnowledgeBaseController::bulkAction
* @see app/Http/Controllers/Admin/AgentKnowledgeBaseController.php:159
* @route '/admin/agent-knowledge-bases/bulk-action'
*/
bulkAction.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkAction.url(options),
    method: 'post',
})

const AgentKnowledgeBaseController = { index, create, store, show, edit, update, destroy, toggleStatus, bulkAction }

export default AgentKnowledgeBaseController