import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::agents
 * @see app/Http/Controllers/Api/Demo/DemoController.php:16
 * @route '/demo/api/agents'
 */
export const agents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: agents.url(options),
    method: 'get',
})

agents.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::agents
 * @see app/Http/Controllers/Api/Demo/DemoController.php:16
 * @route '/demo/api/agents'
 */
agents.url = (options?: RouteQueryOptions) => {
    return agents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::agents
 * @see app/Http/Controllers/Api/Demo/DemoController.php:16
 * @route '/demo/api/agents'
 */
agents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: agents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::agents
 * @see app/Http/Controllers/Api/Demo/DemoController.php:16
 * @route '/demo/api/agents'
 */
agents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: agents.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::widgetSettings
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/demo/api/agents/{agent}/widget-settings'
 */
export const widgetSettings = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: widgetSettings.url(args, options),
    method: 'get',
})

widgetSettings.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/widget-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::widgetSettings
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/demo/api/agents/{agent}/widget-settings'
 */
widgetSettings.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: args.agent,
                }

    return widgetSettings.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::widgetSettings
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/demo/api/agents/{agent}/widget-settings'
 */
widgetSettings.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: widgetSettings.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::widgetSettings
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/demo/api/agents/{agent}/widget-settings'
 */
widgetSettings.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: widgetSettings.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/demo/api/agents/{agent}/script'
 */
export const script = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})

script.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/script',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/demo/api/agents/{agent}/script'
 */
script.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: args.agent,
                }

    return script.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/demo/api/agents/{agent}/script'
 */
script.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/demo/api/agents/{agent}/script'
 */
script.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: script.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::stats
 * @see app/Http/Controllers/Api/Demo/DemoController.php:149
 * @route '/demo/api/agents/{agent}/stats'
 */
export const stats = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/demo/api/agents/{agent}/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::stats
 * @see app/Http/Controllers/Api/Demo/DemoController.php:149
 * @route '/demo/api/agents/{agent}/stats'
 */
stats.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: args.agent,
                }

    return stats.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::stats
 * @see app/Http/Controllers/Api/Demo/DemoController.php:149
 * @route '/demo/api/agents/{agent}/stats'
 */
stats.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::stats
 * @see app/Http/Controllers/Api/Demo/DemoController.php:149
 * @route '/demo/api/agents/{agent}/stats'
 */
stats.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::data
 * @see app/Http/Controllers/Api/Demo/DemoController.php:219
 * @route '/demo/api/data'
 */
export const data = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})

data.definition = {
    methods: ["get","head"],
    url: '/demo/api/data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::data
 * @see app/Http/Controllers/Api/Demo/DemoController.php:219
 * @route '/demo/api/data'
 */
data.url = (options?: RouteQueryOptions) => {
    return data.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::data
 * @see app/Http/Controllers/Api/Demo/DemoController.php:219
 * @route '/demo/api/data'
 */
data.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: data.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::data
 * @see app/Http/Controllers/Api/Demo/DemoController.php:219
 * @route '/demo/api/data'
 */
data.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: data.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::conversation
 * @see app/Http/Controllers/Api/Demo/DemoController.php:107
 * @route '/demo/api/agents/{agent}/conversation'
 */
export const conversation = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversation.url(args, options),
    method: 'post',
})

conversation.definition = {
    methods: ["post"],
    url: '/demo/api/agents/{agent}/conversation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::conversation
 * @see app/Http/Controllers/Api/Demo/DemoController.php:107
 * @route '/demo/api/agents/{agent}/conversation'
 */
conversation.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agent: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    agent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agent: args.agent,
                }

    return conversation.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::conversation
 * @see app/Http/Controllers/Api/Demo/DemoController.php:107
 * @route '/demo/api/agents/{agent}/conversation'
 */
conversation.post = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: conversation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
 * @see app/Http/Controllers/Api/Demo/DemoController.php:175
 * @route '/demo/api/validate-config'
 */
export const validateConfig = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateConfig.url(options),
    method: 'post',
})

validateConfig.definition = {
    methods: ["post"],
    url: '/demo/api/validate-config',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
 * @see app/Http/Controllers/Api/Demo/DemoController.php:175
 * @route '/demo/api/validate-config'
 */
validateConfig.url = (options?: RouteQueryOptions) => {
    return validateConfig.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::validateConfig
 * @see app/Http/Controllers/Api/Demo/DemoController.php:175
 * @route '/demo/api/validate-config'
 */
validateConfig.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: validateConfig.url(options),
    method: 'post',
})
const api = {
    agents: Object.assign(agents, agents),
widgetSettings: Object.assign(widgetSettings, widgetSettings),
script: Object.assign(script, script),
stats: Object.assign(stats, stats),
data: Object.assign(data, data),
conversation: Object.assign(conversation, conversation),
validateConfig: Object.assign(validateConfig, validateConfig),
}

export default api