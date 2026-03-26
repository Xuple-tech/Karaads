import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WorkflowController::create
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
export const create = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::create
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
create.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::create
 * @see app/Http/Controllers/WorkflowController.php:50
 * @route '/api/teams/enterprise/k2j5h8g1/workflows/create/{uuid}/q2w5e8r1'
 */
create.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})
const workflows = {
    create: Object.assign(create, create),
}

export default workflows