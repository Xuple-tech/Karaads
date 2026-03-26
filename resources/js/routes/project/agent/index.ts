import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import triggers from './triggers'
import actions from './actions'
import executions from './executions'
/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:75
 * @route '/api/projects/{project}/agents/{agent}'
 */
export const show = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:75
 * @route '/api/projects/{project}/agents/{agent}'
 */
show.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:75
 * @route '/api/projects/{project}/agents/{agent}'
 */
show.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:75
 * @route '/api/projects/{project}/agents/{agent}'
 */
show.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:91
 * @route '/api/projects/{project}/agents/{agent}'
 */
export const update = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:91
 * @route '/api/projects/{project}/agents/{agent}'
 */
update.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:91
 * @route '/api/projects/{project}/agents/{agent}'
 */
update.put = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
export const deleteMethod = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
deleteMethod.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
deleteMethod.delete = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::toggleStatus
 * @see app/Http/Controllers/ProjectAgentController.php:440
 * @route '/api/projects/{project}/agents/{agent}/toggle-status'
 */
export const toggleStatus = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/toggle-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::toggleStatus
 * @see app/Http/Controllers/ProjectAgentController.php:440
 * @route '/api/projects/{project}/agents/{agent}/toggle-status'
 */
toggleStatus.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return toggleStatus.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::toggleStatus
 * @see app/Http/Controllers/ProjectAgentController.php:440
 * @route '/api/projects/{project}/agents/{agent}/toggle-status'
 */
toggleStatus.post = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::statistics
 * @see app/Http/Controllers/ProjectAgentController.php:400
 * @route '/api/projects/{project}/agents/{agent}/statistics'
 */
export const statistics = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::statistics
 * @see app/Http/Controllers/ProjectAgentController.php:400
 * @route '/api/projects/{project}/agents/{agent}/statistics'
 */
statistics.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                                agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return statistics.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::statistics
 * @see app/Http/Controllers/ProjectAgentController.php:400
 * @route '/api/projects/{project}/agents/{agent}/statistics'
 */
statistics.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::statistics
 * @see app/Http/Controllers/ProjectAgentController.php:400
 * @route '/api/projects/{project}/agents/{agent}/statistics'
 */
statistics.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(args, options),
    method: 'head',
})
const agent = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
toggleStatus: Object.assign(toggleStatus, toggleStatus),
statistics: Object.assign(statistics, statistics),
triggers: Object.assign(triggers, triggers),
actions: Object.assign(actions, actions),
executions: Object.assign(executions, executions),
}

export default agent