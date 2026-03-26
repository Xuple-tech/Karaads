import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
 * @see routes/docs.php:35
 * @route '/docs/subscription'
 */
export const overview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})

overview.definition = {
    methods: ["get","head"],
    url: '/docs/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:35
 * @route '/docs/subscription'
 */
overview.url = (options?: RouteQueryOptions) => {
    return overview.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:35
 * @route '/docs/subscription'
 */
overview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overview.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:35
 * @route '/docs/subscription'
 */
overview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overview.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:38
 * @route '/docs/subscription/features'
 */
export const features = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})

features.definition = {
    methods: ["get","head"],
    url: '/docs/subscription/features',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:38
 * @route '/docs/subscription/features'
 */
features.url = (options?: RouteQueryOptions) => {
    return features.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:38
 * @route '/docs/subscription/features'
 */
features.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:38
 * @route '/docs/subscription/features'
 */
features.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: features.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:41
 * @route '/docs/subscription/faq'
 */
export const faq = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: faq.url(options),
    method: 'get',
})

faq.definition = {
    methods: ["get","head"],
    url: '/docs/subscription/faq',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:41
 * @route '/docs/subscription/faq'
 */
faq.url = (options?: RouteQueryOptions) => {
    return faq.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:41
 * @route '/docs/subscription/faq'
 */
faq.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: faq.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:41
 * @route '/docs/subscription/faq'
 */
faq.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: faq.url(options),
    method: 'head',
})
const subscription = {
    overview: Object.assign(overview, overview),
features: Object.assign(features, features),
faq: Object.assign(faq, faq),
}

export default subscription