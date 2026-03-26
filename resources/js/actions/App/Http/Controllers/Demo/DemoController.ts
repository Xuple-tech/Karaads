import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Demo\DemoController::index
 * @see app/Http/Controllers/Demo/DemoController.php:15
 * @route '/demo'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/demo',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Demo\DemoController::index
 * @see app/Http/Controllers/Demo/DemoController.php:15
 * @route '/demo'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Demo\DemoController::index
 * @see app/Http/Controllers/Demo/DemoController.php:15
 * @route '/demo'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Demo\DemoController::index
 * @see app/Http/Controllers/Demo/DemoController.php:15
 * @route '/demo'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Demo\DemoController::show
 * @see app/Http/Controllers/Demo/DemoController.php:47
 * @route '/demo/agent/{agent}'
 */
export const show = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/demo/agent/{agent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Demo\DemoController::show
 * @see app/Http/Controllers/Demo/DemoController.php:47
 * @route '/demo/agent/{agent}'
 */
show.url = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\Demo\DemoController::show
 * @see app/Http/Controllers/Demo/DemoController.php:47
 * @route '/demo/agent/{agent}'
 */
show.get = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Demo\DemoController::show
 * @see app/Http/Controllers/Demo/DemoController.php:47
 * @route '/demo/agent/{agent}'
 */
show.head = (args: { agent: string | number | { id: string | number } } | [agent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Demo\DemoController::preview
 * @see app/Http/Controllers/Demo/DemoController.php:66
 * @route '/demo/preview/{widgetSetting}'
 */
export const preview = (args: { widgetSetting: string | number | { id: string | number } } | [widgetSetting: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/demo/preview/{widgetSetting}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Demo\DemoController::preview
 * @see app/Http/Controllers/Demo/DemoController.php:66
 * @route '/demo/preview/{widgetSetting}'
 */
preview.url = (args: { widgetSetting: string | number | { id: string | number } } | [widgetSetting: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { widgetSetting: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { widgetSetting: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    widgetSetting: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        widgetSetting: typeof args.widgetSetting === 'object'
                ? args.widgetSetting.id
                : args.widgetSetting,
                }

    return preview.definition.url
            .replace('{widgetSetting}', parsedArgs.widgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Demo\DemoController::preview
 * @see app/Http/Controllers/Demo/DemoController.php:66
 * @route '/demo/preview/{widgetSetting}'
 */
preview.get = (args: { widgetSetting: string | number | { id: string | number } } | [widgetSetting: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Demo\DemoController::preview
 * @see app/Http/Controllers/Demo/DemoController.php:66
 * @route '/demo/preview/{widgetSetting}'
 */
preview.head = (args: { widgetSetting: string | number | { id: string | number } } | [widgetSetting: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})
const DemoController = { index, show, preview }

export default DemoController