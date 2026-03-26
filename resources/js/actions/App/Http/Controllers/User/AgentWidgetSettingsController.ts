import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::show
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:13
 * @route '/ai-agents/agents/{agent}/widget-settings'
 */
export const show = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/widget-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::show
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:13
 * @route '/ai-agents/agents/{agent}/widget-settings'
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
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::show
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:13
 * @route '/ai-agents/agents/{agent}/widget-settings'
 */
show.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::show
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:13
 * @route '/ai-agents/agents/{agent}/widget-settings'
 */
show.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::edit
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:25
 * @route '/ai-agents/agents/{agent}/widget-settings/edit'
 */
export const edit = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/ai-agents/agents/{agent}/widget-settings/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::edit
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:25
 * @route '/ai-agents/agents/{agent}/widget-settings/edit'
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
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::edit
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:25
 * @route '/ai-agents/agents/{agent}/widget-settings/edit'
 */
edit.get = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::edit
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:25
 * @route '/ai-agents/agents/{agent}/widget-settings/edit'
 */
edit.head = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::update
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:37
 * @route '/ai-agents/agents/{agent}/widget-settings'
 */
export const update = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/ai-agents/agents/{agent}/widget-settings',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::update
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:37
 * @route '/ai-agents/agents/{agent}/widget-settings'
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
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::update
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:37
 * @route '/ai-agents/agents/{agent}/widget-settings'
 */
update.put = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::preview
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:77
 * @route '/ai-agents/agents/{agent}/widget-settings/preview'
 */
export const preview = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/widget-settings/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::preview
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:77
 * @route '/ai-agents/agents/{agent}/widget-settings/preview'
 */
preview.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return preview.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::preview
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:77
 * @route '/ai-agents/agents/{agent}/widget-settings/preview'
 */
preview.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::reset
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:92
 * @route '/ai-agents/agents/{agent}/widget-settings/reset'
 */
export const reset = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(args, options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/ai-agents/agents/{agent}/widget-settings/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::reset
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:92
 * @route '/ai-agents/agents/{agent}/widget-settings/reset'
 */
reset.url = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return reset.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\AgentWidgetSettingsController::reset
 * @see app/Http/Controllers/User/AgentWidgetSettingsController.php:92
 * @route '/ai-agents/agents/{agent}/widget-settings/reset'
 */
reset.post = (args: { agent: string | { id: string } } | [agent: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(args, options),
    method: 'post',
})
const AgentWidgetSettingsController = { show, edit, update, preview, reset }

export default AgentWidgetSettingsController