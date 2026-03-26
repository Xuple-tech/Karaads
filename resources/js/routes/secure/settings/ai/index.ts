import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SettingsController::modes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/mgmt/r4t7y0u3/ai/modes/k2j5h8g1'
 */
export const modes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: modes.url(options),
    method: 'get',
})

modes.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/ai/modes/k2j5h8g1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::modes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/mgmt/r4t7y0u3/ai/modes/k2j5h8g1'
 */
modes.url = (options?: RouteQueryOptions) => {
    return modes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::modes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/mgmt/r4t7y0u3/ai/modes/k2j5h8g1'
 */
modes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: modes.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::modes
 * @see app/Http/Controllers/Api/SettingsController.php:219
 * @route '/api/settings/mgmt/r4t7y0u3/ai/modes/k2j5h8g1'
 */
modes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: modes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::prefs
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/f4d7s0a3'
 */
export const prefs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})

prefs.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/ai/prefs/f4d7s0a3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::prefs
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/f4d7s0a3'
 */
prefs.url = (options?: RouteQueryOptions) => {
    return prefs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::prefs
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/f4d7s0a3'
 */
prefs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\SettingsController::prefs
 * @see app/Http/Controllers/Api/SettingsController.php:268
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/f4d7s0a3'
 */
prefs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: prefs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\SettingsController::update
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/update/w6e9r2t5'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/ai/prefs/update/w6e9r2t5',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\SettingsController::update
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/update/w6e9r2t5'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SettingsController::update
 * @see app/Http/Controllers/Api/SettingsController.php:240
 * @route '/api/settings/mgmt/r4t7y0u3/ai/prefs/update/w6e9r2t5'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})
const ai = {
    modes: Object.assign(modes, modes),
prefs: Object.assign(prefs, prefs),
update: Object.assign(update, update),
}

export default ai