import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\StripePaymentController::createPaymentIntent
* @see app/Http/Controllers/StripePaymentController.php:47
* @route '/stripe/payment-intent'
*/
export const createPaymentIntent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createPaymentIntent.url(options),
    method: 'post',
})

createPaymentIntent.definition = {
    methods: ["post"],
    url: '/stripe/payment-intent',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::createPaymentIntent
* @see app/Http/Controllers/StripePaymentController.php:47
* @route '/stripe/payment-intent'
*/
createPaymentIntent.url = (options?: RouteQueryOptions) => {
    return createPaymentIntent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::createPaymentIntent
* @see app/Http/Controllers/StripePaymentController.php:47
* @route '/stripe/payment-intent'
*/
createPaymentIntent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createPaymentIntent.url(options),
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
* @see \App\Http\Controllers\StripePaymentController::getPaymentMethods
* @see app/Http/Controllers/StripePaymentController.php:179
* @route '/stripe/payment-methods'
*/
export const getPaymentMethods = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPaymentMethods.url(options),
    method: 'get',
})

getPaymentMethods.definition = {
    methods: ["get","head"],
    url: '/stripe/payment-methods',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripePaymentController::getPaymentMethods
* @see app/Http/Controllers/StripePaymentController.php:179
* @route '/stripe/payment-methods'
*/
getPaymentMethods.url = (options?: RouteQueryOptions) => {
    return getPaymentMethods.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::getPaymentMethods
* @see app/Http/Controllers/StripePaymentController.php:179
* @route '/stripe/payment-methods'
*/
getPaymentMethods.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPaymentMethods.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripePaymentController::getPaymentMethods
* @see app/Http/Controllers/StripePaymentController.php:179
* @route '/stripe/payment-methods'
*/
getPaymentMethods.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPaymentMethods.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StripePaymentController::updatePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
export const updatePaymentMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePaymentMethod.url(options),
    method: 'post',
})

updatePaymentMethod.definition = {
    methods: ["post"],
    url: '/stripe/payment-method/update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::updatePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
updatePaymentMethod.url = (options?: RouteQueryOptions) => {
    return updatePaymentMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::updatePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
updatePaymentMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePaymentMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::deletePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
export const deletePaymentMethod = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deletePaymentMethod.url(args, options),
    method: 'delete',
})

deletePaymentMethod.definition = {
    methods: ["delete"],
    url: '/stripe/payment-method/{paymentMethodId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\StripePaymentController::deletePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
deletePaymentMethod.url = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { paymentMethodId: args }
    }

    if (Array.isArray(args)) {
        args = {
            paymentMethodId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        paymentMethodId: args.paymentMethodId,
    }

    return deletePaymentMethod.definition.url
            .replace('{paymentMethodId}', parsedArgs.paymentMethodId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::deletePaymentMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
deletePaymentMethod.delete = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deletePaymentMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\StripePaymentController::cancelSubscription
* @see app/Http/Controllers/StripePaymentController.php:245
* @route '/stripe/cancel'
*/
export const cancelSubscription = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelSubscription.url(options),
    method: 'post',
})

cancelSubscription.definition = {
    methods: ["post"],
    url: '/stripe/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::cancelSubscription
* @see app/Http/Controllers/StripePaymentController.php:245
* @route '/stripe/cancel'
*/
cancelSubscription.url = (options?: RouteQueryOptions) => {
    return cancelSubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::cancelSubscription
* @see app/Http/Controllers/StripePaymentController.php:245
* @route '/stripe/cancel'
*/
cancelSubscription.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelSubscription.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::reactivateSubscription
* @see app/Http/Controllers/StripePaymentController.php:289
* @route '/stripe/reactivate'
*/
export const reactivateSubscription = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivateSubscription.url(options),
    method: 'post',
})

reactivateSubscription.definition = {
    methods: ["post"],
    url: '/stripe/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::reactivateSubscription
* @see app/Http/Controllers/StripePaymentController.php:289
* @route '/stripe/reactivate'
*/
reactivateSubscription.url = (options?: RouteQueryOptions) => {
    return reactivateSubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::reactivateSubscription
* @see app/Http/Controllers/StripePaymentController.php:289
* @route '/stripe/reactivate'
*/
reactivateSubscription.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivateSubscription.url(options),
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

const StripePaymentController = { checkout, createPaymentIntent, confirmSubscription, getPaymentMethods, updatePaymentMethod, deletePaymentMethod, cancelSubscription, reactivateSubscription, billingPortal }

export default StripePaymentController