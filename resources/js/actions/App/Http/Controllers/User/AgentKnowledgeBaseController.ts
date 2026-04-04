import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::index
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:13
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
export const index = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/knowledge-base',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::index
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:13
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
index.url = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::index
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:13
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
index.get = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::index
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:13
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
index.head = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::create
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:27
 * @route '/ai-agents/agents/{agent}/knowledge-base/create'
 */
export const create = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/knowledge-base/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::create
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:27
 * @route '/ai-agents/agents/{agent}/knowledge-base/create'
 */
create.url = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::create
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:27
 * @route '/ai-agents/agents/{agent}/knowledge-base/create'
 */
create.get = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::create
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:27
 * @route '/ai-agents/agents/{agent}/knowledge-base/create'
 */
create.head = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::store
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:36
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
export const store = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/knowledge-base',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::store
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:36
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
store.url = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::store
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:36
 * @route '/ai-agents/agents/{agent}/knowledge-base'
 */
store.post = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::edit
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:62
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/edit'
 */
export const edit = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::edit
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:62
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/edit'
 */
edit.url = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    knowledge: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                knowledge: typeof args.knowledge === 'object'
                ? args.knowledge.id
                : args.knowledge,
                }

    return edit.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{knowledge}', parsedArgs.knowledge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::edit
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:62
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/edit'
 */
edit.get = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::edit
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:62
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/edit'
 */
edit.head = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::update
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:76
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
export const update = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ai-agents/agents/{agent}/knowledge-base/{knowledge}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::update
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:76
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
update.url = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    knowledge: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                knowledge: typeof args.knowledge === 'object'
                ? args.knowledge.id
                : args.knowledge,
                }

    return update.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{knowledge}', parsedArgs.knowledge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::update
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:76
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
update.put = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::destroy
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:103
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
export const destroy = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/agents/{agent}/knowledge-base/{knowledge}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::destroy
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:103
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
destroy.url = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    knowledge: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                knowledge: typeof args.knowledge === 'object'
                ? args.knowledge.id
                : args.knowledge,
                }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{knowledge}', parsedArgs.knowledge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::destroy
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:103
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}'
 */
destroy.delete = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::toggleActive
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:122
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/toggle-active'
 */
export const toggleActive = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::toggleActive
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:122
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/toggle-active'
 */
toggleActive.url = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    knowledge: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                knowledge: typeof args.knowledge === 'object'
                ? args.knowledge.id
                : args.knowledge,
                }

    return toggleActive.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{knowledge}', parsedArgs.knowledge.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::toggleActive
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:122
 * @route '/ai-agents/agents/{agent}/knowledge-base/{knowledge}/toggle-active'
 */
toggleActive.post = (args: { agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, knowledge: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::importMethod
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:137
 * @route '/ai-agents/agents/{agent}/knowledge-base/import'
 */
export const importMethod = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/knowledge-base/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::importMethod
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:137
 * @route '/ai-agents/agents/{agent}/knowledge-base/import'
 */
importMethod.url = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return importMethod.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentKnowledgeBaseController::importMethod
 * @see app/Http/Controllers/User/AgentKnowledgeBaseController.php:137
 * @route '/ai-agents/agents/{agent}/knowledge-base/import'
 */
importMethod.post = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(args, options),
    method: 'post',
})
const AgentKnowledgeBaseController = { index, create, store, edit, update, destroy, toggleActive, importMethod, import: importMethod }

export default AgentKnowledgeBaseController