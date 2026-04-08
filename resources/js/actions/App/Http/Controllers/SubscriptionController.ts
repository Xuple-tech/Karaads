import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SubscriptionController::getPlans
 * @see app/Http/Controllers/SubscriptionController.php:47
 * @route '/api/subscription/plans'
 */
export const getPlans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPlans.url(options),
    method: 'get',
})

getPlans.definition = {
    methods: ["get","head"],
    url: '/api/subscription/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::getPlans
 * @see app/Http/Controllers/SubscriptionController.php:47
 * @route '/api/subscription/plans'
 */
getPlans.url = (options?: RouteQueryOptions) => {
    return getPlans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::getPlans
 * @see app/Http/Controllers/SubscriptionController.php:47
 * @route '/api/subscription/plans'
 */
getPlans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPlans.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::getPlans
 * @see app/Http/Controllers/SubscriptionController.php:47
 * @route '/api/subscription/plans'
 */
getPlans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPlans.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::handleCheckoutSuccess
 * @see app/Http/Controllers/SubscriptionController.php:135
 * @route '/subscription/success'
 */
export const handleCheckoutSuccess = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleCheckoutSuccess.url(options),
    method: 'get',
})

handleCheckoutSuccess.definition = {
    methods: ["get","head"],
    url: '/subscription/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::handleCheckoutSuccess
 * @see app/Http/Controllers/SubscriptionController.php:135
 * @route '/subscription/success'
 */
handleCheckoutSuccess.url = (options?: RouteQueryOptions) => {
    return handleCheckoutSuccess.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::handleCheckoutSuccess
 * @see app/Http/Controllers/SubscriptionController.php:135
 * @route '/subscription/success'
 */
handleCheckoutSuccess.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: handleCheckoutSuccess.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::handleCheckoutSuccess
 * @see app/Http/Controllers/SubscriptionController.php:135
 * @route '/subscription/success'
 */
handleCheckoutSuccess.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: handleCheckoutSuccess.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::getMySubscription
 * @see app/Http/Controllers/SubscriptionController.php:74
 * @route '/api/subscription/my-subscription'
 */
export const getMySubscription = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMySubscription.url(options),
    method: 'get',
})

getMySubscription.definition = {
    methods: ["get","head"],
    url: '/api/subscription/my-subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::getMySubscription
 * @see app/Http/Controllers/SubscriptionController.php:74
 * @route '/api/subscription/my-subscription'
 */
getMySubscription.url = (options?: RouteQueryOptions) => {
    return getMySubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::getMySubscription
 * @see app/Http/Controllers/SubscriptionController.php:74
 * @route '/api/subscription/my-subscription'
 */
getMySubscription.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMySubscription.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::getMySubscription
 * @see app/Http/Controllers/SubscriptionController.php:74
 * @route '/api/subscription/my-subscription'
 */
getMySubscription.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMySubscription.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::billingPortal
 * @see app/Http/Controllers/SubscriptionController.php:355
 * @route '/api/subscription/billing-portal'
 */
export const billingPortal = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billingPortal.url(options),
    method: 'get',
})

billingPortal.definition = {
    methods: ["get","head"],
    url: '/api/subscription/billing-portal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::billingPortal
 * @see app/Http/Controllers/SubscriptionController.php:355
 * @route '/api/subscription/billing-portal'
 */
billingPortal.url = (options?: RouteQueryOptions) => {
    return billingPortal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::billingPortal
 * @see app/Http/Controllers/SubscriptionController.php:355
 * @route '/api/subscription/billing-portal'
 */
billingPortal.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: billingPortal.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::billingPortal
 * @see app/Http/Controllers/SubscriptionController.php:355
 * @route '/api/subscription/billing-portal'
 */
billingPortal.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: billingPortal.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::upgrade
 * @see app/Http/Controllers/SubscriptionController.php:99
 * @route '/api/subscription/upgrade'
 */
export const upgrade = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upgrade.url(options),
    method: 'post',
})

upgrade.definition = {
    methods: ["post"],
    url: '/api/subscription/upgrade',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::upgrade
 * @see app/Http/Controllers/SubscriptionController.php:99
 * @route '/api/subscription/upgrade'
 */
upgrade.url = (options?: RouteQueryOptions) => {
    return upgrade.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::upgrade
 * @see app/Http/Controllers/SubscriptionController.php:99
 * @route '/api/subscription/upgrade'
 */
upgrade.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upgrade.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:206
 * @route '/api/subscription/downgrade'
 */
export const downgrade = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: downgrade.url(options),
    method: 'post',
})

downgrade.definition = {
    methods: ["post"],
    url: '/api/subscription/downgrade',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:206
 * @route '/api/subscription/downgrade'
 */
downgrade.url = (options?: RouteQueryOptions) => {
    return downgrade.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:206
 * @route '/api/subscription/downgrade'
 */
downgrade.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: downgrade.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::cancel
 * @see app/Http/Controllers/SubscriptionController.php:239
 * @route '/api/subscription/cancel'
 */
export const cancel = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/api/subscription/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::cancel
 * @see app/Http/Controllers/SubscriptionController.php:239
 * @route '/api/subscription/cancel'
 */
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::cancel
 * @see app/Http/Controllers/SubscriptionController.php:239
 * @route '/api/subscription/cancel'
 */
cancel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::startTrial
 * @see app/Http/Controllers/SubscriptionController.php:274
 * @route '/api/subscription/start-trial'
 */
export const startTrial = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startTrial.url(options),
    method: 'post',
})

startTrial.definition = {
    methods: ["post"],
    url: '/api/subscription/start-trial',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::startTrial
 * @see app/Http/Controllers/SubscriptionController.php:274
 * @route '/api/subscription/start-trial'
 */
startTrial.url = (options?: RouteQueryOptions) => {
    return startTrial.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::startTrial
 * @see app/Http/Controllers/SubscriptionController.php:274
 * @route '/api/subscription/start-trial'
 */
startTrial.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: startTrial.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::getUsageStats
 * @see app/Http/Controllers/SubscriptionController.php:315
 * @route '/api/subscription/usage-stats'
 */
export const getUsageStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUsageStats.url(options),
    method: 'get',
})

getUsageStats.definition = {
    methods: ["get","head"],
    url: '/api/subscription/usage-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::getUsageStats
 * @see app/Http/Controllers/SubscriptionController.php:315
 * @route '/api/subscription/usage-stats'
 */
getUsageStats.url = (options?: RouteQueryOptions) => {
    return getUsageStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::getUsageStats
 * @see app/Http/Controllers/SubscriptionController.php:315
 * @route '/api/subscription/usage-stats'
 */
getUsageStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUsageStats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::getUsageStats
 * @see app/Http/Controllers/SubscriptionController.php:315
 * @route '/api/subscription/usage-stats'
 */
getUsageStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getUsageStats.url(options),
    method: 'head',
})
const SubscriptionController = { getPlans, handleCheckoutSuccess, getMySubscription, billingPortal, upgrade, downgrade, cancel, startTrial, getUsageStats }

export default SubscriptionController