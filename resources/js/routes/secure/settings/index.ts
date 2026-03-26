import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import apikey from './apikey'
import ai from './ai'
import chat from './chat'
import personal from './personal'
/**
* @see \App\Http\Controllers\Api\SettingsController::profile
* @see app/Http/Controllers/Api/SettingsController.php:18
* @route '/api/settings/mgmt/r4t7y0u3/profile/update/i6o9p2l5'
*/
export const profile = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: profile.url(options),
    method: 'put',
})

profile.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/profile/update/i6o9p2l5',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::profile
* @see app/Http/Controllers/Api/SettingsController.php:18
* @route '/api/settings/mgmt/r4t7y0u3/profile/update/i6o9p2l5'
*/
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::profile
* @see app/Http/Controllers/Api/SettingsController.php:18
* @route '/api/settings/mgmt/r4t7y0u3/profile/update/i6o9p2l5'
*/
profile.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: profile.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::password
* @see app/Http/Controllers/Api/SettingsController.php:43
* @route '/api/settings/mgmt/r4t7y0u3/password/change/h8j1k4z7'
*/
export const password = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: password.url(options),
    method: 'put',
})

password.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/password/change/h8j1k4z7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::password
* @see app/Http/Controllers/Api/SettingsController.php:43
* @route '/api/settings/mgmt/r4t7y0u3/password/change/h8j1k4z7'
*/
password.url = (options?: RouteQueryOptions) => {
    return password.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::password
* @see app/Http/Controllers/Api/SettingsController.php:43
* @route '/api/settings/mgmt/r4t7y0u3/password/change/h8j1k4z7'
*/
password.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: password.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::apikeys
* @see app/Http/Controllers/Api/SettingsController.php:81
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/list/g0f3d6s9'
*/
export const apikeys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apikeys.url(options),
    method: 'get',
})

apikeys.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/apikeys/list/g0f3d6s9',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::apikeys
* @see app/Http/Controllers/Api/SettingsController.php:81
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/list/g0f3d6s9'
*/
apikeys.url = (options?: RouteQueryOptions) => {
    return apikeys.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::apikeys
* @see app/Http/Controllers/Api/SettingsController.php:81
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/list/g0f3d6s9'
*/
apikeys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apikeys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::apikeys
* @see app/Http/Controllers/Api/SettingsController.php:81
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/list/g0f3d6s9'
*/
apikeys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: apikeys.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::ollama
* @see app/Http/Controllers/Api/SettingsController.php:134
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/ollama/t4y7u0i3'
*/
export const ollama = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ollama.url(options),
    method: 'post',
})

ollama.definition = {
    methods: ["post"],
    url: '/api/settings/mgmt/r4t7y0u3/apikeys/ollama/t4y7u0i3',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::ollama
* @see app/Http/Controllers/Api/SettingsController.php:134
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/ollama/t4y7u0i3'
*/
ollama.url = (options?: RouteQueryOptions) => {
    return ollama.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::ollama
* @see app/Http/Controllers/Api/SettingsController.php:134
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/ollama/t4y7u0i3'
*/
ollama.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: ollama.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::openrouter
* @see app/Http/Controllers/Api/SettingsController.php:165
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/openrouter/p6a9s2d5'
*/
export const openrouter = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: openrouter.url(options),
    method: 'post',
})

openrouter.definition = {
    methods: ["post"],
    url: '/api/settings/mgmt/r4t7y0u3/apikeys/openrouter/p6a9s2d5',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::openrouter
* @see app/Http/Controllers/Api/SettingsController.php:165
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/openrouter/p6a9s2d5'
*/
openrouter.url = (options?: RouteQueryOptions) => {
    return openrouter.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::openrouter
* @see app/Http/Controllers/Api/SettingsController.php:165
* @route '/api/settings/mgmt/r4t7y0u3/apikeys/openrouter/p6a9s2d5'
*/
openrouter.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: openrouter.url(options),
    method: 'post',
})

const settings = {
    profile: Object.assign(profile, profile),
    password: Object.assign(password, password),
    apikeys: Object.assign(apikeys, apikeys),
    ollama: Object.assign(ollama, ollama),
    openrouter: Object.assign(openrouter, openrouter),
    apikey: Object.assign(apikey, apikey),
    ai: Object.assign(ai, ai),
    chat: Object.assign(chat, chat),
    personal: Object.assign(personal, personal),
}

export default settings
