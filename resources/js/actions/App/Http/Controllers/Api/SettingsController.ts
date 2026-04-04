import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SettingsController::updateProfile
 * @see app/Http/Controllers/Api/SettingsController.php:17
 * @route '/api/settings/profile'
 */
export const updateProfile = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfile.url(options),
    method: 'put',
})

updateProfile.definition = {
    methods: ["put"],
    url: '/api/settings/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::updateProfile
 * @see app/Http/Controllers/Api/SettingsController.php:17
 * @route '/api/settings/profile'
 */
updateProfile.url = (options?: RouteQueryOptions) => {
    return updateProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::updateProfile
 * @see app/Http/Controllers/Api/SettingsController.php:17
 * @route '/api/settings/profile'
 */
updateProfile.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfile.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::changePassword
 * @see app/Http/Controllers/Api/SettingsController.php:42
 * @route '/api/settings/password'
 */
export const changePassword = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: changePassword.url(options),
    method: 'put',
})

changePassword.definition = {
    methods: ["put"],
    url: '/api/settings/password',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::changePassword
 * @see app/Http/Controllers/Api/SettingsController.php:42
 * @route '/api/settings/password'
 */
changePassword.url = (options?: RouteQueryOptions) => {
    return changePassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::changePassword
 * @see app/Http/Controllers/Api/SettingsController.php:42
 * @route '/api/settings/password'
 */
changePassword.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: changePassword.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::getApiKeys
 * @see app/Http/Controllers/Api/SettingsController.php:80
 * @route '/api/settings/api-keys'
 */
export const getApiKeys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getApiKeys.url(options),
    method: 'get',
})

getApiKeys.definition = {
    methods: ["get","head"],
    url: '/api/settings/api-keys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::getApiKeys
 * @see app/Http/Controllers/Api/SettingsController.php:80
 * @route '/api/settings/api-keys'
 */
getApiKeys.url = (options?: RouteQueryOptions) => {
    return getApiKeys.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::getApiKeys
 * @see app/Http/Controllers/Api/SettingsController.php:80
 * @route '/api/settings/api-keys'
 */
getApiKeys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getApiKeys.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::getApiKeys
 * @see app/Http/Controllers/Api/SettingsController.php:80
 * @route '/api/settings/api-keys'
 */
getApiKeys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getApiKeys.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::addOllamaKey
 * @see app/Http/Controllers/Api/SettingsController.php:102
 * @route '/api/settings/api-keys/ollama'
 */
export const addOllamaKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addOllamaKey.url(options),
    method: 'post',
})

addOllamaKey.definition = {
    methods: ["post"],
    url: '/api/settings/api-keys/ollama',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::addOllamaKey
 * @see app/Http/Controllers/Api/SettingsController.php:102
 * @route '/api/settings/api-keys/ollama'
 */
addOllamaKey.url = (options?: RouteQueryOptions) => {
    return addOllamaKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::addOllamaKey
 * @see app/Http/Controllers/Api/SettingsController.php:102
 * @route '/api/settings/api-keys/ollama'
 */
addOllamaKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addOllamaKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::addOpenRouterKey
 * @see app/Http/Controllers/Api/SettingsController.php:133
 * @route '/api/settings/api-keys/openrouter'
 */
export const addOpenRouterKey = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addOpenRouterKey.url(options),
    method: 'post',
})

addOpenRouterKey.definition = {
    methods: ["post"],
    url: '/api/settings/api-keys/openrouter',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::addOpenRouterKey
 * @see app/Http/Controllers/Api/SettingsController.php:133
 * @route '/api/settings/api-keys/openrouter'
 */
addOpenRouterKey.url = (options?: RouteQueryOptions) => {
    return addOpenRouterKey.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::addOpenRouterKey
 * @see app/Http/Controllers/Api/SettingsController.php:133
 * @route '/api/settings/api-keys/openrouter'
 */
addOpenRouterKey.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: addOpenRouterKey.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::updateApiKeyStatus
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/api-keys/{type}/{id}/status'
 */
export const updateApiKeyStatus = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateApiKeyStatus.url(args, options),
    method: 'put',
})

updateApiKeyStatus.definition = {
    methods: ["put"],
    url: '/api/settings/api-keys/{type}/{id}/status',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::updateApiKeyStatus
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/api-keys/{type}/{id}/status'
 */
updateApiKeyStatus.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                id: args.id,
                }

    return updateApiKeyStatus.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::updateApiKeyStatus
 * @see app/Http/Controllers/Api/SettingsController.php:162
 * @route '/api/settings/api-keys/{type}/{id}/status'
 */
updateApiKeyStatus.put = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateApiKeyStatus.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteApiKey
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/api-keys/{type}/{id}'
 */
export const deleteApiKey = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteApiKey.url(args, options),
    method: 'delete',
})

deleteApiKey.definition = {
    methods: ["delete"],
    url: '/api/settings/api-keys/{type}/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteApiKey
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/api-keys/{type}/{id}'
 */
deleteApiKey.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    type: args[0],
                    id: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        type: args.type,
                                id: args.id,
                }

    return deleteApiKey.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::deleteApiKey
 * @see app/Http/Controllers/Api/SettingsController.php:191
 * @route '/api/settings/api-keys/{type}/{id}'
 */
deleteApiKey.delete = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteApiKey.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/ai-modes'
 */
export const getAiModes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModes.url(options),
    method: 'get',
})

getAiModes.definition = {
    methods: ["get","head"],
    url: '/api/settings/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/ai-modes'
 */
getAiModes.url = (options?: RouteQueryOptions) => {
    return getAiModes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/ai-modes'
 */
getAiModes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModes.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/ai-modes'
 */
getAiModes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiModes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/ai-preferences'
 */
export const getAiPreferences = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiPreferences.url(options),
    method: 'get',
})

getAiPreferences.definition = {
    methods: ["get","head"],
    url: '/api/settings/ai-preferences',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.url = (options?: RouteQueryOptions) => {
    return getAiPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiPreferences.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiPreferences.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::updateAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/ai-preferences'
 */
export const updateAiPreferences = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAiPreferences.url(options),
    method: 'put',
})

updateAiPreferences.definition = {
    methods: ["put"],
    url: '/api/settings/ai-preferences',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::updateAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/ai-preferences'
 */
updateAiPreferences.url = (options?: RouteQueryOptions) => {
    return updateAiPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::updateAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/ai-preferences'
 */
updateAiPreferences.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAiPreferences.url(options),
    method: 'put',
})
const SettingsController = { updateProfile, changePassword, getApiKeys, addOllamaKey, addOpenRouterKey, updateApiKeyStatus, deleteApiKey, getAiModes, getAiPreferences, updateAiPreferences }

export default SettingsController