import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentUsageController::index
 * @see app/Http/Controllers/User/AgentUsageController.php:17
 * @route '/ai-agents/agents/{agent}/analytics'
 */
export const index = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentUsageController::index
 * @see app/Http/Controllers/User/AgentUsageController.php:17
 * @route '/ai-agents/agents/{agent}/analytics'
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
* @see \App\Http\Controllers\User\AgentUsageController::index
 * @see app/Http/Controllers/User/AgentUsageController.php:17
 * @route '/ai-agents/agents/{agent}/analytics'
 */
index.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentUsageController::index
 * @see app/Http/Controllers/User/AgentUsageController.php:17
 * @route '/ai-agents/agents/{agent}/analytics'
 */
index.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentUsageController::exportMethod
 * @see app/Http/Controllers/User/AgentUsageController.php:62
 * @route '/ai-agents/agents/{agent}/analytics/export'
 */
export const exportMethod = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/analytics/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentUsageController::exportMethod
 * @see app/Http/Controllers/User/AgentUsageController.php:62
 * @route '/ai-agents/agents/{agent}/analytics/export'
 */
exportMethod.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentUsageController::exportMethod
 * @see app/Http/Controllers/User/AgentUsageController.php:62
 * @route '/ai-agents/agents/{agent}/analytics/export'
 */
exportMethod.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentUsageController::exportMethod
 * @see app/Http/Controllers/User/AgentUsageController.php:62
 * @route '/ai-agents/agents/{agent}/analytics/export'
 */
exportMethod.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentUsageController::overview
 * @see app/Http/Controllers/User/AgentUsageController.php:96
 * @route '/ai-agents/analytics'
 */
export const overview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})

overview.definition = {
    methods: ["get","head"],
    url: '/ai-agents/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentUsageController::overview
 * @see app/Http/Controllers/User/AgentUsageController.php:96
 * @route '/ai-agents/analytics'
 */
overview.url = (options?: RouteQueryOptions) => {
    return overview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentUsageController::overview
 * @see app/Http/Controllers/User/AgentUsageController.php:96
 * @route '/ai-agents/analytics'
 */
overview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentUsageController::overview
 * @see app/Http/Controllers/User/AgentUsageController.php:96
 * @route '/ai-agents/analytics'
 */
overview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentUsageController::conversations
 * @see app/Http/Controllers/User/AgentUsageController.php:147
 * @route '/ai-agents/analytics/conversations'
 */
export const conversations = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})

conversations.definition = {
    methods: ["get","head"],
    url: '/ai-agents/analytics/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentUsageController::conversations
 * @see app/Http/Controllers/User/AgentUsageController.php:147
 * @route '/ai-agents/analytics/conversations'
 */
conversations.url = (options?: RouteQueryOptions) => {
    return conversations.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentUsageController::conversations
 * @see app/Http/Controllers/User/AgentUsageController.php:147
 * @route '/ai-agents/analytics/conversations'
 */
conversations.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: conversations.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentUsageController::conversations
 * @see app/Http/Controllers/User/AgentUsageController.php:147
 * @route '/ai-agents/analytics/conversations'
 */
conversations.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: conversations.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentUsageController::messages
 * @see app/Http/Controllers/User/AgentUsageController.php:171
 * @route '/ai-agents/analytics/messages'
 */
export const messages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/ai-agents/analytics/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentUsageController::messages
 * @see app/Http/Controllers/User/AgentUsageController.php:171
 * @route '/ai-agents/analytics/messages'
 */
messages.url = (options?: RouteQueryOptions) => {
    return messages.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentUsageController::messages
 * @see app/Http/Controllers/User/AgentUsageController.php:171
 * @route '/ai-agents/analytics/messages'
 */
messages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentUsageController::messages
 * @see app/Http/Controllers/User/AgentUsageController.php:171
 * @route '/ai-agents/analytics/messages'
 */
messages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(options),
    method: 'head',
})
const AgentUsageController = { index, exportMethod, overview, conversations, messages, export: exportMethod }

export default AgentUsageController