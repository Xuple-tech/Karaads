import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AgentIntelligenceController::show
 * @see app/Http/Controllers/AgentIntelligenceController.php:42
 * @route '/projects/{project}/agents/{agent}/intelligence'
 */
export const show = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/agents/{agent}/intelligence',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentIntelligenceController::show
 * @see app/Http/Controllers/AgentIntelligenceController.php:42
 * @route '/projects/{project}/agents/{agent}/intelligence'
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
* @see \App\Http\Controllers\AgentIntelligenceController::show
 * @see app/Http/Controllers/AgentIntelligenceController.php:42
 * @route '/projects/{project}/agents/{agent}/intelligence'
 */
show.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentIntelligenceController::show
 * @see app/Http/Controllers/AgentIntelligenceController.php:42
 * @route '/projects/{project}/agents/{agent}/intelligence'
 */
show.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentIntelligenceController::summary
 * @see app/Http/Controllers/AgentIntelligenceController.php:260
 * @route '/projects/{project}/agents/{agent}/intelligence/summary'
 */
export const summary = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(args, options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/agents/{agent}/intelligence/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentIntelligenceController::summary
 * @see app/Http/Controllers/AgentIntelligenceController.php:260
 * @route '/projects/{project}/agents/{agent}/intelligence/summary'
 */
summary.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return summary.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentIntelligenceController::summary
 * @see app/Http/Controllers/AgentIntelligenceController.php:260
 * @route '/projects/{project}/agents/{agent}/intelligence/summary'
 */
summary.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentIntelligenceController::summary
 * @see app/Http/Controllers/AgentIntelligenceController.php:260
 * @route '/projects/{project}/agents/{agent}/intelligence/summary'
 */
summary.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentIntelligenceController::exportMemories
 * @see app/Http/Controllers/AgentIntelligenceController.php:227
 * @route '/projects/{project}/agents/{agent}/intelligence/export-memories'
 */
export const exportMemories = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMemories.url(args, options),
    method: 'get',
})

exportMemories.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/agents/{agent}/intelligence/export-memories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentIntelligenceController::exportMemories
 * @see app/Http/Controllers/AgentIntelligenceController.php:227
 * @route '/projects/{project}/agents/{agent}/intelligence/export-memories'
 */
exportMemories.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return exportMemories.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentIntelligenceController::exportMemories
 * @see app/Http/Controllers/AgentIntelligenceController.php:227
 * @route '/projects/{project}/agents/{agent}/intelligence/export-memories'
 */
exportMemories.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMemories.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentIntelligenceController::exportMemories
 * @see app/Http/Controllers/AgentIntelligenceController.php:227
 * @route '/projects/{project}/agents/{agent}/intelligence/export-memories'
 */
exportMemories.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMemories.url(args, options),
    method: 'head',
})
const AgentIntelligenceController = { show, summary, exportMemories }

export default AgentIntelligenceController