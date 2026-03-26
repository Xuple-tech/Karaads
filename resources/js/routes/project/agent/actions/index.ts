import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ProjectAgentController::index
* @see app/Http/Controllers/ProjectAgentController.php:238
* @route '/api/projects/{project}/agents/{agent}/actions'
*/
export const index = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/actions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::index
* @see app/Http/Controllers/ProjectAgentController.php:238
* @route '/api/projects/{project}/agents/{agent}/actions'
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
* @see app/Http/Controllers/ProjectAgentController.php:238
* @route '/api/projects/{project}/agents/{agent}/actions'
*/
index.get = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::index
* @see app/Http/Controllers/ProjectAgentController.php:238
* @route '/api/projects/{project}/agents/{agent}/actions'
*/
index.head = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::create
* @see app/Http/Controllers/ProjectAgentController.php:263
* @route '/api/projects/{project}/agents/{agent}/actions'
*/
export const create = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/actions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::create
* @see app/Http/Controllers/ProjectAgentController.php:263
* @route '/api/projects/{project}/agents/{agent}/actions'
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
* @see app/Http/Controllers/ProjectAgentController.php:263
* @route '/api/projects/{project}/agents/{agent}/actions'
*/
create.post = (args: { project: string | { id: string }, agent: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::update
* @see app/Http/Controllers/ProjectAgentController.php:300
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
export const update = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/actions/{action}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::update
* @see app/Http/Controllers/ProjectAgentController.php:300
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
update.url = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::update
* @see app/Http/Controllers/ProjectAgentController.php:300
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
update.put = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
* @see app/Http/Controllers/ProjectAgentController.php:326
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
export const deleteMethod = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/actions/{action}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
* @see app/Http/Controllers/ProjectAgentController.php:326
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
deleteMethod.url = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{action}', parsedArgs.action.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ProjectAgentController::deleteMethod
* @see app/Http/Controllers/ProjectAgentController.php:326
* @route '/api/projects/{project}/agents/{agent}/actions/{action}'
*/
deleteMethod.delete = (args: { project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } } | [project: string | { id: string }, agent: string | { id: string }, action: string | { id: string } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

const actions = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default actions