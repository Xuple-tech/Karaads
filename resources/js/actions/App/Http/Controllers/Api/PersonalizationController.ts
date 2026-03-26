import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
const getPreferences23ff78cc068e61bf4c24ae8154e6df43 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences23ff78cc068e61bf4c24ae8154e6df43.url(options),
    method: 'get',
})

getPreferences23ff78cc068e61bf4c24ae8154e6df43.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences23ff78cc068e61bf4c24ae8154e6df43.url = (options?: RouteQueryOptions) => {
    return getPreferences23ff78cc068e61bf4c24ae8154e6df43.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences23ff78cc068e61bf4c24ae8154e6df43.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences23ff78cc068e61bf4c24ae8154e6df43.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/personalization'
*/
getPreferences23ff78cc068e61bf4c24ae8154e6df43.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPreferences23ff78cc068e61bf4c24ae8154e6df43.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
*/
const getPreferences885d5c14d51c0f6f1d8ffe980202cba8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences885d5c14d51c0f6f1d8ffe980202cba8.url(options),
    method: 'get',
})

getPreferences885d5c14d51c0f6f1d8ffe980202cba8.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
*/
getPreferences885d5c14d51c0f6f1d8ffe980202cba8.url = (options?: RouteQueryOptions) => {
    return getPreferences885d5c14d51c0f6f1d8ffe980202cba8.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
*/
getPreferences885d5c14d51c0f6f1d8ffe980202cba8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences885d5c14d51c0f6f1d8ffe980202cba8.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:21
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
*/
getPreferences885d5c14d51c0f6f1d8ffe980202cba8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPreferences885d5c14d51c0f6f1d8ffe980202cba8.url(options),
    method: 'head',
})

export const getPreferences = {
    '/api/settings/personalization': getPreferences23ff78cc068e61bf4c24ae8154e6df43,
    '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5': getPreferences885d5c14d51c0f6f1d8ffe980202cba8,
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
const updatePreferences23ff78cc068e61bf4c24ae8154e6df43 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences23ff78cc068e61bf4c24ae8154e6df43.url(options),
    method: 'put',
})

updatePreferences23ff78cc068e61bf4c24ae8154e6df43.definition = {
    methods: ["put"],
    url: '/api/settings/personalization',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
updatePreferences23ff78cc068e61bf4c24ae8154e6df43.url = (options?: RouteQueryOptions) => {
    return updatePreferences23ff78cc068e61bf4c24ae8154e6df43.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/personalization'
*/
updatePreferences23ff78cc068e61bf4c24ae8154e6df43.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences23ff78cc068e61bf4c24ae8154e6df43.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
*/
const updatePreferencesd507e799af8b8d26c156d38e609781de = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferencesd507e799af8b8d26c156d38e609781de.url(options),
    method: 'put',
})

updatePreferencesd507e799af8b8d26c156d38e609781de.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
*/
updatePreferencesd507e799af8b8d26c156d38e609781de.url = (options?: RouteQueryOptions) => {
    return updatePreferencesd507e799af8b8d26c156d38e609781de.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::updatePreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:91
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
*/
updatePreferencesd507e799af8b8d26c156d38e609781de.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferencesd507e799af8b8d26c156d38e609781de.url(options),
    method: 'put',
})

export const updatePreferences = {
    '/api/settings/personalization': updatePreferences23ff78cc068e61bf4c24ae8154e6df43,
    '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7': updatePreferencesd507e799af8b8d26c156d38e609781de,
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
const resetPreferences49ae6a56a97f5992540a9c9e6f1f798a = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.url(options),
    method: 'post',
})

resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.definition = {
    methods: ["post"],
    url: '/api/settings/personalization/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.url = (options?: RouteQueryOptions) => {
    return resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/personalization/reset'
*/
resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences49ae6a56a97f5992540a9c9e6f1f798a.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
*/
const resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.url(options),
    method: 'post',
})

resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.definition = {
    methods: ["post"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
*/
resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.url = (options?: RouteQueryOptions) => {
    return resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::resetPreferences
* @see app/Http/Controllers/Api/PersonalizationController.php:279
* @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
*/
resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e.url(options),
    method: 'post',
})

export const resetPreferences = {
    '/api/settings/personalization/reset': resetPreferences49ae6a56a97f5992540a9c9e6f1f798a,
    '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9': resetPreferencesf9c0a25f57a1ffa74abeb5b3af51ec1e,
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
const getTemplates72d36ccb64546691b5bea46b94387b21 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates72d36ccb64546691b5bea46b94387b21.url(options),
    method: 'get',
})

getTemplates72d36ccb64546691b5bea46b94387b21.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates72d36ccb64546691b5bea46b94387b21.url = (options?: RouteQueryOptions) => {
    return getTemplates72d36ccb64546691b5bea46b94387b21.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates72d36ccb64546691b5bea46b94387b21.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates72d36ccb64546691b5bea46b94387b21.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/personalization/templates'
*/
getTemplates72d36ccb64546691b5bea46b94387b21.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates72d36ccb64546691b5bea46b94387b21.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
*/
const getTemplates664b5dd62d89a3e97776fddfab21aaa4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates664b5dd62d89a3e97776fddfab21aaa4.url(options),
    method: 'get',
})

getTemplates664b5dd62d89a3e97776fddfab21aaa4.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
*/
getTemplates664b5dd62d89a3e97776fddfab21aaa4.url = (options?: RouteQueryOptions) => {
    return getTemplates664b5dd62d89a3e97776fddfab21aaa4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
*/
getTemplates664b5dd62d89a3e97776fddfab21aaa4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTemplates664b5dd62d89a3e97776fddfab21aaa4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getTemplates
* @see app/Http/Controllers/Api/PersonalizationController.php:188
* @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
*/
getTemplates664b5dd62d89a3e97776fddfab21aaa4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTemplates664b5dd62d89a3e97776fddfab21aaa4.url(options),
    method: 'head',
})

export const getTemplates = {
    '/api/settings/personalization/templates': getTemplates72d36ccb64546691b5bea46b94387b21,
    '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1': getTemplates664b5dd62d89a3e97776fddfab21aaa4,
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
const getAiModesa13e45e611a80795904793f6e9aae3d8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModesa13e45e611a80795904793f6e9aae3d8.url(options),
    method: 'get',
})

getAiModesa13e45e611a80795904793f6e9aae3d8.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModesa13e45e611a80795904793f6e9aae3d8.url = (options?: RouteQueryOptions) => {
    return getAiModesa13e45e611a80795904793f6e9aae3d8.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModesa13e45e611a80795904793f6e9aae3d8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModesa13e45e611a80795904793f6e9aae3d8.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/personalization/ai-modes'
*/
getAiModesa13e45e611a80795904793f6e9aae3d8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiModesa13e45e611a80795904793f6e9aae3d8.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
*/
const getAiModesee5439517a31aec63e8e0f94185ca1e7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModesee5439517a31aec63e8e0f94185ca1e7.url(options),
    method: 'get',
})

getAiModesee5439517a31aec63e8e0f94185ca1e7.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
*/
getAiModesee5439517a31aec63e8e0f94185ca1e7.url = (options?: RouteQueryOptions) => {
    return getAiModesee5439517a31aec63e8e0f94185ca1e7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
*/
getAiModesee5439517a31aec63e8e0f94185ca1e7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAiModesee5439517a31aec63e8e0f94185ca1e7.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getAiModes
* @see app/Http/Controllers/Api/PersonalizationController.php:210
* @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
*/
getAiModesee5439517a31aec63e8e0f94185ca1e7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAiModesee5439517a31aec63e8e0f94185ca1e7.url(options),
    method: 'head',
})

export const getAiModes = {
    '/api/settings/personalization/ai-modes': getAiModesa13e45e611a80795904793f6e9aae3d8,
    '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3': getAiModesee5439517a31aec63e8e0f94185ca1e7,
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
const getDescriptionse3fe2652fbddbfb299131655b4053bd2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptionse3fe2652fbddbfb299131655b4053bd2.url(options),
    method: 'get',
})

getDescriptionse3fe2652fbddbfb299131655b4053bd2.definition = {
    methods: ["get","head"],
    url: '/api/settings/personalization/descriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptionse3fe2652fbddbfb299131655b4053bd2.url = (options?: RouteQueryOptions) => {
    return getDescriptionse3fe2652fbddbfb299131655b4053bd2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptionse3fe2652fbddbfb299131655b4053bd2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptionse3fe2652fbddbfb299131655b4053bd2.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/personalization/descriptions'
*/
getDescriptionse3fe2652fbddbfb299131655b4053bd2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDescriptionse3fe2652fbddbfb299131655b4053bd2.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
*/
const getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.url(options),
    method: 'get',
})

getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
*/
getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.url = (options?: RouteQueryOptions) => {
    return getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
*/
getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::getDescriptions
* @see app/Http/Controllers/Api/PersonalizationController.php:231
* @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
*/
getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3.url(options),
    method: 'head',
})

export const getDescriptions = {
    '/api/settings/personalization/descriptions': getDescriptionse3fe2652fbddbfb299131655b4053bd2,
    '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5': getDescriptionsf043ebbbdc4410bfe19e5cfa542005e3,
}

const PersonalizationController = { getPreferences, updatePreferences, resetPreferences, getTemplates, getAiModes, getDescriptions }

export default PersonalizationController