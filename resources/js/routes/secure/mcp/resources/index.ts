import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:77
* @route '/api/mcp/protocol/x6z9a2s5/resources/list/t4y7u0i3'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: list.url(options),
    method: 'post',
})

list.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/resources/list/t4y7u0i3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:77
* @route '/api/mcp/protocol/x6z9a2s5/resources/list/t4y7u0i3'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:77
* @route '/api/mcp/protocol/x6z9a2s5/resources/list/t4y7u0i3'
*/
list.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: list.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::read
* @see app/Http/Controllers/MCPServerController.php:94
* @route '/api/mcp/protocol/x6z9a2s5/resources/read/p6a9s2d5'
*/
export const read = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(options),
    method: 'post',
})

read.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/resources/read/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::read
* @see app/Http/Controllers/MCPServerController.php:94
* @route '/api/mcp/protocol/x6z9a2s5/resources/read/p6a9s2d5'
*/
read.url = (options?: RouteQueryOptions) => {
    return read.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::read
* @see app/Http/Controllers/MCPServerController.php:94
* @route '/api/mcp/protocol/x6z9a2s5/resources/read/p6a9s2d5'
*/
read.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: read.url(options),
    method: 'post',
})

const resources = {
    list: Object.assign(list, list),
    read: Object.assign(read, read),
}

export default resources