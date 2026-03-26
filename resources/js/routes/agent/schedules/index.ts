import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AgentScheduleController::index
 * @see app/Http/Controllers/AgentScheduleController.php:20
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
export const index = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::index
 * @see app/Http/Controllers/AgentScheduleController.php:20
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
index.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                }

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::index
 * @see app/Http/Controllers/AgentScheduleController.php:20
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
index.get = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentScheduleController::index
 * @see app/Http/Controllers/AgentScheduleController.php:20
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
index.head = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::store
 * @see app/Http/Controllers/AgentScheduleController.php:78
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
export const store = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::store
 * @see app/Http/Controllers/AgentScheduleController.php:78
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
store.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                }

    return store.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::store
 * @see app/Http/Controllers/AgentScheduleController.php:78
 * @route '/api/projects/{project}/agents/{agent}/schedules'
 */
store.post = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::show
 * @see app/Http/Controllers/AgentScheduleController.php:55
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
export const show = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::show
 * @see app/Http/Controllers/AgentScheduleController.php:55
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
show.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::show
 * @see app/Http/Controllers/AgentScheduleController.php:55
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
show.get = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentScheduleController::show
 * @see app/Http/Controllers/AgentScheduleController.php:55
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
show.head = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::update
 * @see app/Http/Controllers/AgentScheduleController.php:129
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
export const update = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::update
 * @see app/Http/Controllers/AgentScheduleController.php:129
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
update.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::update
 * @see app/Http/Controllers/AgentScheduleController.php:129
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
update.put = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::destroy
 * @see app/Http/Controllers/AgentScheduleController.php:161
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
export const destroy = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::destroy
 * @see app/Http/Controllers/AgentScheduleController.php:161
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
destroy.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::destroy
 * @see app/Http/Controllers/AgentScheduleController.php:161
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}'
 */
destroy.delete = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::execute
 * @see app/Http/Controllers/AgentScheduleController.php:172
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/execute'
 */
export const execute = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::execute
 * @see app/Http/Controllers/AgentScheduleController.php:172
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/execute'
 */
execute.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return execute.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::execute
 * @see app/Http/Controllers/AgentScheduleController.php:172
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/execute'
 */
execute.post = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::history
 * @see app/Http/Controllers/AgentScheduleController.php:185
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/history'
 */
export const history = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::history
 * @see app/Http/Controllers/AgentScheduleController.php:185
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/history'
 */
history.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return history.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::history
 * @see app/Http/Controllers/AgentScheduleController.php:185
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/history'
 */
history.get = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentScheduleController::history
 * @see app/Http/Controllers/AgentScheduleController.php:185
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/history'
 */
history.head = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::stats
 * @see app/Http/Controllers/AgentScheduleController.php:209
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/stats'
 */
export const stats = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::stats
 * @see app/Http/Controllers/AgentScheduleController.php:209
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/stats'
 */
stats.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return stats.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::stats
 * @see app/Http/Controllers/AgentScheduleController.php:209
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/stats'
 */
stats.get = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentScheduleController::stats
 * @see app/Http/Controllers/AgentScheduleController.php:209
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/stats'
 */
stats.head = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentScheduleController::toggle
 * @see app/Http/Controllers/AgentScheduleController.php:223
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/toggle'
 */
export const toggle = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/schedules/{schedule}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentScheduleController::toggle
 * @see app/Http/Controllers/AgentScheduleController.php:223
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/toggle'
 */
toggle.url = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    schedule: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                schedule: args.schedule,
                }

    return toggle.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{schedule}', parsedArgs.schedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentScheduleController::toggle
 * @see app/Http/Controllers/AgentScheduleController.php:223
 * @route '/api/projects/{project}/agents/{agent}/schedules/{schedule}/toggle'
 */
toggle.post = (args: { project: string | number, agent: string | number, schedule: string | number } | [project: string | number, agent: string | number, schedule: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})
const schedules = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
execute: Object.assign(execute, execute),
history: Object.assign(history, history),
stats: Object.assign(stats, stats),
toggle: Object.assign(toggle, toggle),
}

export default schedules