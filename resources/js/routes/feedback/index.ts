import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:155
 * @route '/a/feedback/sms'
 */
export const sms = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sms.url(options),
    method: 'post',
})

sms.definition = {
    methods: ["post"],
    url: '/a/feedback/sms',
} satisfies RouteDefinition<["post"]>

/**
 * @see routes/web.php:155
 * @route '/a/feedback/sms'
 */
sms.url = (options?: RouteQueryOptions) => {
    return sms.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:155
 * @route '/a/feedback/sms'
 */
sms.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sms.url(options),
    method: 'post',
})
const feedback = {
    sms: Object.assign(sms, sms),
}

export default feedback