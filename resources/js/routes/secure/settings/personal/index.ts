import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PersonalizationController::prefs
 * @see app/Http/Controllers/Api/PersonalizationController.php:21
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
 */
export const prefs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})

prefs.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::prefs
 * @see app/Http/Controllers/Api/PersonalizationController.php:21
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
 */
prefs.url = (options?: RouteQueryOptions) => {
    return prefs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::prefs
 * @see app/Http/Controllers/Api/PersonalizationController.php:21
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
 */
prefs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: prefs.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PersonalizationController::prefs
 * @see app/Http/Controllers/Api/PersonalizationController.php:21
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/h6g9f2d5'
 */
prefs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: prefs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::update
 * @see app/Http/Controllers/Api/PersonalizationController.php:91
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::update
 * @see app/Http/Controllers/Api/PersonalizationController.php:91
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::update
 * @see app/Http/Controllers/Api/PersonalizationController.php:91
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/update/j8k1l4z7'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::reset
 * @see app/Http/Controllers/Api/PersonalizationController.php:279
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
 */
export const reset = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

reset.definition = {
    methods: ["post"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::reset
 * @see app/Http/Controllers/Api/PersonalizationController.php:279
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
 */
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::reset
 * @see app/Http/Controllers/Api/PersonalizationController.php:279
 * @route '/api/settings/mgmt/r4t7y0u3/personal/prefs/reset/s0a3d6f9'
 */
reset.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reset.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::templates
 * @see app/Http/Controllers/Api/PersonalizationController.php:188
 * @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
 */
export const templates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

templates.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::templates
 * @see app/Http/Controllers/Api/PersonalizationController.php:188
 * @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
 */
templates.url = (options?: RouteQueryOptions) => {
    return templates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::templates
 * @see app/Http/Controllers/Api/PersonalizationController.php:188
 * @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
 */
templates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PersonalizationController::templates
 * @see app/Http/Controllers/Api/PersonalizationController.php:188
 * @route '/api/settings/mgmt/r4t7y0u3/personal/templates/p2o5i8u1'
 */
templates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templates.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::ai
 * @see app/Http/Controllers/Api/PersonalizationController.php:210
 * @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
 */
export const ai = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ai.url(options),
    method: 'get',
})

ai.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::ai
 * @see app/Http/Controllers/Api/PersonalizationController.php:210
 * @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
 */
ai.url = (options?: RouteQueryOptions) => {
    return ai.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::ai
 * @see app/Http/Controllers/Api/PersonalizationController.php:210
 * @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
 */
ai.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ai.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PersonalizationController::ai
 * @see app/Http/Controllers/Api/PersonalizationController.php:210
 * @route '/api/settings/mgmt/r4t7y0u3/personal/ai/modes/c4v7b0n3'
 */
ai.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ai.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PersonalizationController::desc
 * @see app/Http/Controllers/Api/PersonalizationController.php:231
 * @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
 */
export const desc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: desc.url(options),
    method: 'get',
})

desc.definition = {
    methods: ["get","head"],
    url: '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PersonalizationController::desc
 * @see app/Http/Controllers/Api/PersonalizationController.php:231
 * @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
 */
desc.url = (options?: RouteQueryOptions) => {
    return desc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PersonalizationController::desc
 * @see app/Http/Controllers/Api/PersonalizationController.php:231
 * @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
 */
desc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: desc.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PersonalizationController::desc
 * @see app/Http/Controllers/Api/PersonalizationController.php:231
 * @route '/api/settings/mgmt/r4t7y0u3/personal/descriptions/x6z9a2s5'
 */
desc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: desc.url(options),
    method: 'head',
})
const personal = {
    prefs: Object.assign(prefs, prefs),
update: Object.assign(update, update),
reset: Object.assign(reset, reset),
templates: Object.assign(templates, templates),
ai: Object.assign(ai, ai),
desc: Object.assign(desc, desc),
}

export default personal