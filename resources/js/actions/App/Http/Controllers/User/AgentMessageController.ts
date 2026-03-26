import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentMessageController::index
 * @see app/Http/Controllers/User/AgentMessageController.php:13
 * @route '/ai-agents/agents/{agent}/messages'
 */
export const index = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentMessageController::index
 * @see app/Http/Controllers/User/AgentMessageController.php:13
 * @route '/ai-agents/agents/{agent}/messages'
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
* @see \App\Http\Controllers\User\AgentMessageController::index
 * @see app/Http/Controllers/User/AgentMessageController.php:13
 * @route '/ai-agents/agents/{agent}/messages'
 */
index.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentMessageController::index
 * @see app/Http/Controllers/User/AgentMessageController.php:13
 * @route '/ai-agents/agents/{agent}/messages'
 */
index.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentMessageController::markRead
 * @see app/Http/Controllers/User/AgentMessageController.php:36
 * @route '/ai-agents/agents/{agent}/messages/{message}/mark-read'
 */
export const markRead = (args: { agent: string | { id: string }, message: string | { id: string } } | [agent: string | { id: string }, message: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})

markRead.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/messages/{message}/mark-read',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentMessageController::markRead
 * @see app/Http/Controllers/User/AgentMessageController.php:36
 * @route '/ai-agents/agents/{agent}/messages/{message}/mark-read'
 */
markRead.url = (args: { agent: string | { id: string }, message: string | { id: string } } | [agent: string | { id: string }, message: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                    message: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                                message: typeof args.message === 'object'
                ? args.message.id
                : args.message,
                }

    return markRead.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{message}', parsedArgs.message.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentMessageController::markRead
 * @see app/Http/Controllers/User/AgentMessageController.php:36
 * @route '/ai-agents/agents/{agent}/messages/{message}/mark-read'
 */
markRead.post = (args: { agent: string | { id: string }, message: string | { id: string } } | [agent: string | { id: string }, message: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: markRead.url(args, options),
    method: 'post',
})
const AgentMessageController = { index, markRead }

export default AgentMessageController