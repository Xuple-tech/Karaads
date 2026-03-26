import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WidgetController::embed
 * @see app/Http/Controllers/WidgetController.php:11
 * @route '/widget/embed/{agentSlug}'
 */
export const embed = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: embed.url(args, options),
    method: 'get',
})

embed.definition = {
    methods: ["get","head"],
    url: '/widget/embed/{agentSlug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WidgetController::embed
 * @see app/Http/Controllers/WidgetController.php:11
 * @route '/widget/embed/{agentSlug}'
 */
embed.url = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentSlug: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    agentSlug: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentSlug: args.agentSlug,
                }

    return embed.definition.url
            .replace('{agentSlug}', parsedArgs.agentSlug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\WidgetController::embed
 * @see app/Http/Controllers/WidgetController.php:11
 * @route '/widget/embed/{agentSlug}'
 */
embed.get = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: embed.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\WidgetController::embed
 * @see app/Http/Controllers/WidgetController.php:11
 * @route '/widget/embed/{agentSlug}'
 */
embed.head = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: embed.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/widget/script/{agent}'
 */
export const script = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})

script.definition = {
    methods: ["get","head"],
    url: '/widget/script/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/widget/script/{agent}'
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
 * @route '/widget/script/{agent}'
 */
script.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::script
 * @see app/Http/Controllers/Api/Demo/DemoController.php:68
 * @route '/widget/script/{agent}'
 */
script.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: script.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::config
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/widget/config/{agent}'
 */
export const config = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(args, options),
    method: 'get',
})

config.definition = {
    methods: ["get","head"],
    url: '/widget/config/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::config
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/widget/config/{agent}'
 */
config.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return config.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Demo\DemoController::config
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/widget/config/{agent}'
 */
config.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Demo\DemoController::config
 * @see app/Http/Controllers/Api/Demo/DemoController.php:35
 * @route '/widget/config/{agent}'
 */
config.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: config.url(args, options),
    method: 'head',
})
const widget = {
    embed: Object.assign(embed, embed),
script: Object.assign(script, script),
config: Object.assign(config, config),
}

export default widget