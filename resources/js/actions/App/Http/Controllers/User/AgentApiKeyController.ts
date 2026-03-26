import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentApiKeyController::index
 * @see app/Http/Controllers/User/AgentApiKeyController.php:14
 * @route '/ai-agents/agents/{agent}/api-keys'
 */
export const index = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/api-keys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::index
 * @see app/Http/Controllers/User/AgentApiKeyController.php:14
 * @route '/ai-agents/agents/{agent}/api-keys'
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
* @see \App\Http\Controllers\User\AgentApiKeyController::index
 * @see app/Http/Controllers/User/AgentApiKeyController.php:14
 * @route '/ai-agents/agents/{agent}/api-keys'
 */
index.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentApiKeyController::index
 * @see app/Http/Controllers/User/AgentApiKeyController.php:14
 * @route '/ai-agents/agents/{agent}/api-keys'
 */
index.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::create
 * @see app/Http/Controllers/User/AgentApiKeyController.php:28
 * @route '/ai-agents/agents/{agent}/api-keys/create'
 */
export const create = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/api-keys/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::create
 * @see app/Http/Controllers/User/AgentApiKeyController.php:28
 * @route '/ai-agents/agents/{agent}/api-keys/create'
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
* @see \App\Http\Controllers\User\AgentApiKeyController::create
 * @see app/Http/Controllers/User/AgentApiKeyController.php:28
 * @route '/ai-agents/agents/{agent}/api-keys/create'
 */
create.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentApiKeyController::create
 * @see app/Http/Controllers/User/AgentApiKeyController.php:28
 * @route '/ai-agents/agents/{agent}/api-keys/create'
 */
create.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::store
 * @see app/Http/Controllers/User/AgentApiKeyController.php:37
 * @route '/ai-agents/agents/{agent}/api-keys'
 */
export const store = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/api-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::store
 * @see app/Http/Controllers/User/AgentApiKeyController.php:37
 * @route '/ai-agents/agents/{agent}/api-keys'
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
* @see \App\Http\Controllers\User\AgentApiKeyController::store
 * @see app/Http/Controllers/User/AgentApiKeyController.php:37
 * @route '/ai-agents/agents/{agent}/api-keys'
 */
store.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::destroy
 * @see app/Http/Controllers/User/AgentApiKeyController.php:71
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}'
 */
export const destroy = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/agents/{agent}/api-keys/{apiKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::destroy
 * @see app/Http/Controllers/User/AgentApiKeyController.php:71
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}'
 */
destroy.url = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    apiKey: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                apiKey: typeof args.apiKey === 'object'
                ? args.apiKey.id
                : args.apiKey,
                }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{apiKey}', parsedArgs.apiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::destroy
 * @see app/Http/Controllers/User/AgentApiKeyController.php:71
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}'
 */
destroy.delete = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::toggleActive
 * @see app/Http/Controllers/User/AgentApiKeyController.php:84
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/toggle-active'
 */
export const toggleActive = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/api-keys/{apiKey}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::toggleActive
 * @see app/Http/Controllers/User/AgentApiKeyController.php:84
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/toggle-active'
 */
toggleActive.url = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    apiKey: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                apiKey: typeof args.apiKey === 'object'
                ? args.apiKey.id
                : args.apiKey,
                }

    return toggleActive.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{apiKey}', parsedArgs.apiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::toggleActive
 * @see app/Http/Controllers/User/AgentApiKeyController.php:84
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/toggle-active'
 */
toggleActive.post = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::regenerate
 * @see app/Http/Controllers/User/AgentApiKeyController.php:99
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/regenerate'
 */
export const regenerate = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/api-keys/{apiKey}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::regenerate
 * @see app/Http/Controllers/User/AgentApiKeyController.php:99
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/regenerate'
 */
regenerate.url = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    apiKey: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                apiKey: typeof args.apiKey === 'object'
                ? args.apiKey.id
                : args.apiKey,
                }

    return regenerate.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{apiKey}', parsedArgs.apiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentApiKeyController::regenerate
 * @see app/Http/Controllers/User/AgentApiKeyController.php:99
 * @route '/ai-agents/agents/{agent}/api-keys/{apiKey}/regenerate'
 */
regenerate.post = (args: { agent: string | { id: string }, apiKey: string | { id: string } } | [agent: string | { id: string }, apiKey: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})
const AgentApiKeyController = { index, create, store, destroy, toggleActive, regenerate }

export default AgentApiKeyController