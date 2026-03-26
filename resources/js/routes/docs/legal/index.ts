import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
 * @see routes/docs.php:21
 * @route '/docs/legal/terms'
 */
export const terms = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terms.url(options),
    method: 'get',
})

terms.definition = {
    methods: ["get","head"],
    url: '/docs/legal/terms',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:21
 * @route '/docs/legal/terms'
 */
terms.url = (options?: RouteQueryOptions) => {
    return terms.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:21
 * @route '/docs/legal/terms'
 */
terms.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terms.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:21
 * @route '/docs/legal/terms'
 */
terms.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: terms.url(options),
    method: 'head',
})

/**
 * @see routes/docs.php:22
 * @route '/docs/legal/privacy-policy'
 */
export const privacy_policy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy_policy.url(options),
    method: 'get',
})

privacy_policy.definition = {
    methods: ["get","head"],
    url: '/docs/legal/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/docs.php:22
 * @route '/docs/legal/privacy-policy'
 */
privacy_policy.url = (options?: RouteQueryOptions) => {
    return privacy_policy.definition.url + queryParams(options)
}

/**
 * @see routes/docs.php:22
 * @route '/docs/legal/privacy-policy'
 */
privacy_policy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy_policy.url(options),
    method: 'get',
})
/**
 * @see routes/docs.php:22
 * @route '/docs/legal/privacy-policy'
 */
privacy_policy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacy_policy.url(options),
    method: 'head',
})
const legal = {
    terms: Object.assign(terms, terms),
privacy_policy: Object.assign(privacy_policy, privacy_policy),
}

export default legal