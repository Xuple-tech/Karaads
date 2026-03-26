import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
import sessions from './sessions'
import chat from './chat'
import files from './files'
import webhooks from './webhooks'
import analytics from './analytics'
/**
* @see routes/widget-api.php:43
* @route '/api/v1/widget/health'
*/
export const health = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

health.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/health',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/widget-api.php:43
* @route '/api/v1/widget/health'
*/
health.url = (options?: RouteQueryOptions) => {
    return health.definition.url + queryParams(options)
}

/**
* @see routes/widget-api.php:43
* @route '/api/v1/widget/health'
*/
health.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: health.url(options),
    method: 'get',
})

/**
* @see routes/widget-api.php:43
* @route '/api/v1/widget/health'
*/
health.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: health.url(options),
    method: 'head',
})

/**
* @see routes/widget-api.php:52
* @route '/api/v1/widget/config/{agentSlug}'
*/
export const config = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(args, options),
    method: 'get',
})

config.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/config/{agentSlug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/widget-api.php:52
* @route '/api/v1/widget/config/{agentSlug}'
*/
config.url = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return config.definition.url
            .replace('{agentSlug}', parsedArgs.agentSlug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see routes/widget-api.php:52
* @route '/api/v1/widget/config/{agentSlug}'
*/
config.get = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: config.url(args, options),
    method: 'get',
})

/**
* @see routes/widget-api.php:52
* @route '/api/v1/widget/config/{agentSlug}'
*/
config.head = (args: { agentSlug: string | number } | [agentSlug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: config.url(args, options),
    method: 'head',
})

const widget = {
    sessions: Object.assign(sessions, sessions),
    chat: Object.assign(chat, chat),
    files: Object.assign(files, files),
    webhooks: Object.assign(webhooks, webhooks),
    analytics: Object.assign(analytics, analytics),
    health: Object.assign(health, health),
    config: Object.assign(config, config),
}

export default widget