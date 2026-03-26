import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
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

const analytics = {
    overview: Object.assign(overview, overview),
    conversations: Object.assign(conversations, conversations),
    messages: Object.assign(messages, messages),
}

export default analytics