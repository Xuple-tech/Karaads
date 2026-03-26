import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StripeWebhookController::handleWebhook
* @see app/Http/Controllers/StripeWebhookController.php:23
* @route '/stripe/webhook'
*/
export const handleWebhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleWebhook.url(options),
    method: 'post',
})

handleWebhook.definition = {
    methods: ["post"],
    url: '/stripe/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::handleWebhook
* @see app/Http/Controllers/StripeWebhookController.php:23
* @route '/stripe/webhook'
*/
handleWebhook.url = (options?: RouteQueryOptions) => {
    return handleWebhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::handleWebhook
* @see app/Http/Controllers/StripeWebhookController.php:23
* @route '/stripe/webhook'
*/
handleWebhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleWebhook.url(options),
    method: 'post',
})

const StripeWebhookController = { handleWebhook }

export default StripeWebhookController