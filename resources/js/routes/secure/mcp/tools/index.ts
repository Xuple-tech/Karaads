import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MCPServerController::list
 * @see app/Http/Controllers/MCPServerController.php:23
 * @route '/api/mcp/protocol/x6z9a2s5/tools/list/g0f3d6s9'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: list.url(options),
    method: 'post',
})

list.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/tools/list/g0f3d6s9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::list
 * @see app/Http/Controllers/MCPServerController.php:23
 * @route '/api/mcp/protocol/x6z9a2s5/tools/list/g0f3d6s9'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::list
 * @see app/Http/Controllers/MCPServerController.php:23
 * @route '/api/mcp/protocol/x6z9a2s5/tools/list/g0f3d6s9'
 */
list.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: list.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::call
 * @see app/Http/Controllers/MCPServerController.php:40
 * @route '/api/mcp/protocol/x6z9a2s5/tools/call/q2w5e8r1'
 */
export const call = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: call.url(options),
    method: 'post',
})

call.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/tools/call/q2w5e8r1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::call
 * @see app/Http/Controllers/MCPServerController.php:40
 * @route '/api/mcp/protocol/x6z9a2s5/tools/call/q2w5e8r1'
 */
call.url = (options?: RouteQueryOptions) => {
    return call.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::call
 * @see app/Http/Controllers/MCPServerController.php:40
 * @route '/api/mcp/protocol/x6z9a2s5/tools/call/q2w5e8r1'
 */
call.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: call.url(options),
    method: 'post',
})
const tools = {
    list: Object.assign(list, list),
call: Object.assign(call, call),
}

export default tools