import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import tools from './tools'
import resources from './resources'
import sessions from './sessions'
import servers from './servers'
/**
* @see \App\Http\Controllers\MCPServerController::initialize
 * @see app/Http/Controllers/MCPServerController.php:273
 * @route '/api/mcp/protocol/x6z9a2s5/initialize/m8k1j4h7'
 */
export const initialize = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

initialize.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/initialize/m8k1j4h7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::initialize
 * @see app/Http/Controllers/MCPServerController.php:273
 * @route '/api/mcp/protocol/x6z9a2s5/initialize/m8k1j4h7'
 */
initialize.url = (options?: RouteQueryOptions) => {
    return initialize.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::initialize
 * @see app/Http/Controllers/MCPServerController.php:273
 * @route '/api/mcp/protocol/x6z9a2s5/initialize/m8k1j4h7'
 */
initialize.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::logs
 * @see app/Http/Controllers/MCPServerController.php:261
 * @route '/api/mcp/protocol/x6z9a2s5/logs/system/z2x5c8v1'
 */
export const logs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})

logs.definition = {
    methods: ["get","head"],
    url: '/api/mcp/protocol/x6z9a2s5/logs/system/z2x5c8v1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MCPServerController::logs
 * @see app/Http/Controllers/MCPServerController.php:261
 * @route '/api/mcp/protocol/x6z9a2s5/logs/system/z2x5c8v1'
 */
logs.url = (options?: RouteQueryOptions) => {
    return logs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::logs
 * @see app/Http/Controllers/MCPServerController.php:261
 * @route '/api/mcp/protocol/x6z9a2s5/logs/system/z2x5c8v1'
 */
logs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: logs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MCPServerController::logs
 * @see app/Http/Controllers/MCPServerController.php:261
 * @route '/api/mcp/protocol/x6z9a2s5/logs/system/z2x5c8v1'
 */
logs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: logs.url(options),
    method: 'head',
})
const mcp = {
    initialize: Object.assign(initialize, initialize),
tools: Object.assign(tools, tools),
resources: Object.assign(resources, resources),
sessions: Object.assign(sessions, sessions),
servers: Object.assign(servers, servers),
logs: Object.assign(logs, logs),
}

export default mcp