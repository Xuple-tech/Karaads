import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentToolController::index
 * @see app/Http/Controllers/User/AgentToolController.php:13
 * @route '/ai-agents/agents/{agent}/tools'
 */
export const index = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::index
 * @see app/Http/Controllers/User/AgentToolController.php:13
 * @route '/ai-agents/agents/{agent}/tools'
 */
index.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return index.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::index
 * @see app/Http/Controllers/User/AgentToolController.php:13
 * @route '/ai-agents/agents/{agent}/tools'
 */
index.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentToolController::index
 * @see app/Http/Controllers/User/AgentToolController.php:13
 * @route '/ai-agents/agents/{agent}/tools'
 */
index.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::create
 * @see app/Http/Controllers/User/AgentToolController.php:27
 * @route '/ai-agents/agents/{agent}/tools/create'
 */
export const create = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/tools/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::create
 * @see app/Http/Controllers/User/AgentToolController.php:27
 * @route '/ai-agents/agents/{agent}/tools/create'
 */
create.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return create.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::create
 * @see app/Http/Controllers/User/AgentToolController.php:27
 * @route '/ai-agents/agents/{agent}/tools/create'
 */
create.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentToolController::create
 * @see app/Http/Controllers/User/AgentToolController.php:27
 * @route '/ai-agents/agents/{agent}/tools/create'
 */
create.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::store
 * @see app/Http/Controllers/User/AgentToolController.php:36
 * @route '/ai-agents/agents/{agent}/tools'
 */
export const store = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/tools',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::store
 * @see app/Http/Controllers/User/AgentToolController.php:36
 * @route '/ai-agents/agents/{agent}/tools'
 */
store.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return store.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::store
 * @see app/Http/Controllers/User/AgentToolController.php:36
 * @route '/ai-agents/agents/{agent}/tools'
 */
store.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::edit
 * @see app/Http/Controllers/User/AgentToolController.php:62
 * @route '/ai-agents/agents/{agent}/tools/{tool}/edit'
 */
export const edit = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/tools/{tool}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::edit
 * @see app/Http/Controllers/User/AgentToolController.php:62
 * @route '/ai-agents/agents/{agent}/tools/{tool}/edit'
 */
edit.url = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return edit.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::edit
 * @see app/Http/Controllers/User/AgentToolController.php:62
 * @route '/ai-agents/agents/{agent}/tools/{tool}/edit'
 */
edit.get = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentToolController::edit
 * @see app/Http/Controllers/User/AgentToolController.php:62
 * @route '/ai-agents/agents/{agent}/tools/{tool}/edit'
 */
edit.head = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::update
 * @see app/Http/Controllers/User/AgentToolController.php:76
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
export const update = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ai-agents/agents/{agent}/tools/{tool}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::update
 * @see app/Http/Controllers/User/AgentToolController.php:76
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
update.url = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return update.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::update
 * @see app/Http/Controllers/User/AgentToolController.php:76
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
update.put = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::destroy
 * @see app/Http/Controllers/User/AgentToolController.php:99
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
export const destroy = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/agents/{agent}/tools/{tool}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::destroy
 * @see app/Http/Controllers/User/AgentToolController.php:99
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
destroy.url = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::destroy
 * @see app/Http/Controllers/User/AgentToolController.php:99
 * @route '/ai-agents/agents/{agent}/tools/{tool}'
 */
destroy.delete = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::toggleActive
 * @see app/Http/Controllers/User/AgentToolController.php:118
 * @route '/ai-agents/agents/{agent}/tools/{tool}/toggle-active'
 */
export const toggleActive = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/tools/{tool}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::toggleActive
 * @see app/Http/Controllers/User/AgentToolController.php:118
 * @route '/ai-agents/agents/{agent}/tools/{tool}/toggle-active'
 */
toggleActive.url = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    tool: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                tool: typeof args.tool === 'object'
                ? args.tool.id
                : args.tool,
                }

    return toggleActive.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{tool}', parsedArgs.tool.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::toggleActive
 * @see app/Http/Controllers/User/AgentToolController.php:118
 * @route '/ai-agents/agents/{agent}/tools/{tool}/toggle-active'
 */
toggleActive.post = (args: { agent: string | { id: string }, tool: string | { id: string } } | [agent: string | { id: string }, tool: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentToolController::reorder
 * @see app/Http/Controllers/User/AgentToolController.php:133
 * @route '/ai-agents/agents/{agent}/tools/reorder'
 */
export const reorder = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/tools/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentToolController::reorder
 * @see app/Http/Controllers/User/AgentToolController.php:133
 * @route '/ai-agents/agents/{agent}/tools/reorder'
 */
reorder.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return reorder.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentToolController::reorder
 * @see app/Http/Controllers/User/AgentToolController.php:133
 * @route '/ai-agents/agents/{agent}/tools/reorder'
 */
reorder.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(args, options),
    method: 'post',
})
const AgentToolController = { index, create, store, edit, update, destroy, toggleActive, reorder }

export default AgentToolController