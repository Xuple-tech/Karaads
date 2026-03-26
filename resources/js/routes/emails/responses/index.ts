import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MailController::send
 * @see app/Http/Controllers/MailController.php:528
 * @route '/api/emails/responses/{responseId}/send'
 */
export const send = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/emails/responses/{responseId}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MailController::send
 * @see app/Http/Controllers/MailController.php:528
 * @route '/api/emails/responses/{responseId}/send'
 */
send.url = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { responseId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    responseId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        responseId: args.responseId,
                }

    return send.definition.url
            .replace('{responseId}', parsedArgs.responseId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MailController::send
 * @see app/Http/Controllers/MailController.php:528
 * @route '/api/emails/responses/{responseId}/send'
 */
send.post = (args: { responseId: string | number } | [responseId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})
const responses = {
    send: Object.assign(send, send),
}

export default responses