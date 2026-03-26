import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
const WidgetController = { embed }

export default WidgetController