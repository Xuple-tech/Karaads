import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::summary
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:15
 * @route '/api/v1/widget/analytics/summary/{agent}'
 */
export const summary = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(args, options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/analytics/summary/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::summary
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:15
 * @route '/api/v1/widget/analytics/summary/{agent}'
 */
summary.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return summary.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::summary
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:15
 * @route '/api/v1/widget/analytics/summary/{agent}'
 */
summary.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::summary
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:15
 * @route '/api/v1/widget/analytics/summary/{agent}'
 */
summary.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::usage
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:96
 * @route '/api/v1/widget/analytics/usage/{agent}'
 */
export const usage = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(args, options),
    method: 'get',
})

usage.definition = {
    methods: ["get","head"],
    url: '/api/v1/widget/analytics/usage/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::usage
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:96
 * @route '/api/v1/widget/analytics/usage/{agent}'
 */
usage.url = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return usage.definition.url
            .replace('{agent}', parsedArgs.agent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::usage
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:96
 * @route '/api/v1/widget/analytics/usage/{agent}'
 */
usage.get = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\Widget\AnalyticsController::usage
 * @see app/Http/Controllers/Api/Widget/AnalyticsController.php:96
 * @route '/api/v1/widget/analytics/usage/{agent}'
 */
usage.head = (args: { agent: string | number } | [agent: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: usage.url(args, options),
    method: 'head',
})
const analytics = {
    summary: Object.assign(summary, summary),
usage: Object.assign(usage, usage),
}

export default analytics