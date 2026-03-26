import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\SessionController::create
 * @see app/Http/Controllers/Api/Widget/SessionController.php:13
 * @route '/api/v1/widget/sessions'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/v1/widget/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::create
 * @see app/Http/Controllers/Api/Widget/SessionController.php:13
 * @route '/api/v1/widget/sessions'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::create
 * @see app/Http/Controllers/Api/Widget/SessionController.php:13
 * @route '/api/v1/widget/sessions'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::show
 * @see app/Http/Controllers/Api/Widget/SessionController.php:83
 * @route '/api/v1/widget/sessions/{session}'
 */
export const show = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/sessions/{session}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::show
 * @see app/Http/Controllers/Api/Widget/SessionController.php:83
 * @route '/api/v1/widget/sessions/{session}'
 */
show.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                }

    return show.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::show
 * @see app/Http/Controllers/Api/Widget/SessionController.php:83
 * @route '/api/v1/widget/sessions/{session}'
 */
show.get = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Widget\SessionController::show
 * @see app/Http/Controllers/Api/Widget/SessionController.php:83
 * @route '/api/v1/widget/sessions/{session}'
 */
show.head = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::destroy
 * @see app/Http/Controllers/Api/Widget/SessionController.php:113
 * @route '/api/v1/widget/sessions/{session}'
 */
export const destroy = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/widget/sessions/{session}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::destroy
 * @see app/Http/Controllers/Api/Widget/SessionController.php:113
 * @route '/api/v1/widget/sessions/{session}'
 */
destroy.url = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { session: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    session: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        session: args.session,
                }

    return destroy.definition.url
            .replace('{session}', parsedArgs.session.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\SessionController::destroy
 * @see app/Http/Controllers/Api/Widget/SessionController.php:113
 * @route '/api/v1/widget/sessions/{session}'
 */
destroy.delete = (args: { session: string | number } | [session: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const SessionController = { create, show, destroy }

export default SessionController