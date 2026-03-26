import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits'
*/
const showb9a1d5a1f6e07bfe831e1f9c4ce28876 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb9a1d5a1f6e07bfe831e1f9c4ce28876.url(options),
    method: 'get',
})

showb9a1d5a1f6e07bfe831e1f9c4ce28876.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits'
*/
showb9a1d5a1f6e07bfe831e1f9c4ce28876.url = (options?: RouteQueryOptions) => {
    return showb9a1d5a1f6e07bfe831e1f9c4ce28876.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits'
*/
showb9a1d5a1f6e07bfe831e1f9c4ce28876.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showb9a1d5a1f6e07bfe831e1f9c4ce28876.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits'
*/
showb9a1d5a1f6e07bfe831e1f9c4ce28876.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showb9a1d5a1f6e07bfe831e1f9c4ce28876.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
const show110be6ebb49a44d97067fdeb85d8b13a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show110be6ebb49a44d97067fdeb85d8b13a.url(options),
    method: 'get',
})

show110be6ebb49a44d97067fdeb85d8b13a.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
show110be6ebb49a44d97067fdeb85d8b13a.url = (options?: RouteQueryOptions) => {
    return show110be6ebb49a44d97067fdeb85d8b13a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
show110be6ebb49a44d97067fdeb85d8b13a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show110be6ebb49a44d97067fdeb85d8b13a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::show
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:23
* @route '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9'
*/
show110be6ebb49a44d97067fdeb85d8b13a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show110be6ebb49a44d97067fdeb85d8b13a.url(options),
    method: 'head',
})

export const show = {
    '/api/subscription/limits': showb9a1d5a1f6e07bfe831e1f9c4ce28876,
    '/api/subscription/limits/m8k1j4h7/show/g0f3d6s9': show110be6ebb49a44d97067fdeb85d8b13a,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/check-agent-creation'
*/
const checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.url(options),
    method: 'post',
})

checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.definition = {
    methods: ["post"],
    url: '/api/subscription/check-agent-creation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/check-agent-creation'
*/
checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.url = (options?: RouteQueryOptions) => {
    return checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/check-agent-creation'
*/
checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
*/
const checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.url(options),
    method: 'post',
})

checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
*/
checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.url = (options?: RouteQueryOptions) => {
    return checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentCreation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:55
* @route '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1'
*/
checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da.url(options),
    method: 'post',
})

export const checkAgentCreation = {
    '/api/subscription/check-agent-creation': checkAgentCreationf3d19c8d39ed696d4e28a745efd8cc19,
    '/api/subscription/limits/m8k1j4h7/check/agent/create/q2w5e8r1': checkAgentCreation4e63dcbd84449dfbb809dd40f32ff0da,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/check-agent-activation'
*/
const checkAgentActivation70269dc49a6bb69daa3630e69e707658 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentActivation70269dc49a6bb69daa3630e69e707658.url(options),
    method: 'post',
})

checkAgentActivation70269dc49a6bb69daa3630e69e707658.definition = {
    methods: ["post"],
    url: '/api/subscription/check-agent-activation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/check-agent-activation'
*/
checkAgentActivation70269dc49a6bb69daa3630e69e707658.url = (options?: RouteQueryOptions) => {
    return checkAgentActivation70269dc49a6bb69daa3630e69e707658.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/check-agent-activation'
*/
checkAgentActivation70269dc49a6bb69daa3630e69e707658.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentActivation70269dc49a6bb69daa3630e69e707658.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
*/
const checkAgentActivationc3f1ce1653e9352e7939f6604c12db83 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.url(options),
    method: 'post',
})

checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
*/
checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.url = (options?: RouteQueryOptions) => {
    return checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkAgentActivation
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:102
* @route '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3'
*/
checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkAgentActivationc3f1ce1653e9352e7939f6604c12db83.url(options),
    method: 'post',
})

export const checkAgentActivation = {
    '/api/subscription/check-agent-activation': checkAgentActivation70269dc49a6bb69daa3630e69e707658,
    '/api/subscription/limits/m8k1j4h7/check/agent/activate/t4y7u0i3': checkAgentActivationc3f1ce1653e9352e7939f6604c12db83,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/check-tools'
*/
const checkToolsUsaged37bc44eb763a071c462ae4349d4811d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkToolsUsaged37bc44eb763a071c462ae4349d4811d.url(options),
    method: 'post',
})

checkToolsUsaged37bc44eb763a071c462ae4349d4811d.definition = {
    methods: ["post"],
    url: '/api/subscription/check-tools',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/check-tools'
*/
checkToolsUsaged37bc44eb763a071c462ae4349d4811d.url = (options?: RouteQueryOptions) => {
    return checkToolsUsaged37bc44eb763a071c462ae4349d4811d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/check-tools'
*/
checkToolsUsaged37bc44eb763a071c462ae4349d4811d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkToolsUsaged37bc44eb763a071c462ae4349d4811d.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
*/
const checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.url(options),
    method: 'post',
})

checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.definition = {
    methods: ["post"],
    url: '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
*/
checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.url = (options?: RouteQueryOptions) => {
    return checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkToolsUsage
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:149
* @route '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5'
*/
checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70.url(options),
    method: 'post',
})

export const checkToolsUsage = {
    '/api/subscription/check-tools': checkToolsUsaged37bc44eb763a071c462ae4349d4811d,
    '/api/subscription/limits/m8k1j4h7/check/tools/usage/p6a9s2d5': checkToolsUsage9295ef4c2a9e28a835c62773b6f1ad70,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/features'
*/
const getFeaturesb0563a8b3113a322bef0779f0d07dea4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFeaturesb0563a8b3113a322bef0779f0d07dea4.url(options),
    method: 'get',
})

getFeaturesb0563a8b3113a322bef0779f0d07dea4.definition = {
    methods: ["get","head"],
    url: '/api/subscription/features',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/features'
*/
getFeaturesb0563a8b3113a322bef0779f0d07dea4.url = (options?: RouteQueryOptions) => {
    return getFeaturesb0563a8b3113a322bef0779f0d07dea4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/features'
*/
getFeaturesb0563a8b3113a322bef0779f0d07dea4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFeaturesb0563a8b3113a322bef0779f0d07dea4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/features'
*/
getFeaturesb0563a8b3113a322bef0779f0d07dea4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getFeaturesb0563a8b3113a322bef0779f0d07dea4.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
const getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.url(options),
    method: 'get',
})

getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.url = (options?: RouteQueryOptions) => {
    return getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getFeatures
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:222
* @route '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7'
*/
getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13.url(options),
    method: 'head',
})

export const getFeatures = {
    '/api/subscription/features': getFeaturesb0563a8b3113a322bef0779f0d07dea4,
    '/api/subscription/limits/m8k1j4h7/features/list/l8z1x4c7': getFeaturese60cd5d4bbe5ffca6c32af01f3d5ac13,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/features/{featureKey}'
*/
const checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522 = (args: { featureKey: string | number } | [featureKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.url(args, options),
    method: 'get',
})

checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.definition = {
    methods: ["get","head"],
    url: '/api/subscription/features/{featureKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/features/{featureKey}'
*/
checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.url = (args: { featureKey: string | number } | [featureKey: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { featureKey: args }
    }

    if (Array.isArray(args)) {
        args = {
            featureKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        featureKey: args.featureKey,
    }

    return checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.definition.url
            .replace('{featureKey}', parsedArgs.featureKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/features/{featureKey}'
*/
checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.get = (args: { featureKey: string | number } | [featureKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/features/{featureKey}'
*/
checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.head = (args: { featureKey: string | number } | [featureKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9'
*/
const checkFeature45837b3a6ad30fb231396c729946344f = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkFeature45837b3a6ad30fb231396c729946344f.url(args, options),
    method: 'get',
})

checkFeature45837b3a6ad30fb231396c729946344f.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9'
*/
checkFeature45837b3a6ad30fb231396c729946344f.url = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { key: args }
    }

    if (Array.isArray(args)) {
        args = {
            key: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        key: args.key,
    }

    return checkFeature45837b3a6ad30fb231396c729946344f.definition.url
            .replace('{key}', parsedArgs.key.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9'
*/
checkFeature45837b3a6ad30fb231396c729946344f.get = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkFeature45837b3a6ad30fb231396c729946344f.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkFeature
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:187
* @route '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9'
*/
checkFeature45837b3a6ad30fb231396c729946344f.head = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkFeature45837b3a6ad30fb231396c729946344f.url(args, options),
    method: 'head',
})

export const checkFeature = {
    '/api/subscription/features/{featureKey}': checkFeaturec13f7e6eee656dbc2fea5c3b9ca2e522,
    '/api/subscription/limits/m8k1j4h7/features/check/{key}/v0b3n6m9': checkFeature45837b3a6ad30fb231396c729946344f,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/tools'
*/
const getTools700a256215e3cbdf81f0d7b714dce1fc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTools700a256215e3cbdf81f0d7b714dce1fc.url(options),
    method: 'get',
})

getTools700a256215e3cbdf81f0d7b714dce1fc.definition = {
    methods: ["get","head"],
    url: '/api/subscription/tools',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/tools'
*/
getTools700a256215e3cbdf81f0d7b714dce1fc.url = (options?: RouteQueryOptions) => {
    return getTools700a256215e3cbdf81f0d7b714dce1fc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/tools'
*/
getTools700a256215e3cbdf81f0d7b714dce1fc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTools700a256215e3cbdf81f0d7b714dce1fc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/tools'
*/
getTools700a256215e3cbdf81f0d7b714dce1fc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTools700a256215e3cbdf81f0d7b714dce1fc.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
const getTools9de888812bcf2990c8aa564c39313311 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTools9de888812bcf2990c8aa564c39313311.url(options),
    method: 'get',
})

getTools9de888812bcf2990c8aa564c39313311.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
getTools9de888812bcf2990c8aa564c39313311.url = (options?: RouteQueryOptions) => {
    return getTools9de888812bcf2990c8aa564c39313311.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
getTools9de888812bcf2990c8aa564c39313311.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTools9de888812bcf2990c8aa564c39313311.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::getTools
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:262
* @route '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1'
*/
getTools9de888812bcf2990c8aa564c39313311.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTools9de888812bcf2990c8aa564c39313311.url(options),
    method: 'head',
})

export const getTools = {
    '/api/subscription/tools': getTools700a256215e3cbdf81f0d7b714dce1fc,
    '/api/subscription/limits/m8k1j4h7/tools/list/k2j5h8g1': getTools9de888812bcf2990c8aa564c39313311,
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/tools/{toolKey}'
*/
const checkToolb62724790cedf61f716085d5e81faa03 = (args: { toolKey: string | number } | [toolKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkToolb62724790cedf61f716085d5e81faa03.url(args, options),
    method: 'get',
})

checkToolb62724790cedf61f716085d5e81faa03.definition = {
    methods: ["get","head"],
    url: '/api/subscription/tools/{toolKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/tools/{toolKey}'
*/
checkToolb62724790cedf61f716085d5e81faa03.url = (args: { toolKey: string | number } | [toolKey: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { toolKey: args }
    }

    if (Array.isArray(args)) {
        args = {
            toolKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        toolKey: args.toolKey,
    }

    return checkToolb62724790cedf61f716085d5e81faa03.definition.url
            .replace('{toolKey}', parsedArgs.toolKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/tools/{toolKey}'
*/
checkToolb62724790cedf61f716085d5e81faa03.get = (args: { toolKey: string | number } | [toolKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkToolb62724790cedf61f716085d5e81faa03.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/tools/{toolKey}'
*/
checkToolb62724790cedf61f716085d5e81faa03.head = (args: { toolKey: string | number } | [toolKey: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkToolb62724790cedf61f716085d5e81faa03.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
const checkTool9d09c817ee7590cbb954ec9ab5100d60 = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkTool9d09c817ee7590cbb954ec9ab5100d60.url(args, options),
    method: 'get',
})

checkTool9d09c817ee7590cbb954ec9ab5100d60.definition = {
    methods: ["get","head"],
    url: '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
checkTool9d09c817ee7590cbb954ec9ab5100d60.url = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { key: args }
    }

    if (Array.isArray(args)) {
        args = {
            key: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        key: args.key,
    }

    return checkTool9d09c817ee7590cbb954ec9ab5100d60.definition.url
            .replace('{key}', parsedArgs.key.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
checkTool9d09c817ee7590cbb954ec9ab5100d60.get = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkTool9d09c817ee7590cbb954ec9ab5100d60.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SubscriptionLimitsController::checkTool
* @see app/Http/Controllers/Api/SubscriptionLimitsController.php:301
* @route '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3'
*/
checkTool9d09c817ee7590cbb954ec9ab5100d60.head = (args: { key: string | number } | [key: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkTool9d09c817ee7590cbb954ec9ab5100d60.url(args, options),
    method: 'head',
})

export const checkTool = {
    '/api/subscription/tools/{toolKey}': checkToolb62724790cedf61f716085d5e81faa03,
    '/api/subscription/limits/m8k1j4h7/tools/check/{key}/f4d7s0a3': checkTool9d09c817ee7590cbb954ec9ab5100d60,
}

const SubscriptionLimitsController = { show, checkAgentCreation, checkAgentActivation, checkToolsUsage, getFeatures, checkFeature, getTools, checkTool }

export default SubscriptionLimitsController