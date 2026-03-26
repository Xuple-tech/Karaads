import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import conversations from './conversations'
import messages from './messages'
import knowledgeBase from './knowledge-base'
import tools from './tools'
import widgetSettings from './widget-settings'
import apiKeys from './api-keys'
import analytics from './analytics'
/**
* @see \App\Http\Controllers\User\AIAgentController::index
 * @see app/Http/Controllers/User/AIAgentController.php:15
 * @route '/ai-agents/agents'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::index
 * @see app/Http/Controllers/User/AIAgentController.php:15
 * @route '/ai-agents/agents'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::index
 * @see app/Http/Controllers/User/AIAgentController.php:15
 * @route '/ai-agents/agents'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AIAgentController::index
 * @see app/Http/Controllers/User/AIAgentController.php:15
 * @route '/ai-agents/agents'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::create
 * @see app/Http/Controllers/User/AIAgentController.php:38
 * @route '/ai-agents/agents/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::create
 * @see app/Http/Controllers/User/AIAgentController.php:38
 * @route '/ai-agents/agents/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::create
 * @see app/Http/Controllers/User/AIAgentController.php:38
 * @route '/ai-agents/agents/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AIAgentController::create
 * @see app/Http/Controllers/User/AIAgentController.php:38
 * @route '/ai-agents/agents/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::store
 * @see app/Http/Controllers/User/AIAgentController.php:67
 * @route '/ai-agents/agents'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/ai-agents/agents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::store
 * @see app/Http/Controllers/User/AIAgentController.php:67
 * @route '/ai-agents/agents'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::store
 * @see app/Http/Controllers/User/AIAgentController.php:67
 * @route '/ai-agents/agents'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::show
 * @see app/Http/Controllers/User/AIAgentController.php:148
 * @route '/ai-agents/agents/{agent}'
 */
export const show = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::show
 * @see app/Http/Controllers/User/AIAgentController.php:148
 * @route '/ai-agents/agents/{agent}'
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
* @see \App\Http\Controllers\User\AIAgentController::show
 * @see app/Http/Controllers/User/AIAgentController.php:148
 * @route '/ai-agents/agents/{agent}'
 */
show.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AIAgentController::show
 * @see app/Http/Controllers/User/AIAgentController.php:148
 * @route '/ai-agents/agents/{agent}'
 */
show.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::edit
 * @see app/Http/Controllers/User/AIAgentController.php:188
 * @route '/ai-agents/agents/{agent}/edit'
 */
export const edit = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::edit
 * @see app/Http/Controllers/User/AIAgentController.php:188
 * @route '/ai-agents/agents/{agent}/edit'
 */
edit.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::edit
 * @see app/Http/Controllers/User/AIAgentController.php:188
 * @route '/ai-agents/agents/{agent}/edit'
 */
edit.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AIAgentController::edit
 * @see app/Http/Controllers/User/AIAgentController.php:188
 * @route '/ai-agents/agents/{agent}/edit'
 */
edit.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::update
 * @see app/Http/Controllers/User/AIAgentController.php:199
 * @route '/ai-agents/agents/{agent}'
 */
export const update = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ai-agents/agents/{agent}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::update
 * @see app/Http/Controllers/User/AIAgentController.php:199
 * @route '/ai-agents/agents/{agent}'
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
* @see \App\Http\Controllers\User\AIAgentController::update
 * @see app/Http/Controllers/User/AIAgentController.php:199
 * @route '/ai-agents/agents/{agent}'
 */
update.put = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::destroy
 * @see app/Http/Controllers/User/AIAgentController.php:231
 * @route '/ai-agents/agents/{agent}'
 */
export const destroy = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/ai-agents/agents/{agent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::destroy
 * @see app/Http/Controllers/User/AIAgentController.php:231
 * @route '/ai-agents/agents/{agent}'
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
* @see \App\Http\Controllers\User\AIAgentController::destroy
 * @see app/Http/Controllers/User/AIAgentController.php:231
 * @route '/ai-agents/agents/{agent}'
 */
destroy.delete = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::toggleActive
 * @see app/Http/Controllers/User/AIAgentController.php:243
 * @route '/ai-agents/agents/{agent}/toggle-active'
 */
export const toggleActive = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::toggleActive
 * @see app/Http/Controllers/User/AIAgentController.php:243
 * @route '/ai-agents/agents/{agent}/toggle-active'
 */
toggleActive.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return toggleActive.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::toggleActive
 * @see app/Http/Controllers/User/AIAgentController.php:243
 * @route '/ai-agents/agents/{agent}/toggle-active'
 */
toggleActive.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AIAgentController::duplicate
 * @see app/Http/Controllers/User/AIAgentController.php:254
 * @route '/ai-agents/agents/{agent}/duplicate'
 */
export const duplicate = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})

duplicate.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/duplicate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AIAgentController::duplicate
 * @see app/Http/Controllers/User/AIAgentController.php:254
 * @route '/ai-agents/agents/{agent}/duplicate'
 */
duplicate.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return duplicate.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AIAgentController::duplicate
 * @see app/Http/Controllers/User/AIAgentController.php:254
 * @route '/ai-agents/agents/{agent}/duplicate'
 */
duplicate.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: duplicate.url(args, options),
    method: 'post',
})
const agents = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
toggleActive: Object.assign(toggleActive, toggleActive),
duplicate: Object.assign(duplicate, duplicate),
conversations: Object.assign(conversations, conversations),
messages: Object.assign(messages, messages),
knowledgeBase: Object.assign(knowledgeBase, knowledgeBase),
tools: Object.assign(tools, tools),
widgetSettings: Object.assign(widgetSettings, widgetSettings),
apiKeys: Object.assign(apiKeys, apiKeys),
analytics: Object.assign(analytics, analytics),
}

export default agents