import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import exec from './exec'
/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::show
 * @see app/Http/Controllers/WorkflowController.php:79
 * @route '/api/workflows/mgmt/p6a9s2d5/show/{uuid}/l8z1x4c7'
 */
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
 */
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
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
* @see \App\Http\Controllers\WorkflowController::update
 * @see app/Http/Controllers/WorkflowController.php:104
 * @route '/api/workflows/mgmt/p6a9s2d5/update/{uuid}/v0b3n6m9'
 */
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::deleteMethod
 * @see app/Http/Controllers/WorkflowController.php:125
 * @route '/api/workflows/mgmt/p6a9s2d5/delete/{uuid}/k2j5h8g1'
 */
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
export const execute = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
execute.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return execute.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::execute
 * @see app/Http/Controllers/WorkflowController.php:142
 * @route '/api/workflows/mgmt/p6a9s2d5/execute/{uuid}/f4d7s0a3'
 */
execute.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WorkflowController::history
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
export const history = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::history
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
history.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return history.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::history
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
history.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::history
 * @see app/Http/Controllers/WorkflowController.php:166
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/{uuid}/w6e9r2t5'
 */
history.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::execution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
export const execution = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: execution.url(args, options),
    method: 'get',
})

execution.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::execution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
execution.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
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

    return execution.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::execution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
execution.get = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: execution.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::execution
 * @see app/Http/Controllers/WorkflowController.php:274
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/show/{uuid}/{execUuid}/y8u1i4o7'
 */
execution.head = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: execution.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::cancel
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
export const cancel = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::cancel
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
cancel.url = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions) => {
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

    return cancel.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace('{execUuid}', parsedArgs.execUuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::cancel
 * @see app/Http/Controllers/WorkflowController.php:326
 * @route '/api/workflows/mgmt/p6a9s2d5/executions/cancel/{uuid}/{execUuid}/q0w3e6r9'
 */
cancel.post = (args: { uuid: string | number, execUuid: string | number } | [uuid: string | number, execUuid: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
export const stats = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
stats.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return stats.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
stats.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::stats
 * @see app/Http/Controllers/WorkflowController.php:190
 * @route '/api/workflows/mgmt/p6a9s2d5/stats/{uuid}/b4n7m0k3'
 */
stats.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
export const publish = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

publish.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
publish.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return publish.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::publish
 * @see app/Http/Controllers/WorkflowController.php:202
 * @route '/api/workflows/mgmt/p6a9s2d5/publish/{uuid}/h6g9f2d5'
 */
publish.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
export const revert = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert.url(args, options),
    method: 'post',
})

revert.definition = {
    methods: ["post"],
    url: '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
revert.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revert.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::revert
 * @see app/Http/Controllers/WorkflowController.php:226
 * @route '/api/workflows/mgmt/p6a9s2d5/revert/{uuid}/j8k1l4z7'
 */
revert.post = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revert.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
export const versions = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})

versions.definition = {
    methods: ["get","head"],
    url: '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return versions.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: versions.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::versions
 * @see app/Http/Controllers/WorkflowController.php:248
 * @route '/api/workflows/mgmt/p6a9s2d5/versions/{uuid}/s0a3d6f9'
 */
versions.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: versions.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WorkflowController::tools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
export const tools = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

tools.definition = {
    methods: ["get","head"],
    url: '/api/tools/available/workflow/c4v7b0n3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WorkflowController::tools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
tools.url = (options?: RouteQueryOptions) => {
    return tools.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WorkflowController::tools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
tools.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WorkflowController::tools
 * @see app/Http/Controllers/WorkflowController.php:262
 * @route '/api/tools/available/workflow/c4v7b0n3'
 */
tools.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tools.url(options),
    method: 'head',
})
const workflows = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
execute: Object.assign(execute, execute),
history: Object.assign(history, history),
execution: Object.assign(execution, execution),
cancel: Object.assign(cancel, cancel),
exec: Object.assign(exec, exec),
stats: Object.assign(stats, stats),
publish: Object.assign(publish, publish),
revert: Object.assign(revert, revert),
versions: Object.assign(versions, versions),
tools: Object.assign(tools, tools),
}

export default workflows