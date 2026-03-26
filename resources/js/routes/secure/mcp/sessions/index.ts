import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\MCPServerController::create
 * @see app/Http/Controllers/MCPServerController.php:134
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/create/l8z1x4c7'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/sessions/create/l8z1x4c7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::create
 * @see app/Http/Controllers/MCPServerController.php:134
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/create/l8z1x4c7'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::create
 * @see app/Http/Controllers/MCPServerController.php:134
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/create/l8z1x4c7'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::validate
 * @see app/Http/Controllers/MCPServerController.php:155
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/validate/{uuid}/v0b3n6m9'
 */
export const validate = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validate.url(args, options),
    method: 'post',
})

validate.definition = {
    methods: ["post"],
    url: '/api/mcp/protocol/x6z9a2s5/sessions/validate/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MCPServerController::validate
 * @see app/Http/Controllers/MCPServerController.php:155
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/validate/{uuid}/v0b3n6m9'
 */
validate.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return validate.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::validate
 * @see app/Http/Controllers/MCPServerController.php:155
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/validate/{uuid}/v0b3n6m9'
 */
validate.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MCPServerController::revoke
 * @see app/Http/Controllers/MCPServerController.php:168
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/revoke/{uuid}/k2j5h8g1'
 */
export const revoke = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})

revoke.definition = {
    methods: ["delete"],
    url: '/api/mcp/protocol/x6z9a2s5/sessions/revoke/{uuid}/k2j5h8g1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MCPServerController::revoke
 * @see app/Http/Controllers/MCPServerController.php:168
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/revoke/{uuid}/k2j5h8g1'
 */
revoke.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revoke.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MCPServerController::revoke
 * @see app/Http/Controllers/MCPServerController.php:168
 * @route '/api/mcp/protocol/x6z9a2s5/sessions/revoke/{uuid}/k2j5h8g1'
 */
revoke.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(args, options),
    method: 'delete',
})
const sessions = {
    create: Object.assign(create, create),
validate: Object.assign(validate, validate),
revoke: Object.assign(revoke, revoke),
}

export default sessions