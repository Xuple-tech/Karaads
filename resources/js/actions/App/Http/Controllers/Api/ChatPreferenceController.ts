import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api/settings/chat-preferences'
*/
const getPreferences6dba80dbb3b41c2e5d10e59867bdfa94 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.url(options),
    method: 'get',
})

getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.definition = {
    methods: ["get","head"],
    url: '/api/settings/chat-preferences',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api/settings/chat-preferences'
*/
getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.url = (options?: RouteQueryOptions) => {
    return getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api/settings/chat-preferences'
*/
getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api/settings/chat-preferences'
*/
getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPreferences6dba80dbb3b41c2e5d10e59867bdfa94.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api-/_0001/user/chat-preferences'
*/
const getPreferences013426c2e0f8b5e555d64b2322eb3d73 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences013426c2e0f8b5e555d64b2322eb3d73.url(options),
    method: 'get',
})

getPreferences013426c2e0f8b5e555d64b2322eb3d73.definition = {
    methods: ["get","head"],
    url: '/api-/_0001/user/chat-preferences',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api-/_0001/user/chat-preferences'
*/
getPreferences013426c2e0f8b5e555d64b2322eb3d73.url = (options?: RouteQueryOptions) => {
    return getPreferences013426c2e0f8b5e555d64b2322eb3d73.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api-/_0001/user/chat-preferences'
*/
getPreferences013426c2e0f8b5e555d64b2322eb3d73.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getPreferences013426c2e0f8b5e555d64b2322eb3d73.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:17
* @route '/api-/_0001/user/chat-preferences'
*/
getPreferences013426c2e0f8b5e555d64b2322eb3d73.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getPreferences013426c2e0f8b5e555d64b2322eb3d73.url(options),
    method: 'head',
})

export const getPreferences = {
    '/api/settings/chat-preferences': getPreferences6dba80dbb3b41c2e5d10e59867bdfa94,
    '/api-/_0001/user/chat-preferences': getPreferences013426c2e0f8b5e555d64b2322eb3d73,
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api/settings/chat-preferences'
*/
const updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.url(options),
    method: 'put',
})

updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.definition = {
    methods: ["put"],
    url: '/api/settings/chat-preferences',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api/settings/chat-preferences'
*/
updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.url = (options?: RouteQueryOptions) => {
    return updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api/settings/chat-preferences'
*/
updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api-/_0001/user/chat-preferences'
*/
const updatePreferences013426c2e0f8b5e555d64b2322eb3d73 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences013426c2e0f8b5e555d64b2322eb3d73.url(options),
    method: 'put',
})

updatePreferences013426c2e0f8b5e555d64b2322eb3d73.definition = {
    methods: ["put"],
    url: '/api-/_0001/user/chat-preferences',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api-/_0001/user/chat-preferences'
*/
updatePreferences013426c2e0f8b5e555d64b2322eb3d73.url = (options?: RouteQueryOptions) => {
    return updatePreferences013426c2e0f8b5e555d64b2322eb3d73.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::updatePreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:53
* @route '/api-/_0001/user/chat-preferences'
*/
updatePreferences013426c2e0f8b5e555d64b2322eb3d73.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePreferences013426c2e0f8b5e555d64b2322eb3d73.url(options),
    method: 'put',
})

export const updatePreferences = {
    '/api/settings/chat-preferences': updatePreferences6dba80dbb3b41c2e5d10e59867bdfa94,
    '/api-/_0001/user/chat-preferences': updatePreferences013426c2e0f8b5e555d64b2322eb3d73,
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api/settings/chat-preferences/reset'
*/
const resetPreferences5f2c749028eb361073ccb4000459a87e = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences5f2c749028eb361073ccb4000459a87e.url(options),
    method: 'post',
})

resetPreferences5f2c749028eb361073ccb4000459a87e.definition = {
    methods: ["post"],
    url: '/api/settings/chat-preferences/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api/settings/chat-preferences/reset'
*/
resetPreferences5f2c749028eb361073ccb4000459a87e.url = (options?: RouteQueryOptions) => {
    return resetPreferences5f2c749028eb361073ccb4000459a87e.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api/settings/chat-preferences/reset'
*/
resetPreferences5f2c749028eb361073ccb4000459a87e.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences5f2c749028eb361073ccb4000459a87e.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api-/_0001/user/chat-preferences/reset'
*/
const resetPreferences5a49a72b79732730c8e4acc8d0e80ebc = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.url(options),
    method: 'post',
})

resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.definition = {
    methods: ["post"],
    url: '/api-/_0001/user/chat-preferences/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api-/_0001/user/chat-preferences/reset'
*/
resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.url = (options?: RouteQueryOptions) => {
    return resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::resetPreferences
* @see app/Http/Controllers/Api/ChatPreferenceController.php:127
* @route '/api-/_0001/user/chat-preferences/reset'
*/
resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPreferences5a49a72b79732730c8e4acc8d0e80ebc.url(options),
    method: 'post',
})

export const resetPreferences = {
    '/api/settings/chat-preferences/reset': resetPreferences5f2c749028eb361073ccb4000459a87e,
    '/api-/_0001/user/chat-preferences/reset': resetPreferences5a49a72b79732730c8e4acc8d0e80ebc,
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api/settings/chat-modes'
*/
const getAvailableModes556d0496ba422335e2ddb618f588ab28 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableModes556d0496ba422335e2ddb618f588ab28.url(options),
    method: 'get',
})

getAvailableModes556d0496ba422335e2ddb618f588ab28.definition = {
    methods: ["get","head"],
    url: '/api/settings/chat-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api/settings/chat-modes'
*/
getAvailableModes556d0496ba422335e2ddb618f588ab28.url = (options?: RouteQueryOptions) => {
    return getAvailableModes556d0496ba422335e2ddb618f588ab28.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api/settings/chat-modes'
*/
getAvailableModes556d0496ba422335e2ddb618f588ab28.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableModes556d0496ba422335e2ddb618f588ab28.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api/settings/chat-modes'
*/
getAvailableModes556d0496ba422335e2ddb618f588ab28.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAvailableModes556d0496ba422335e2ddb618f588ab28.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api-/_0001/user/chat-modes'
*/
const getAvailableModes20df67ad14347ae1f1f1319fe1d10647 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableModes20df67ad14347ae1f1f1319fe1d10647.url(options),
    method: 'get',
})

getAvailableModes20df67ad14347ae1f1f1319fe1d10647.definition = {
    methods: ["get","head"],
    url: '/api-/_0001/user/chat-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api-/_0001/user/chat-modes'
*/
getAvailableModes20df67ad14347ae1f1f1319fe1d10647.url = (options?: RouteQueryOptions) => {
    return getAvailableModes20df67ad14347ae1f1f1319fe1d10647.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api-/_0001/user/chat-modes'
*/
getAvailableModes20df67ad14347ae1f1f1319fe1d10647.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getAvailableModes20df67ad14347ae1f1f1319fe1d10647.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::getAvailableModes
* @see app/Http/Controllers/Api/ChatPreferenceController.php:100
* @route '/api-/_0001/user/chat-modes'
*/
getAvailableModes20df67ad14347ae1f1f1319fe1d10647.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getAvailableModes20df67ad14347ae1f1f1319fe1d10647.url(options),
    method: 'head',
})

export const getAvailableModes = {
    '/api/settings/chat-modes': getAvailableModes556d0496ba422335e2ddb618f588ab28,
    '/api-/_0001/user/chat-modes': getAvailableModes20df67ad14347ae1f1f1319fe1d10647,
}

const ChatPreferenceController = { getPreferences, updatePreferences, resetPreferences, getAvailableModes }

export default ChatPreferenceController