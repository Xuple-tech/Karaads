import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AgentController::index
 * @see app/Http/Controllers/AgentController.php:17
 * @route '/agents'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentController::index
 * @see app/Http/Controllers/AgentController.php:17
 * @route '/agents'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::index
 * @see app/Http/Controllers/AgentController.php:17
 * @route '/agents'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentController::index
 * @see app/Http/Controllers/AgentController.php:17
 * @route '/agents'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentController::show
 * @see app/Http/Controllers/AgentController.php:48
 * @route '/agents/{agent}'
 */
export const show = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/agents/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentController::show
 * @see app/Http/Controllers/AgentController.php:48
 * @route '/agents/{agent}'
 */
show.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return show.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::show
 * @see app/Http/Controllers/AgentController.php:48
 * @route '/agents/{agent}'
 */
show.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentController::show
 * @see app/Http/Controllers/AgentController.php:48
 * @route '/agents/{agent}'
 */
show.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentController::store
 * @see app/Http/Controllers/AgentController.php:75
 * @route '/agents'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/agents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AgentController::store
 * @see app/Http/Controllers/AgentController.php:75
 * @route '/agents'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::store
 * @see app/Http/Controllers/AgentController.php:75
 * @route '/agents'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AgentController::update
 * @see app/Http/Controllers/AgentController.php:123
 * @route '/agents/{agent}'
 */
export const update = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/agents/{agent}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\AgentController::update
 * @see app/Http/Controllers/AgentController.php:123
 * @route '/agents/{agent}'
 */
update.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return update.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::update
 * @see app/Http/Controllers/AgentController.php:123
 * @route '/agents/{agent}'
 */
update.put = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\AgentController::destroy
 * @see app/Http/Controllers/AgentController.php:171
 * @route '/agents/{agent}'
 */
export const destroy = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/agents/{agent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AgentController::destroy
 * @see app/Http/Controllers/AgentController.php:171
 * @route '/agents/{agent}'
 */
destroy.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: typeof args.agent === 'object'
                ? args.agent.id
                : args.agent,
                }

    return destroy.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::destroy
 * @see app/Http/Controllers/AgentController.php:171
 * @route '/agents/{agent}'
 */
destroy.delete = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\AgentController::byCapability
 * @see app/Http/Controllers/AgentController.php:190
 * @route '/agents/capability/{capability}'
 */
export const byCapability = (args: { capability: string | number } | [capability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: byCapability.url(args, options),
    method: 'get',
})

byCapability.definition = {
    methods: ["get","head"],
    url: '/agents/capability/{capability}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentController::byCapability
 * @see app/Http/Controllers/AgentController.php:190
 * @route '/agents/capability/{capability}'
 */
byCapability.url = (args: { capability: string | number } | [capability: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { capability: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    capability: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        capability: args.capability,
                }

    return byCapability.definition.url
            .replace('{capability}', parsedArgs.capability.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::byCapability
 * @see app/Http/Controllers/AgentController.php:190
 * @route '/agents/capability/{capability}'
 */
byCapability.get = (args: { capability: string | number } | [capability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: byCapability.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentController::byCapability
 * @see app/Http/Controllers/AgentController.php:190
 * @route '/agents/capability/{capability}'
 */
byCapability.head = (args: { capability: string | number } | [capability: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: byCapability.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AgentController::tools
 * @see app/Http/Controllers/AgentController.php:230
 * @route '/agents/tools/available'
 */
export const tools = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

tools.definition = {
    methods: ["get","head"],
    url: '/agents/tools/available',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AgentController::tools
 * @see app/Http/Controllers/AgentController.php:230
 * @route '/agents/tools/available'
 */
tools.url = (options?: RouteQueryOptions) => {
    return tools.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AgentController::tools
 * @see app/Http/Controllers/AgentController.php:230
 * @route '/agents/tools/available'
 */
tools.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AgentController::tools
 * @see app/Http/Controllers/AgentController.php:230
 * @route '/agents/tools/available'
 */
tools.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tools.url(options),
    method: 'head',
})
const agents = {
    index: Object.assign(index, index),
show: Object.assign(show, show),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
byCapability: Object.assign(byCapability, byCapability),
tools: Object.assign(tools, tools),
}

export default agents