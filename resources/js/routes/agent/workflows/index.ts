import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ToolChainController::index
 * @see app/Http/Controllers/ToolChainController.php:21
 * @route '/api/projects/{project}/agents/{agent}/workflows'
 */
export const index = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/workflows',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ToolChainController::index
 * @see app/Http/Controllers/ToolChainController.php:21
 * @route '/api/projects/{project}/agents/{agent}/workflows'
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
* @see \App\Http\Controllers\ToolChainController::index
 * @see app/Http/Controllers/ToolChainController.php:21
 * @route '/api/projects/{project}/agents/{agent}/workflows'
 */
index.get = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ToolChainController::index
 * @see app/Http/Controllers/ToolChainController.php:21
 * @route '/api/projects/{project}/agents/{agent}/workflows'
 */
index.head = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ToolChainController::store
 * @see app/Http/Controllers/ToolChainController.php:80
 * @route '/api/projects/{project}/agents/{agent}/workflows'
 */
export const store = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/workflows',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ToolChainController::store
 * @see app/Http/Controllers/ToolChainController.php:80
 * @route '/api/projects/{project}/agents/{agent}/workflows'
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
* @see \App\Http\Controllers\ToolChainController::store
 * @see app/Http/Controllers/ToolChainController.php:80
 * @route '/api/projects/{project}/agents/{agent}/workflows'
 */
store.post = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ToolChainController::show
 * @see app/Http/Controllers/ToolChainController.php:50
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
export const show = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ToolChainController::show
 * @see app/Http/Controllers/ToolChainController.php:50
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
show.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::show
 * @see app/Http/Controllers/ToolChainController.php:50
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
show.get = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ToolChainController::show
 * @see app/Http/Controllers/ToolChainController.php:50
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
show.head = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ToolChainController::update
 * @see app/Http/Controllers/ToolChainController.php:123
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
export const update = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ToolChainController::update
 * @see app/Http/Controllers/ToolChainController.php:123
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
update.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::update
 * @see app/Http/Controllers/ToolChainController.php:123
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
update.put = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ToolChainController::destroy
 * @see app/Http/Controllers/ToolChainController.php:150
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
export const destroy = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ToolChainController::destroy
 * @see app/Http/Controllers/ToolChainController.php:150
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
destroy.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::destroy
 * @see app/Http/Controllers/ToolChainController.php:150
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}'
 */
destroy.delete = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ToolChainController::validate
 * @see app/Http/Controllers/ToolChainController.php:161
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/validate'
 */
export const validate = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validate.url(args, options),
    method: 'get',
})

validate.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}/validate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ToolChainController::validate
 * @see app/Http/Controllers/ToolChainController.php:161
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/validate'
 */
validate.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return validate.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::validate
 * @see app/Http/Controllers/ToolChainController.php:161
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/validate'
 */
validate.get = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validate.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ToolChainController::validate
 * @see app/Http/Controllers/ToolChainController.php:161
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/validate'
 */
validate.head = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validate.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ToolChainController::plan
 * @see app/Http/Controllers/ToolChainController.php:175
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/plan'
 */
export const plan = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plan.url(args, options),
    method: 'get',
})

plan.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}/plan',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ToolChainController::plan
 * @see app/Http/Controllers/ToolChainController.php:175
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/plan'
 */
plan.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return plan.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::plan
 * @see app/Http/Controllers/ToolChainController.php:175
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/plan'
 */
plan.get = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plan.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ToolChainController::plan
 * @see app/Http/Controllers/ToolChainController.php:175
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/plan'
 */
plan.head = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plan.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ToolChainController::execute
 * @see app/Http/Controllers/ToolChainController.php:189
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/execute'
 */
export const execute = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/workflows/{chain}/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ToolChainController::execute
 * @see app/Http/Controllers/ToolChainController.php:189
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/execute'
 */
execute.url = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    agent: args[1],
                    chain: args[2],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                agent: args.agent,
                                chain: args.chain,
                }

    return execute.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{chain}', parsedArgs.chain.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ToolChainController::execute
 * @see app/Http/Controllers/ToolChainController.php:189
 * @route '/api/projects/{project}/agents/{agent}/workflows/{chain}/execute'
 */
execute.post = (args: { project: string | number, agent: string | number, chain: string | number } | [project: string | number, agent: string | number, chain: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})
const workflows = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
validate: Object.assign(validate, validate),
plan: Object.assign(plan, plan),
execute: Object.assign(execute, execute),
}

export default workflows