import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AgentMemoryController::index
* @see app/Http/Controllers/AgentMemoryController.php:21
* @route '/api/projects/{project}/agents/{agent}/memory'
*/
export const index = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/memory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::index
* @see app/Http/Controllers/AgentMemoryController.php:21
* @route '/api/projects/{project}/agents/{agent}/memory'
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
* @see \App\Http\Controllers\AgentMemoryController::index
* @see app/Http/Controllers/AgentMemoryController.php:21
* @route '/api/projects/{project}/agents/{agent}/memory'
*/
index.get = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::index
* @see app/Http/Controllers/AgentMemoryController.php:21
* @route '/api/projects/{project}/agents/{agent}/memory'
*/
index.head = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::search
* @see app/Http/Controllers/AgentMemoryController.php:43
* @route '/api/projects/{project}/agents/{agent}/memory/search'
*/
export const search = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(args, options),
    method: 'post',
})

search.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/memory/search',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::search
* @see app/Http/Controllers/AgentMemoryController.php:43
* @route '/api/projects/{project}/agents/{agent}/memory/search'
*/
search.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
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

    return search.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentMemoryController::search
* @see app/Http/Controllers/AgentMemoryController.php:43
* @route '/api/projects/{project}/agents/{agent}/memory/search'
*/
search.post = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: search.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::relevant
* @see app/Http/Controllers/AgentMemoryController.php:68
* @route '/api/projects/{project}/agents/{agent}/memory/relevant'
*/
export const relevant = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: relevant.url(args, options),
    method: 'get',
})

relevant.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/memory/relevant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::relevant
* @see app/Http/Controllers/AgentMemoryController.php:68
* @route '/api/projects/{project}/agents/{agent}/memory/relevant'
*/
relevant.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
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

    return relevant.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentMemoryController::relevant
* @see app/Http/Controllers/AgentMemoryController.php:68
* @route '/api/projects/{project}/agents/{agent}/memory/relevant'
*/
relevant.get = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: relevant.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::relevant
* @see app/Http/Controllers/AgentMemoryController.php:68
* @route '/api/projects/{project}/agents/{agent}/memory/relevant'
*/
relevant.head = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: relevant.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::store
* @see app/Http/Controllers/AgentMemoryController.php:88
* @route '/api/projects/{project}/agents/{agent}/memory'
*/
export const store = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/memory',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::store
* @see app/Http/Controllers/AgentMemoryController.php:88
* @route '/api/projects/{project}/agents/{agent}/memory'
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
* @see \App\Http\Controllers\AgentMemoryController::store
* @see app/Http/Controllers/AgentMemoryController.php:88
* @route '/api/projects/{project}/agents/{agent}/memory'
*/
store.post = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::destroy
* @see app/Http/Controllers/AgentMemoryController.php:113
* @route '/api/projects/{project}/agents/{agent}/memory/{memory}'
*/
export const destroy = (args: { project: string | number, agent: string | number, memory: string | number } | [project: string | number, agent: string | number, memory: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/projects/{project}/agents/{agent}/memory/{memory}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::destroy
* @see app/Http/Controllers/AgentMemoryController.php:113
* @route '/api/projects/{project}/agents/{agent}/memory/{memory}'
*/
destroy.url = (args: { project: string | number, agent: string | number, memory: string | number } | [project: string | number, agent: string | number, memory: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            agent: args[1],
            memory: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: args.project,
        agent: args.agent,
        memory: args.memory,
    }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace('{memory}', parsedArgs.memory.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentMemoryController::destroy
* @see app/Http/Controllers/AgentMemoryController.php:113
* @route '/api/projects/{project}/agents/{agent}/memory/{memory}'
*/
destroy.delete = (args: { project: string | number, agent: string | number, memory: string | number } | [project: string | number, agent: string | number, memory: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::clear
* @see app/Http/Controllers/AgentMemoryController.php:124
* @route '/api/projects/{project}/agents/{agent}/memory/clear'
*/
export const clear = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clear.url(args, options),
    method: 'post',
})

clear.definition = {
    methods: ["post"],
    url: '/api/projects/{project}/agents/{agent}/memory/clear',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::clear
* @see app/Http/Controllers/AgentMemoryController.php:124
* @route '/api/projects/{project}/agents/{agent}/memory/clear'
*/
clear.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
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

    return clear.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentMemoryController::clear
* @see app/Http/Controllers/AgentMemoryController.php:124
* @route '/api/projects/{project}/agents/{agent}/memory/clear'
*/
clear.post = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clear.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::exportMethod
* @see app/Http/Controllers/AgentMemoryController.php:138
* @route '/api/projects/{project}/agents/{agent}/memory/export'
*/
export const exportMethod = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/api/projects/{project}/agents/{agent}/memory/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentMemoryController::exportMethod
* @see app/Http/Controllers/AgentMemoryController.php:138
* @route '/api/projects/{project}/agents/{agent}/memory/export'
*/
exportMethod.url = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentMemoryController::exportMethod
* @see app/Http/Controllers/AgentMemoryController.php:138
* @route '/api/projects/{project}/agents/{agent}/memory/export'
*/
exportMethod.get = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AgentMemoryController::exportMethod
* @see app/Http/Controllers/AgentMemoryController.php:138
* @route '/api/projects/{project}/agents/{agent}/memory/export'
*/
exportMethod.head = (args: { project: string | number, agent: string | number } | [project: string | number, agent: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

const AgentMemoryController = { index, search, relevant, store, destroy, clear, exportMethod, export: exportMethod }

export default AgentMemoryController