import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import paymentMethod from './payment-method'
/**
* @see \App\Http\Controllers\StripeWebhookController::webhook
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/stripe/webhook'
 */
export const webhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

webhook.definition = {
    methods: ["post"],
    url: '/stripe/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeWebhookController::webhook
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/stripe/webhook'
 */
webhook.url = (options?: RouteQueryOptions) => {
    return webhook.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeWebhookController::webhook
 * @see app/Http/Controllers/StripeWebhookController.php:24
 * @route '/stripe/webhook'
 */
webhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: webhook.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::checkout
 * @see app/Http/Controllers/StripePaymentController.php:26
 * @route '/stripe/checkout'
 */
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkout.url(options),
    method: 'get',
})

checkout.definition = {
    methods: ["get","head"],
    url: '/stripe/checkout',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripePaymentController::checkout
 * @see app/Http/Controllers/StripePaymentController.php:26
 * @route '/stripe/checkout'
 */
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::checkout
 * @see app/Http/Controllers/StripePaymentController.php:26
 * @route '/stripe/checkout'
 */
checkout.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkout.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StripePaymentController::checkout
 * @see app/Http/Controllers/StripePaymentController.php:26
 * @route '/stripe/checkout'
 */
checkout.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkout.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StripePaymentController::paymentIntent
 * @see app/Http/Controllers/StripePaymentController.php:47
 * @route '/stripe/payment-intent'
 */
export const paymentIntent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: paymentIntent.url(options),
    method: 'post',
})

paymentIntent.definition = {
    methods: ["post"],
    url: '/stripe/payment-intent',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::paymentIntent
 * @see app/Http/Controllers/StripePaymentController.php:47
 * @route '/stripe/payment-intent'
 */
paymentIntent.url = (options?: RouteQueryOptions) => {
    return paymentIntent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::paymentIntent
 * @see app/Http/Controllers/StripePaymentController.php:47
 * @route '/stripe/payment-intent'
 */
paymentIntent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: paymentIntent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::confirmSubscription
 * @see app/Http/Controllers/StripePaymentController.php:95
 * @route '/stripe/confirm-subscription'
 */
export const confirmSubscription = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmSubscription.url(options),
    method: 'post',
})

confirmSubscription.definition = {
    methods: ["post"],
    url: '/stripe/confirm-subscription',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::confirmSubscription
 * @see app/Http/Controllers/StripePaymentController.php:95
 * @route '/stripe/confirm-subscription'
 */
confirmSubscription.url = (options?: RouteQueryOptions) => {
    return confirmSubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::confirmSubscription
 * @see app/Http/Controllers/StripePaymentController.php:95
 * @route '/stripe/confirm-subscription'
 */
confirmSubscription.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmSubscription.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::paymentMethods
 * @see app/Http/Controllers/StripePaymentController.php:179
 * @route '/stripe/payment-methods'
 */
export const paymentMethods = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: paymentMethods.url(options),
    method: 'get',
})

paymentMethods.definition = {
    methods: ["get","head"],
    url: '/stripe/payment-methods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripePaymentController::paymentMethods
 * @see app/Http/Controllers/StripePaymentController.php:179
 * @route '/stripe/payment-methods'
 */
paymentMethods.url = (options?: RouteQueryOptions) => {
    return paymentMethods.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::paymentMethods
 * @see app/Http/Controllers/StripePaymentController.php:179
 * @route '/stripe/payment-methods'
 */
paymentMethods.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: paymentMethods.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StripePaymentController::paymentMethods
 * @see app/Http/Controllers/StripePaymentController.php:179
 * @route '/stripe/payment-methods'
 */
paymentMethods.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: paymentMethods.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StripePaymentController::cancel
 * @see app/Http/Controllers/StripePaymentController.php:245
 * @route '/stripe/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/stripe/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::cancel
 * @see app/Http/Controllers/StripePaymentController.php:245
 * @route '/stripe/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::cancel
 * @see app/Http/Controllers/StripePaymentController.php:245
 * @route '/stripe/cancel'
 */
cancel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::reactivate
 * @see app/Http/Controllers/StripePaymentController.php:289
 * @route '/stripe/reactivate'
 */
export const reactivate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(options),
    method: 'post',
})

reactivate.definition = {
    methods: ["post"],
    url: '/stripe/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::reactivate
 * @see app/Http/Controllers/StripePaymentController.php:289
 * @route '/stripe/reactivate'
 */
reactivate.url = (options?: RouteQueryOptions) => {
    return reactivate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::reactivate
 * @see app/Http/Controllers/StripePaymentController.php:289
 * @route '/stripe/reactivate'
 */
reactivate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::billingPortal
 * @see app/Http/Controllers/StripePaymentController.php:326
 * @route '/stripe/billing-portal'
 */
export const billingPortal = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billingPortal.url(options),
    method: 'get',
})

billingPortal.definition = {
    methods: ["get","head"],
    url: '/stripe/billing-portal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripePaymentController::billingPortal
 * @see app/Http/Controllers/StripePaymentController.php:326
 * @route '/stripe/billing-portal'
 */
billingPortal.url = (options?: RouteQueryOptions) => {
    return billingPortal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::billingPortal
 * @see app/Http/Controllers/StripePaymentController.php:326
 * @route '/stripe/billing-portal'
 */
billingPortal.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billingPortal.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StripePaymentController::billingPortal
 * @see app/Http/Controllers/StripePaymentController.php:326
 * @route '/stripe/billing-portal'
 */
billingPortal.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: billingPortal.url(options),
    method: 'head',
})
const stripe = {
    webhook: Object.assign(webhook, webhook),
checkout: Object.assign(checkout, checkout),
paymentIntent: Object.assign(paymentIntent, paymentIntent),
confirmSubscription: Object.assign(confirmSubscription, confirmSubscription),
paymentMethods: Object.assign(paymentMethods, paymentMethods),
paymentMethod: Object.assign(paymentMethod, paymentMethod),
cancel: Object.assign(cancel, cancel),
reactivate: Object.assign(reactivate, reactivate),
billingPortal: Object.assign(billingPortal, billingPortal),
}

export default stripe