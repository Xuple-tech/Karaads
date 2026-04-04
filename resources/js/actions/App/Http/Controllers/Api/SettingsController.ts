import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SettingsController::updateProfile
 * @see app/Http/Controllers/Api/SettingsController.php:15
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
 * @see app/Http/Controllers/Api/SettingsController.php:15
 * @route '/api/settings/profile'
 */
updateProfile.url = (options?: RouteQueryOptions) => {
    return updateProfile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::updateProfile
 * @see app/Http/Controllers/Api/SettingsController.php:15
 * @route '/api/settings/profile'
 */
updateProfile.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfile.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::changePassword
 * @see app/Http/Controllers/Api/SettingsController.php:40
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
 * @see app/Http/Controllers/Api/SettingsController.php:40
 * @route '/api/settings/password'
 */
changePassword.url = (options?: RouteQueryOptions) => {
    return changePassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::changePassword
 * @see app/Http/Controllers/Api/SettingsController.php:40
 * @route '/api/settings/password'
 */
changePassword.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: changePassword.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:81
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
 * @see app/Http/Controllers/Api/SettingsController.php:81
 * @route '/api/settings/ai-modes'
 */
getAiModes.url = (options?: RouteQueryOptions) => {
    return getAiModes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:81
 * @route '/api/settings/ai-modes'
 */
getAiModes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModes.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::getAiModes
 * @see app/Http/Controllers/Api/SettingsController.php:81
 * @route '/api/settings/ai-modes'
 */
getAiModes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiModes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:130
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
 * @see app/Http/Controllers/Api/SettingsController.php:130
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.url = (options?: RouteQueryOptions) => {
    return getAiPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:130
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiPreferences.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::getAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:130
 * @route '/api/settings/ai-preferences'
 */
getAiPreferences.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiPreferences.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::updateAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:102
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
 * @see app/Http/Controllers/Api/SettingsController.php:102
 * @route '/api/settings/ai-preferences'
 */
updateAiPreferences.url = (options?: RouteQueryOptions) => {
    return updateAiPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::updateAiPreferences
 * @see app/Http/Controllers/Api/SettingsController.php:102
 * @route '/api/settings/ai-preferences'
 */
updateAiPreferences.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateAiPreferences.url(options),
    method: 'put',
})
const SettingsController = { updateProfile, changePassword, getAiModes, getAiPreferences, updateAiPreferences }

export default SettingsController