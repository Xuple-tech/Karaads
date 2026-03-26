import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import legal from './legal'
import agents from './agents'
import subscription from './subscription'
/**
* @see \App\Http\Controllers\Docs\MainController::main
* @see app/Http/Controllers/Docs/MainController.php:11
* @route '/docs'
*/
export const main = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: main.url(options),
    method: 'get',
})

main.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Docs\MainController::main
* @see app/Http/Controllers/Docs/MainController.php:11
* @route '/docs'
*/
main.url = (options?: RouteQueryOptions) => {
    return main.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Docs\MainController::main
* @see app/Http/Controllers/Docs/MainController.php:11
* @route '/docs'
*/
main.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: main.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Docs\MainController::main
* @see app/Http/Controllers/Docs/MainController.php:11
* @route '/docs'
*/
main.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: main.url(options),
    method: 'head',
})

const docs = {
    main: Object.assign(main, main),
    legal: Object.assign(legal, legal),
    agents: Object.assign(agents, agents),
    subscription: Object.assign(subscription, subscription),
}

export default docs