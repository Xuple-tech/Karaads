import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import legal from './legal'
import agents from './agents'
import api from './api'
/**
 * @see routes/docs.php:18
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
 * @see routes/docs.php:18
 * @route '/docs'
 */
main.url = (options?: RouteQueryOptions) => {
    return main.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:18
 * @route '/docs'
 */
main.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: main.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:18
 * @route '/docs'
 */
main.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: main.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:34
 * @route '/docs/developer-api'
 */
export const developerApi = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: developerApi.url(options),
    method: 'get',
})

developerApi.definition = {
    methods: ["get","head"],
    url: '/docs/developer-api',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:34
 * @route '/docs/developer-api'
 */
developerApi.url = (options?: RouteQueryOptions) => {
    return developerApi.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:34
 * @route '/docs/developer-api'
 */
developerApi.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: developerApi.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:34
 * @route '/docs/developer-api'
 */
developerApi.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: developerApi.url(options),
    method: 'head',
})
const docs = {
    main: Object.assign(main, main),
legal: Object.assign(legal, legal),
agents: Object.assign(agents, agents),
developerApi: Object.assign(developerApi, developerApi),
api: Object.assign(api, api),
}

export default docs