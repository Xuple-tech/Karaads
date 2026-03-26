import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentToolController::index
* @see app/Http/Controllers/Admin/AgentToolController.php:16
* @route '/admin/agent-tools'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::index
* @see app/Http/Controllers/Admin/AgentToolController.php:16
* @route '/admin/agent-tools'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::index
* @see app/Http/Controllers/Admin/AgentToolController.php:16
* @route '/admin/agent-tools'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::index
* @see app/Http/Controllers/Admin/AgentToolController.php:16
* @route '/admin/agent-tools'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::create
* @see app/Http/Controllers/Admin/AgentToolController.php:47
* @route '/admin/agent-tools/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-tools/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::create
* @see app/Http/Controllers/Admin/AgentToolController.php:47
* @route '/admin/agent-tools/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::create
* @see app/Http/Controllers/Admin/AgentToolController.php:47
* @route '/admin/agent-tools/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::create
* @see app/Http/Controllers/Admin/AgentToolController.php:47
* @route '/admin/agent-tools/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::store
* @see app/Http/Controllers/Admin/AgentToolController.php:58
* @route '/admin/agent-tools'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-tools',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::store
* @see app/Http/Controllers/Admin/AgentToolController.php:58
* @route '/admin/agent-tools'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::store
* @see app/Http/Controllers/Admin/AgentToolController.php:58
* @route '/admin/agent-tools'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::show
* @see app/Http/Controllers/Admin/AgentToolController.php:79
* @route '/admin/agent-tools/{agentTool}'
*/
export const show = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-tools/{agentTool}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::show
* @see app/Http/Controllers/Admin/AgentToolController.php:79
* @route '/admin/agent-tools/{agentTool}'
*/
show.url = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTool: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentTool: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentTool: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentTool: typeof args.agentTool === 'object'
        ? args.agentTool.id
        : args.agentTool,
    }

    return show.definition.url
            .replace('{agentTool}', parsedArgs.agentTool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::show
* @see app/Http/Controllers/Admin/AgentToolController.php:79
* @route '/admin/agent-tools/{agentTool}'
*/
show.get = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::show
* @see app/Http/Controllers/Admin/AgentToolController.php:79
* @route '/admin/agent-tools/{agentTool}'
*/
show.head = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::edit
* @see app/Http/Controllers/Admin/AgentToolController.php:91
* @route '/admin/agent-tools/{agentTool}/edit'
*/
export const edit = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-tools/{agentTool}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::edit
* @see app/Http/Controllers/Admin/AgentToolController.php:91
* @route '/admin/agent-tools/{agentTool}/edit'
*/
edit.url = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTool: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentTool: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentTool: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentTool: typeof args.agentTool === 'object'
        ? args.agentTool.id
        : args.agentTool,
    }

    return edit.definition.url
            .replace('{agentTool}', parsedArgs.agentTool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::edit
* @see app/Http/Controllers/Admin/AgentToolController.php:91
* @route '/admin/agent-tools/{agentTool}/edit'
*/
edit.get = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::edit
* @see app/Http/Controllers/Admin/AgentToolController.php:91
* @route '/admin/agent-tools/{agentTool}/edit'
*/
edit.head = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::update
* @see app/Http/Controllers/Admin/AgentToolController.php:103
* @route '/admin/agent-tools/{agentTool}'
*/
export const update = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-tools/{agentTool}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::update
* @see app/Http/Controllers/Admin/AgentToolController.php:103
* @route '/admin/agent-tools/{agentTool}'
*/
update.url = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTool: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentTool: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentTool: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentTool: typeof args.agentTool === 'object'
        ? args.agentTool.id
        : args.agentTool,
    }

    return update.definition.url
            .replace('{agentTool}', parsedArgs.agentTool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::update
* @see app/Http/Controllers/Admin/AgentToolController.php:103
* @route '/admin/agent-tools/{agentTool}'
*/
update.put = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::destroy
* @see app/Http/Controllers/Admin/AgentToolController.php:124
* @route '/admin/agent-tools/{agentTool}'
*/
export const destroy = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-tools/{agentTool}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::destroy
* @see app/Http/Controllers/Admin/AgentToolController.php:124
* @route '/admin/agent-tools/{agentTool}'
*/
destroy.url = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTool: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentTool: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentTool: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentTool: typeof args.agentTool === 'object'
        ? args.agentTool.id
        : args.agentTool,
    }

    return destroy.definition.url
            .replace('{agentTool}', parsedArgs.agentTool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::destroy
* @see app/Http/Controllers/Admin/AgentToolController.php:124
* @route '/admin/agent-tools/{agentTool}'
*/
destroy.delete = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentToolController::test
* @see app/Http/Controllers/Admin/AgentToolController.php:135
* @route '/admin/agent-tools/{agentTool}/test'
*/
export const test = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/admin/agent-tools/{agentTool}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentToolController::test
* @see app/Http/Controllers/Admin/AgentToolController.php:135
* @route '/admin/agent-tools/{agentTool}/test'
*/
test.url = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTool: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentTool: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentTool: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentTool: typeof args.agentTool === 'object'
        ? args.agentTool.id
        : args.agentTool,
    }

    return test.definition.url
            .replace('{agentTool}', parsedArgs.agentTool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentToolController::test
* @see app/Http/Controllers/Admin/AgentToolController.php:135
* @route '/admin/agent-tools/{agentTool}/test'
*/
test.post = (args: { agentTool: string | { id: string } } | [agentTool: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

const agentTools = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    test: Object.assign(test, test),
}

export default agentTools