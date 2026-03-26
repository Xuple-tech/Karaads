import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
export const index = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/executions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
index.url = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
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

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
index.get = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
index.head = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
export const show = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/executions/{log}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
show.url = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    log: args[2],
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
                                log: typeof args.log === 'object'
                ? args.log.id
                : args.log,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
show.get = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::show
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
show.head = (args: { project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } } | [project: string | number | { id: string | number }, agent: string | number | { id: string | number }, log: string | number | { id: string | number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const executions = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
}

export default executions