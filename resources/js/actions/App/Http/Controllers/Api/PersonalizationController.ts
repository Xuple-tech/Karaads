import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
export const getPreferences = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences.url(options),
    method: 'get',
})

getPreferences.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences.url = (options?: RouteQueryOptions) => {
    return getPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPreferences.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
export const updatePreferences = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences.url(options),
    method: 'put',
})

updatePreferences.definition = {
    methods: ["put"],
    url: '/api/settings/personalization',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
updatePreferences.url = (options?: RouteQueryOptions) => {
    return updatePreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
updatePreferences.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
export const resetPreferences = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences.url(options),
    method: 'post',
})

resetPreferences.definition = {
    methods: ["post"],
    url: '/api/settings/personalization/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
resetPreferences.url = (options?: RouteQueryOptions) => {
    return resetPreferences.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
resetPreferences.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
export const getTemplates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates.url(options),
    method: 'get',
})

getTemplates.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates.url = (options?: RouteQueryOptions) => {
    return getTemplates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
export const getAiModes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModes.url(options),
    method: 'get',
})

getAiModes.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModes.url = (options?: RouteQueryOptions) => {
    return getAiModes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiModes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
export const getDescriptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptions.url(options),
    method: 'get',
})

getDescriptions.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/descriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptions.url = (options?: RouteQueryOptions) => {
    return getDescriptions.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptions.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDescriptions.url(options),
    method: 'head',
})

const PersonalizationController = { getPreferences, updatePreferences, resetPreferences, getTemplates, getAiModes, getDescriptions }

export default PersonalizationController