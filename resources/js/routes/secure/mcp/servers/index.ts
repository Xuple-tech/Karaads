import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:178
* @route '/api/mcp/protocol/x6z9a2s5/servers/list/f4d7s0a3'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/mcp/protocol/x6z9a2s5/servers/list/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:178
* @route '/api/mcp/protocol/x6z9a2s5/servers/list/f4d7s0a3'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:178
* @route '/api/mcp/protocol/x6z9a2s5/servers/list/f4d7s0a3'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MCPServerController::list
* @see app/Http/Controllers/MCPServerController.php:178
* @route '/api/mcp/protocol/x6z9a2s5/servers/list/f4d7s0a3'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MCPServerController::register
* @see app/Http/Controllers/MCPServerController.php:192
* @route '/api/mcp/protocol/x6z9a2s5/servers/register/w6e9r2t5'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/servers/register/w6e9r2t5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::register
* @see app/Http/Controllers/MCPServerController.php:192
* @route '/api/mcp/protocol/x6z9a2s5/servers/register/w6e9r2t5'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::register
* @see app/Http/Controllers/MCPServerController.php:192
* @route '/api/mcp/protocol/x6z9a2s5/servers/register/w6e9r2t5'
*/
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::update
* @see app/Http/Controllers/MCPServerController.php:218
* @route '/api/mcp/protocol/x6z9a2s5/servers/update/{uuid}/y8u1i4o7'
*/
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mcp/protocol/x6z9a2s5/servers/update/{uuid}/y8u1i4o7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\MCPServerController::update
* @see app/Http/Controllers/MCPServerController.php:218
* @route '/api/mcp/protocol/x6z9a2s5/servers/update/{uuid}/y8u1i4o7'
*/
update.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return update.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::update
* @see app/Http/Controllers/MCPServerController.php:218
* @route '/api/mcp/protocol/x6z9a2s5/servers/update/{uuid}/y8u1i4o7'
*/
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MCPServerController::test
* @see app/Http/Controllers/MCPServerController.php:237
* @route '/api/mcp/protocol/x6z9a2s5/servers/test/{uuid}/q0w3e6r9'
*/
export const test = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/servers/test/{uuid}/q0w3e6r9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::test
* @see app/Http/Controllers/MCPServerController.php:237
* @route '/api/mcp/protocol/x6z9a2s5/servers/test/{uuid}/q0w3e6r9'
*/
test.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
    }

    return test.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::test
* @see app/Http/Controllers/MCPServerController.php:237
* @route '/api/mcp/protocol/x6z9a2s5/servers/test/{uuid}/q0w3e6r9'
*/
test.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

const servers = {
    list: Object.assign(list, list),
    register: Object.assign(register, register),
    update: Object.assign(update, update),
    test: Object.assign(test, test),
}

export default servers