import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:21
 * @route '/api/projects/{project}/agents'
 */
export const index = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:21
 * @route '/api/projects/{project}/agents'
 */
index.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:21
 * @route '/api/projects/{project}/agents'
 */
index.get = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:21
 * @route '/api/projects/{project}/agents'
 */
index.head = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::store
 * @see app/Http/Controllers/ProjectAgentController.php:43
 * @route '/api/projects/{project}/agents'
 */
export const store = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::store
 * @see app/Http/Controllers/ProjectAgentController.php:43
 * @route '/api/projects/{project}/agents'
 */
store.url = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { project: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: typeof args.project === 'object'
                ? args.project.id
                : args.project,
                }

    return store.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::store
 * @see app/Http/Controllers/ProjectAgentController.php:43
 * @route '/api/projects/{project}/agents'
 */
store.post = (args: { project: string | { id: string } } | [project: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

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
* @see \App\Http\Controllers\ProjectAgentController::destroy
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
export const destroy = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::destroy
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
destroy.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::destroy
 * @see app/Http/Controllers/ProjectAgentController.php:118
 * @route '/api/projects/{project}/agents/{agent}'
 */
destroy.delete = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
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

/**
* @see \App\Http\Controllers\ProjectAgentController::triggers
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
export const triggers = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: triggers.url(args, options),
    method: 'get',
})

triggers.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/triggers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::triggers
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
triggers.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return triggers.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::triggers
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
triggers.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: triggers.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::triggers
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
triggers.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: triggers.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::storeTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
export const storeTrigger = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTrigger.url(args, options),
    method: 'post',
})

storeTrigger.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/triggers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::storeTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
storeTrigger.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return storeTrigger.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::storeTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
storeTrigger.post = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTrigger.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::updateTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
export const updateTrigger = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTrigger.url(args, options),
    method: 'put',
})

updateTrigger.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::updateTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
updateTrigger.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    trigger: args[2],
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
                                trigger: typeof args.trigger === 'object'
                ? args.trigger.id
                : args.trigger,
                }

    return updateTrigger.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::updateTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
updateTrigger.put = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTrigger.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
export const destroyTrigger = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTrigger.url(args, options),
    method: 'delete',
})

destroyTrigger.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
destroyTrigger.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    trigger: args[2],
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
                                trigger: typeof args.trigger === 'object'
                ? args.trigger.id
                : args.trigger,
                }

    return destroyTrigger.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
destroyTrigger.delete = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTrigger.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::testTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
export const testTrigger = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testTrigger.url(args, options),
    method: 'post',
})

testTrigger.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::testTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
testTrigger.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    trigger: args[2],
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
                                trigger: typeof args.trigger === 'object'
                ? args.trigger.id
                : args.trigger,
                }

    return testTrigger.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::testTrigger
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
testTrigger.post = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: testTrigger.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::actions
 * @see app/Http/Controllers/ProjectAgentController.php:238
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
export const actions = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actions.url(args, options),
    method: 'get',
})

actions.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/actions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::actions
 * @see app/Http/Controllers/ProjectAgentController.php:238
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
actions.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return actions.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::actions
 * @see app/Http/Controllers/ProjectAgentController.php:238
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
actions.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actions.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::actions
 * @see app/Http/Controllers/ProjectAgentController.php:238
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
actions.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: actions.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::storeAction
 * @see app/Http/Controllers/ProjectAgentController.php:263
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
export const storeAction = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAction.url(args, options),
    method: 'post',
})

storeAction.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/actions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::storeAction
 * @see app/Http/Controllers/ProjectAgentController.php:263
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
storeAction.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return storeAction.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::storeAction
 * @see app/Http/Controllers/ProjectAgentController.php:263
 * @route '/api/projects/{project}/agents/{agent}/actions'
 */
storeAction.post = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAction.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::updateAction
 * @see app/Http/Controllers/ProjectAgentController.php:300
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
export const updateAction = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAction.url(args, options),
    method: 'put',
})

updateAction.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/actions/{action}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::updateAction
 * @see app/Http/Controllers/ProjectAgentController.php:300
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
updateAction.url = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    action: args[2],
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
                                action: typeof args.action === 'object'
                ? args.action.id
                : args.action,
                }

    return updateAction.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::updateAction
 * @see app/Http/Controllers/ProjectAgentController.php:300
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
updateAction.put = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAction.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyAction
 * @see app/Http/Controllers/ProjectAgentController.php:326
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
export const destroyAction = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAction.url(args, options),
    method: 'delete',
})

destroyAction.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/actions/{action}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyAction
 * @see app/Http/Controllers/ProjectAgentController.php:326
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
destroyAction.url = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    action: args[2],
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
                                action: typeof args.action === 'object'
                ? args.action.id
                : args.action,
                }

    return destroyAction.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::destroyAction
 * @see app/Http/Controllers/ProjectAgentController.php:326
 * @route '/api/projects/{project}/agents/{agent}/actions/{action}'
 */
destroyAction.delete = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAction.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogs
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
export const executionLogs = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionLogs.url(args, options),
    method: 'get',
})

executionLogs.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/executions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogs
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
executionLogs.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return executionLogs.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogs
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
executionLogs.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionLogs.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogs
 * @see app/Http/Controllers/ProjectAgentController.php:344
 * @route '/api/projects/{project}/agents/{agent}/executions'
 */
executionLogs.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionLogs.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogDetail
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
export const executionLogDetail = (args: { project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionLogDetail.url(args, options),
    method: 'get',
})

executionLogDetail.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/executions/{log}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogDetail
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
executionLogDetail.url = (args: { project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return executionLogDetail.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{log}', parsedArgs.log.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogDetail
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
executionLogDetail.get = (args: { project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: executionLogDetail.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::executionLogDetail
 * @see app/Http/Controllers/ProjectAgentController.php:384
 * @route '/api/projects/{project}/agents/{agent}/executions/{log}'
 */
executionLogDetail.head = (args: { project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, log: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: executionLogDetail.url(args, options),
    method: 'head',
})
const ProjectAgentController = { index, store, show, update, destroy, toggleStatus, statistics, triggers, storeTrigger, updateTrigger, destroyTrigger, testTrigger, actions, storeAction, updateAction, destroyAction, executionLogs, executionLogDetail }

export default ProjectAgentController