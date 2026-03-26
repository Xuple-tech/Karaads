import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AgentToolController::index
 * @see app/Http/Controllers/AgentToolController.php:28
 * @route '/api/projects/{project}/tools'
 */
export const index = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentToolController::index
 * @see app/Http/Controllers/AgentToolController.php:28
 * @route '/api/projects/{project}/tools'
 */
index.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::index
 * @see app/Http/Controllers/AgentToolController.php:28
 * @route '/api/projects/{project}/tools'
 */
index.get = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentToolController::index
 * @see app/Http/Controllers/AgentToolController.php:28
 * @route '/api/projects/{project}/tools'
 */
index.head = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentToolController::show
 * @see app/Http/Controllers/AgentToolController.php:45
 * @route '/api/projects/{project}/tools/{toolName}'
 */
export const show = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/tools/{toolName}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentToolController::show
 * @see app/Http/Controllers/AgentToolController.php:45
 * @route '/api/projects/{project}/tools/{toolName}'
 */
show.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::show
 * @see app/Http/Controllers/AgentToolController.php:45
 * @route '/api/projects/{project}/tools/{toolName}'
 */
show.get = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentToolController::show
 * @see app/Http/Controllers/AgentToolController.php:45
 * @route '/api/projects/{project}/tools/{toolName}'
 */
show.head = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentToolController::execute
 * @see app/Http/Controllers/AgentToolController.php:145
 * @route '/api/projects/{project}/tools/{toolName}/execute'
 */
export const execute = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

execute.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/tools/{toolName}/execute',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentToolController::execute
 * @see app/Http/Controllers/AgentToolController.php:145
 * @route '/api/projects/{project}/tools/{toolName}/execute'
 */
execute.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return execute.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::execute
 * @see app/Http/Controllers/AgentToolController.php:145
 * @route '/api/projects/{project}/tools/{toolName}/execute'
 */
execute.post = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: execute.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentToolController::test
 * @see app/Http/Controllers/AgentToolController.php:162
 * @route '/api/projects/{project}/tools/{toolName}/test'
 */
export const test = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/tools/{toolName}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentToolController::test
 * @see app/Http/Controllers/AgentToolController.php:162
 * @route '/api/projects/{project}/tools/{toolName}/test'
 */
test.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return test.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::test
 * @see app/Http/Controllers/AgentToolController.php:162
 * @route '/api/projects/{project}/tools/{toolName}/test'
 */
test.post = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentToolController::guidelines
 * @see app/Http/Controllers/AgentToolController.php:186
 * @route '/api/projects/{project}/tools/{toolName}/guidelines'
 */
export const guidelines = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: guidelines.url(args, options),
    method: 'get',
})

guidelines.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/tools/{toolName}/guidelines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentToolController::guidelines
 * @see app/Http/Controllers/AgentToolController.php:186
 * @route '/api/projects/{project}/tools/{toolName}/guidelines'
 */
guidelines.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return guidelines.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::guidelines
 * @see app/Http/Controllers/AgentToolController.php:186
 * @route '/api/projects/{project}/tools/{toolName}/guidelines'
 */
guidelines.get = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: guidelines.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentToolController::guidelines
 * @see app/Http/Controllers/AgentToolController.php:186
 * @route '/api/projects/{project}/tools/{toolName}/guidelines'
 */
guidelines.head = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: guidelines.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentToolController::store
 * @see app/Http/Controllers/AgentToolController.php:60
 * @route '/api/projects/{project}/tools'
 */
export const store = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/tools',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentToolController::store
 * @see app/Http/Controllers/AgentToolController.php:60
 * @route '/api/projects/{project}/tools'
 */
store.url = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                }

    return store.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::store
 * @see app/Http/Controllers/AgentToolController.php:60
 * @route '/api/projects/{project}/tools'
 */
store.post = (args: { project: string | number } | [project: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentToolController::update
 * @see app/Http/Controllers/AgentToolController.php:93
 * @route '/api/projects/{project}/tools/{toolName}'
 */
export const update = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/projects/{project}/tools/{toolName}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AgentToolController::update
 * @see app/Http/Controllers/AgentToolController.php:93
 * @route '/api/projects/{project}/tools/{toolName}'
 */
update.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return update.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::update
 * @see app/Http/Controllers/AgentToolController.php:93
 * @route '/api/projects/{project}/tools/{toolName}'
 */
update.put = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AgentToolController::destroy
 * @see app/Http/Controllers/AgentToolController.php:127
 * @route '/api/projects/{project}/tools/{toolName}'
 */
export const destroy = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/tools/{toolName}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AgentToolController::destroy
 * @see app/Http/Controllers/AgentToolController.php:127
 * @route '/api/projects/{project}/tools/{toolName}'
 */
destroy.url = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    project: args[0],
                    toolName: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        project: args.project,
                                toolName: args.toolName,
                }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{toolName}', parsedArgs.toolName.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentToolController::destroy
 * @see app/Http/Controllers/AgentToolController.php:127
 * @route '/api/projects/{project}/tools/{toolName}'
 */
destroy.delete = (args: { project: string | number, toolName: string | number } | [project: string | number, toolName: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const tools = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
execute: Object.assign(execute, execute),
test: Object.assign(test, test),
guidelines: Object.assign(guidelines, guidelines),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default tools