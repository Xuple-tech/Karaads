import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import trial from './trial'
/**
* @see \App\Http\Controllers\SubscriptionController::pricing
* @see app/Http/Controllers/SubscriptionController.php:46
* @route '/subscription/pricing'
*/
export const pricing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pricing.url(options),
    method: 'get',
})

pricing.definition = {
    methods: ["get","head"],
    url: '/subscription/pricing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::pricing
* @see app/Http/Controllers/SubscriptionController.php:46
* @route '/subscription/pricing'
*/
pricing.url = (options?: RouteQueryOptions) => {
    return pricing.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::pricing
* @see app/Http/Controllers/SubscriptionController.php:46
* @route '/subscription/pricing'
*/
pricing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pricing.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::pricing
* @see app/Http/Controllers/SubscriptionController.php:46
* @route '/subscription/pricing'
*/
pricing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pricing.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::plans
* @see app/Http/Controllers/SubscriptionController.php:64
* @route '/api/subscription/plans'
*/
export const plans = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})

plans.definition = {
    methods: ["get","head"],
    url: '/api/subscription/plans',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::plans
* @see app/Http/Controllers/SubscriptionController.php:64
* @route '/api/subscription/plans'
*/
plans.url = (options?: RouteQueryOptions) => {
    return plans.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::plans
* @see app/Http/Controllers/SubscriptionController.php:64
* @route '/api/subscription/plans'
*/
plans.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: plans.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::plans
* @see app/Http/Controllers/SubscriptionController.php:64
* @route '/api/subscription/plans'
*/
plans.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: plans.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::success
* @see app/Http/Controllers/SubscriptionController.php:141
* @route '/subscription/success'
*/
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/subscription/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::success
* @see app/Http/Controllers/SubscriptionController.php:141
* @route '/subscription/success'
*/
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::success
* @see app/Http/Controllers/SubscriptionController.php:141
* @route '/subscription/success'
*/
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::success
* @see app/Http/Controllers/SubscriptionController.php:141
* @route '/subscription/success'
*/
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::index
* @see app/Http/Controllers/SubscriptionController.php:28
* @route '/subscription'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::index
* @see app/Http/Controllers/SubscriptionController.php:28
* @route '/subscription'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::index
* @see app/Http/Controllers/SubscriptionController.php:28
* @route '/subscription'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::index
* @see app/Http/Controllers/SubscriptionController.php:28
* @route '/subscription'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::mine
* @see app/Http/Controllers/SubscriptionController.php:83
* @route '/api/subscription/my-subscription'
*/
export const mine = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})

mine.definition = {
    methods: ["get","head"],
    url: '/api/subscription/my-subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::mine
* @see app/Http/Controllers/SubscriptionController.php:83
* @route '/api/subscription/my-subscription'
*/
mine.url = (options?: RouteQueryOptions) => {
    return mine.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::mine
* @see app/Http/Controllers/SubscriptionController.php:83
* @route '/api/subscription/my-subscription'
*/
mine.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mine.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::mine
* @see app/Http/Controllers/SubscriptionController.php:83
* @route '/api/subscription/my-subscription'
*/
mine.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mine.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SubscriptionController::upgrade
* @see app/Http/Controllers/SubscriptionController.php:105
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
* @see app/Http/Controllers/SubscriptionController.php:105
* @route '/api/subscription/upgrade'
*/
upgrade.url = (options?: RouteQueryOptions) => {
    return upgrade.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::upgrade
* @see app/Http/Controllers/SubscriptionController.php:105
* @route '/api/subscription/upgrade'
*/
upgrade.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upgrade.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
* @see app/Http/Controllers/SubscriptionController.php:212
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
* @see app/Http/Controllers/SubscriptionController.php:212
* @route '/api/subscription/downgrade'
*/
downgrade.url = (options?: RouteQueryOptions) => {
    return downgrade.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
* @see app/Http/Controllers/SubscriptionController.php:212
* @route '/api/subscription/downgrade'
*/
downgrade.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: downgrade.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::cancel
* @see app/Http/Controllers/SubscriptionController.php:245
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
* @see app/Http/Controllers/SubscriptionController.php:245
* @route '/api/subscription/cancel'
*/
cancel.url = (options?: RouteQueryOptions) => {
    return cancel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::cancel
* @see app/Http/Controllers/SubscriptionController.php:245
* @route '/api/subscription/cancel'
*/
cancel.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SubscriptionController::usage
* @see app/Http/Controllers/SubscriptionController.php:321
* @route '/api/subscription/usage-stats'
*/
export const usage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(options),
    method: 'get',
})

usage.definition = {
    methods: ["get","head"],
    url: '/api/subscription/usage-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::usage
* @see app/Http/Controllers/SubscriptionController.php:321
* @route '/api/subscription/usage-stats'
*/
usage.url = (options?: RouteQueryOptions) => {
    return usage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::usage
* @see app/Http/Controllers/SubscriptionController.php:321
* @route '/api/subscription/usage-stats'
*/
usage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: usage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\SubscriptionController::usage
* @see app/Http/Controllers/SubscriptionController.php:321
* @route '/api/subscription/usage-stats'
*/
usage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: usage.url(options),
    method: 'head',
})

const subscription = {
    pricing: Object.assign(pricing, pricing),
    plans: Object.assign(plans, plans),
    success: Object.assign(success, success),
    index: Object.assign(index, index),
    mine: Object.assign(mine, mine),
    upgrade: Object.assign(upgrade, upgrade),
    downgrade: Object.assign(downgrade, downgrade),
    cancel: Object.assign(cancel, cancel),
    trial: Object.assign(trial, trial),
    usage: Object.assign(usage, usage),
}

export default subscription