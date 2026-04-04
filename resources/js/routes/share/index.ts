import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SpaController::__invoke
 * @see app/Http/Controllers/SpaController.php:9
 * @route '/share/{token}'
 */
export const view = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})

view.definition = {
    methods: ["get","head"],
    url: '/share/{token}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SpaController::__invoke
 * @see app/Http/Controllers/SpaController.php:9
 * @route '/share/{token}'
 */
view.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    token: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        token: args.token,
                }

    return view.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SpaController::__invoke
 * @see app/Http/Controllers/SpaController.php:9
 * @route '/share/{token}'
 */
view.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: view.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SpaController::__invoke
 * @see app/Http/Controllers/SpaController.php:9
 * @route '/share/{token}'
 */
view.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: view.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ConversationShareController::data
 * @see app/Http/Controllers/ConversationShareController.php:161
 * @route '/api/share/{token}/data'
 */
export const data = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(args, options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/api/share/{token}/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::data
 * @see app/Http/Controllers/ConversationShareController.php:161
 * @route '/api/share/{token}/data'
 */
data.url = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { token: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    token: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        token: args.token,
                }

    return data.definition.url
            .replace('{token}', parsedArgs.token.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::data
 * @see app/Http/Controllers/ConversationShareController.php:161
 * @route '/api/share/{token}/data'
 */
data.get = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ConversationShareController::data
 * @see app/Http/Controllers/ConversationShareController.php:161
 * @route '/api/share/{token}/data'
 */
data.head = (args: { token: string | number } | [token: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(args, options),
    method: 'head',
})
const share = {
    view: Object.assign(view, view),
data: Object.assign(data, data),
}

export default share