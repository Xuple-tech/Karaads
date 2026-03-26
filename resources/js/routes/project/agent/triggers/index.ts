import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
export const index = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/triggers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
index.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
index.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ProjectAgentController::index
 * @see app/Http/Controllers/ProjectAgentController.php:136
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
index.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::create
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
export const create = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/triggers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::create
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
create.url = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return create.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::create
 * @see app/Http/Controllers/ProjectAgentController.php:161
 * @route '/api/projects/{project}/agents/{agent}/triggers'
 */
create.post = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
export const update = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
update.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::update
 * @see app/Http/Controllers/ProjectAgentController.php:194
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
update.put = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
export const deleteMethod = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
deleteMethod.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
 * @see app/Http/Controllers/ProjectAgentController.php:220
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}'
 */
deleteMethod.delete = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::test
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
export const test = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::test
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
test.url = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return test.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{trigger}', parsedArgs.trigger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::test
 * @see app/Http/Controllers/ProjectAgentController.php:461
 * @route '/api/projects/{project}/agents/{agent}/triggers/{trigger}/test'
 */
test.post = (args: { project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, trigger: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})
const triggers = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
test: Object.assign(test, test),
}

export default triggers