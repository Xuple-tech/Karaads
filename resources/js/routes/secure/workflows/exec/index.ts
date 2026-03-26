import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
* @see app/Http/Controllers/WorkflowController.php:350
* @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
*/
export const deleteMethod = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
* @see app/Http/Controllers/WorkflowController.php:350
* @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
*/
deleteMethod.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            uuid: args[0],
            execUuid: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        uuid: args.uuid,
        execUuid: args.execUuid,
    }

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
* @see app/Http/Controllers/WorkflowController.php:350
* @route '/api/workflows/mgmt/p6a9s2d5/executions/delete/{uuid}/{execUuid}/z2x5c8v1'
*/
deleteMethod.delete = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\WorkflowController::details
* @see app/Http/Controllers/WorkflowController.php:178
* @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
*/
export const details = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

details.definition = {
    methods: ["get","head"],
    url: '/api/workflow/executions/details/{uuid}/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::details
* @see app/Http/Controllers/WorkflowController.php:178
* @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
*/
details.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return details.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::details
* @see app/Http/Controllers/WorkflowController.php:178
* @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
*/
details.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: details.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WorkflowController::details
* @see app/Http/Controllers/WorkflowController.php:178
* @route '/api/workflow/executions/details/{uuid}/p2o5i8u1'
*/
details.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: details.url(args, options),
    method: 'head',
})

const exec = {
    delete: Object.assign(deleteMethod, deleteMethod),
    details: Object.assign(details, details),
}

export default exec