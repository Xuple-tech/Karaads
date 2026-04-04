import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentConversationController::index
 * @see app/Http/Controllers/User/AgentConversationController.php:14
 * @route '/ai-agents/agents/{agent}/conversations'
 */
export const index = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentConversationController::index
 * @see app/Http/Controllers/User/AgentConversationController.php:14
 * @route '/ai-agents/agents/{agent}/conversations'
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
* @see \App\Http\Controllers\User\AgentConversationController::index
 * @see app/Http/Controllers/User/AgentConversationController.php:14
 * @route '/ai-agents/agents/{agent}/conversations'
 */
index.get = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentConversationController::index
 * @see app/Http/Controllers/User/AgentConversationController.php:14
 * @route '/ai-agents/agents/{agent}/conversations'
 */
index.head = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentConversationController::show
 * @see app/Http/Controllers/User/AgentConversationController.php:38
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
export const show = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/conversations/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentConversationController::show
 * @see app/Http/Controllers/User/AgentConversationController.php:38
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
show.url = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return show.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentConversationController::show
 * @see app/Http/Controllers/User/AgentConversationController.php:38
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
show.get = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentConversationController::show
 * @see app/Http/Controllers/User/AgentConversationController.php:38
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
show.head = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentConversationController::destroy
 * @see app/Http/Controllers/User/AgentConversationController.php:65
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
export const destroy = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/agents/{agent}/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\AgentConversationController::destroy
 * @see app/Http/Controllers/User/AgentConversationController.php:65
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
destroy.url = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentConversationController::destroy
 * @see app/Http/Controllers/User/AgentConversationController.php:65
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}'
 */
destroy.delete = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\AgentConversationController::close
 * @see app/Http/Controllers/User/AgentConversationController.php:78
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/close'
 */
export const close = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

close.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/conversations/{conversation}/close',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentConversationController::close
 * @see app/Http/Controllers/User/AgentConversationController.php:78
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/close'
 */
close.url = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return close.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentConversationController::close
 * @see app/Http/Controllers/User/AgentConversationController.php:78
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/close'
 */
close.post = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: close.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentConversationController::reopen
 * @see app/Http/Controllers/User/AgentConversationController.php:91
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/reopen'
 */
export const reopen = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reopen.url(args, options),
    method: 'post',
})

reopen.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/conversations/{conversation}/reopen',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentConversationController::reopen
 * @see app/Http/Controllers/User/AgentConversationController.php:91
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/reopen'
 */
reopen.url = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    conversation: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return reopen.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentConversationController::reopen
 * @see app/Http/Controllers/User/AgentConversationController.php:91
 * @route '/ai-agents/agents/{agent}/conversations/{conversation}/reopen'
 */
reopen.post = (args: { agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } } | [agent: string | number | { id: string | number }, conversation: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reopen.url(args, options),
    method: 'post',
})
const conversations = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
destroy: Object.assign(destroy, destroy),
close: Object.assign(close, close),
reopen: Object.assign(reopen, reopen),
}

export default conversations