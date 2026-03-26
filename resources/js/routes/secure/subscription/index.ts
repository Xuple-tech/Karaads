import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import agent from './agent'
import feature from './feature'
import tool from './tool'
/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::limits
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
export const limits = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: limits.url(options),
    method: 'get',
})

limits.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::limits
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
limits.url = (options?: RouteQueryOptions) => {
    return limits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::limits
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
limits.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: limits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::limits
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
limits.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: limits.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::features
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
export const features = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})

features.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::features
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
features.url = (options?: RouteQueryOptions) => {
    return features.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::features
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
features.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: features.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::features
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
features.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: features.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::tools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
export const tools = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

tools.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::tools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
tools.url = (options?: RouteQueryOptions) => {
    return tools.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::tools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
tools.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tools.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::tools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
tools.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tools.url(options),
    method: 'head',
})

const subscription = {
    limits: Object.assign(limits, limits),
    agent: Object.assign(agent, agent),
    tools: Object.assign(tools, tools),
    features: Object.assign(features, features),
    feature: Object.assign(feature, feature),
    tool: Object.assign(tool, tool),
}

export default subscription