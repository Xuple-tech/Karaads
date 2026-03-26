import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::prefs
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:17
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/y8u1i4o7'
 */
export const prefs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})

prefs.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/chat/prefs/y8u1i4o7',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::prefs
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:17
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/y8u1i4o7'
 */
prefs.url = (options?: RouteQueryOptions) => {
    return prefs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::prefs
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:17
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/y8u1i4o7'
 */
prefs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::prefs
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:17
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/y8u1i4o7'
 */
prefs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: prefs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::update
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:53
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/update/q0w3e6r9'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/chat/prefs/update/q0w3e6r9',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::update
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:53
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/update/q0w3e6r9'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::update
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:53
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/update/q0w3e6r9'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::reset
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:127
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/reset/z2x5c8v1'
 */
export const reset = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/api/settings/mgmt/r4t7y0u3/chat/prefs/reset/z2x5c8v1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::reset
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:127
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/reset/z2x5c8v1'
 */
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::reset
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:127
 * @route '/api/settings/mgmt/r4t7y0u3/chat/prefs/reset/z2x5c8v1'
 */
reset.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::modes
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:100
 * @route '/api/settings/mgmt/r4t7y0u3/chat/modes/b4n7m0k3'
 */
export const modes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: modes.url(options),
    method: 'get',
})

modes.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/chat/modes/b4n7m0k3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::modes
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:100
 * @route '/api/settings/mgmt/r4t7y0u3/chat/modes/b4n7m0k3'
 */
modes.url = (options?: RouteQueryOptions) => {
    return modes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::modes
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:100
 * @route '/api/settings/mgmt/r4t7y0u3/chat/modes/b4n7m0k3'
 */
modes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: modes.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatPreferenceController::modes
 * @see app/Http/Controllers/Api/ChatPreferenceController.php:100
 * @route '/api/settings/mgmt/r4t7y0u3/chat/modes/b4n7m0k3'
 */
modes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: modes.url(options),
    method: 'head',
})
const chat = {
    prefs: Object.assign(prefs, prefs),
update: Object.assign(update, update),
reset: Object.assign(reset, reset),
modes: Object.assign(modes, modes),
}

export default chat