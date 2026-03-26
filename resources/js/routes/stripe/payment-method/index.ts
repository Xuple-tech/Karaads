import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StripePaymentController::update
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/stripe/payment-method/update',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripePaymentController::update
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::update
* @see app/Http/Controllers/StripePaymentController.php:135
* @route '/stripe/payment-method/update'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripePaymentController::deleteMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
export const deleteMethod = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/stripe/payment-method/{paymentMethodId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\StripePaymentController::deleteMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
deleteMethod.url = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteMethod.definition.url
            .replace('{paymentMethodId}', parsedArgs.paymentMethodId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripePaymentController::deleteMethod
* @see app/Http/Controllers/StripePaymentController.php:216
* @route '/stripe/payment-method/{paymentMethodId}'
*/
deleteMethod.delete = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

const paymentMethod = {
    update: Object.assign(update, update),
    delete: Object.assign(deleteMethod, deleteMethod),
}

export default paymentMethod